"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { DEFAULT_STORE_SLUG, irrToToman } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Product } from "@/lib/data";
import { CATALOG_ONLY_MESSAGE, useSiteFeatures } from "@/components/site-features";
import type { ProductSummary } from "@/lib/types";

/**
 * The cart lives on the server (Avval: /sites/storefront/customer/cart) and
 * belongs to the signed-in customer — there are no guest carts. Adding to the
 * cart while signed out opens the login dialog and finishes the add once the
 * customer is in. The club's abandoned-cart campaign reads this same server
 * cart, so nothing about the cart is kept in the browser.
 *
 * The server speaks IRR; the context exposes Toman (unit_price, subtotal,
 * discount…) because that is what this template renders.
 */

/** A cart line as the server returns it (amounts in IRR). */
interface ServerCartItem {
  variant_id: number;
  product_id?: number;
  product_slug: string;
  name: string;
  variant_label: string;
  unit_price: number;
  compare_at_price?: number | null;
  line_total?: number;
  qty: number;
  image?: string | null;
  stock_quantity: number | null;
  in_stock: boolean;
  available?: boolean;
  notice?: CartNotice;
}

type CartNotice = "unavailable" | "out_of_stock" | "qty_reduced" | null;

export interface CartCoupon {
  code: string;
  valid: boolean;
  discount_amount: number;
  /** A free-shipping code (a club reward): nothing off the items, the shipping fee drops instead. */
  free_shipping?: boolean;
  max_shipping_discount?: number | null;
  message: string | null;
}

/** The club's cross-sell offer that comes with the cart (amounts in IRR). */
export interface CartOfferResult {
  eligible: boolean;
  discount_amount: number;
  applied_to: string | null;
  offer: {
    type: "cross_sell";
    headline: string;
    discount_type: "percentage" | "fixed_amount";
    discount_value: number;
    max_discount_amount: number | null;
    trigger_max_items: number;
    product_ids: number[];
    products?: ProductSummary[];
  } | null;
}

const NO_OFFER: CartOfferResult = { eligible: false, discount_amount: 0, applied_to: null, offer: null };

/** The cart as the server returns it. */
interface CartSummary {
  items: ServerCartItem[];
  item_count: number;
  original_subtotal: number;
  product_discount: number;
  subtotal: number;
  coupon: CartCoupon | null;
  offer: CartOfferResult;
  offer_discount: number;
  total: number;
  updated_at: string | null;
}

const EMPTY_CART: CartSummary = {
  items: [],
  item_count: 0,
  original_subtotal: 0,
  product_discount: 0,
  subtotal: 0,
  coupon: null,
  offer: NO_OFFER,
  offer_discount: 0,
  total: 0,
  updated_at: null,
};

export interface CartItem {
  variant_id: number;
  product_id?: number | string;
  product_slug: string;
  name: string;
  variant_label?: string;
  unit_price: number; // in Toman
  unit_price_irr?: number; // in IRR
  compare_at_price?: number | null; // in Toman
  qty: number;
  image?: string;
  stock_quantity?: number | null;
  in_stock?: boolean;
  /** false: no longer purchasable (inactive / out of stock) — shown, not counted. */
  available?: boolean;
  notice?: CartNotice;
}

export type AddResult =
  | { ok: true }
  | { ok: false; reason: "login_required" | "error"; message?: string };

interface CartContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  items: CartItem[];
  lines: any[]; // Backwards compatibility alias for components
  count: number;
  subtotal: number; // in Toman, after product discounts
  subtotalIrr: number; // in IRR
  /** Coupon + club offer discount, in Toman. */
  discount: number;
  /** What the server will charge for the items, in Toman. */
  total: number;
  coupon: CartCoupon | null;
  couponCode: string;
  couponOk: boolean | null;
  offer: CartOfferResult;
  offerDiscount: number; // in Toman
  /** Only variant_id is sent; the rest is accepted for callers that already have it. */
  addItem: (item: Pick<CartItem, "variant_id"> & Partial<CartItem>, qty?: number) => Promise<AddResult>;
  addToCart: (product: Product | any, color?: string, size?: string, qty?: number, variantId?: number) => Promise<AddResult>;
  removeItem: (variantId: number) => void;
  updateQty: (variantId: number, qty: number) => void;
  bumpLine: (keyOrId: string | number, delta: number) => void;
  /** Apply a discount code to the cart; message explains a refusal. */
  applyCoupon: (code: string) => Promise<{ ok: boolean; message?: string }>;
  removeCoupon: () => Promise<void>;
  clearCart: () => void;
  /** Re-read the cart, e.g. after a paid order emptied it on the server. */
  refresh: () => Promise<void>;
  isLoaded: boolean;
  isSignedIn: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextValue | null>(null);

const ERROR_MESSAGE = "به‌روزرسانی سبد خرید ناموفق بود؛ دوباره تلاش کنید.";

function toItem(i: ServerCartItem): CartItem {
  return {
    variant_id: i.variant_id,
    product_id: i.product_id,
    product_slug: i.product_slug,
    name: i.name,
    variant_label: i.variant_label,
    unit_price: irrToToman(i.unit_price),
    unit_price_irr: i.unit_price,
    compare_at_price: i.compare_at_price ? irrToToman(i.compare_at_price) : null,
    qty: i.qty,
    image: i.image ?? undefined,
    stock_quantity: i.stock_quantity,
    in_stock: i.in_stock,
    available: i.available,
    notice: i.notice ?? null,
  };
}

export function CartProvider({
  slug = DEFAULT_STORE_SLUG,
  children,
}: {
  slug?: string;
  children: ReactNode;
}) {
  const auth = useAuth();
  const token = auth.token;
  const authLoaded = auth.isLoaded;
  const { checkout: checkoutEnabled } = useSiteFeatures();

  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<CartSummary>(EMPTY_CART);
  const [loadedFor, setLoadedFor] = useState<string | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // Responses are applied only if they answer the latest request, so fast
  // clicks on a quantity stepper can't land out of order.
  const seq = useRef(0);
  // An add made while signed out, finished once the customer logs in.
  const pendingAdd = useRef<{ variant_id: number; qty: number } | null>(null);

  // The cart used to be kept in the browser; drop that copy for good.
  useEffect(() => {
    try {
      localStorage.removeItem(`cart:${slug}`);
    } catch {
      // storage unavailable — nothing to clean up
    }
  }, [slug]);

  const request = useCallback(
    async (method: string, path: string, body?: unknown): Promise<{ ok: boolean; message?: string }> => {
      if (!token) return { ok: false };
      const mine = ++seq.current;

      try {
        const res = await fetch(`/api/customer/${slug}/cart${path}`, {
          method,
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: body === undefined ? undefined : JSON.stringify(body),
        });
        const json = await res.json().catch(() => null);

        if (!res.ok) {
          return { ok: false, message: json?.message ?? ERROR_MESSAGE };
        }
        if (mine === seq.current && json?.data) {
          setCart(json.data as CartSummary);
        }
        return { ok: true };
      } catch {
        return { ok: false, message: ERROR_MESSAGE };
      }
    },
    [slug, token]
  );

  const refresh = useCallback(async () => {
    if (!token) return;
    await request("GET", "");
  }, [request, token]);

  // Load the cart whenever the signed-in customer changes; signed out = empty.
  useEffect(() => {
    if (!authLoaded) return;

    if (!token) {
      seq.current++;
      setCart(EMPTY_CART);
      setLoadedFor(null);
      return;
    }

    let cancelled = false;
    (async () => {
      await request("GET", "");
      if (cancelled) return;
      setLoadedFor(token);

      const pending = pendingAdd.current;
      if (pending) {
        pendingAdd.current = null;
        const res = await request("POST", "/items", pending);
        if (res.ok) setIsOpen(true);
        else setError(res.message ?? ERROR_MESSAGE);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoaded, token, request]);

  const addItem = useCallback<CartContextValue["addItem"]>(
    async (item, qty = 1) => {
      setError(null);
      // Catalog-only store: nothing goes in a cart it can't check out.
      if (!checkoutEnabled) return { ok: false, reason: "error", message: CATALOG_ONLY_MESSAGE };
      const line = { variant_id: item.variant_id, qty: Math.max(1, Math.min(qty, 100)) };

      if (!token) {
        pendingAdd.current = line;
        auth.openLogin(typeof window !== "undefined" ? window.location.pathname + window.location.search : undefined);
        return { ok: false, reason: "login_required" };
      }

      const res = await request("POST", "/items", line);
      if (!res.ok) {
        setError(res.message ?? ERROR_MESSAGE);
        return { ok: false, reason: "error", message: res.message };
      }
      setIsOpen(true);
      return { ok: true };
    },
    [auth, checkoutEnabled, request, token]
  );

  const addToCart = useCallback<CartContextValue["addToCart"]>(
    (product, _color = "", _size = "", qty = 1, customVariantId) => {
      const variantId = customVariantId ?? product.variantId;
      if (typeof variantId !== "number") {
        return Promise.resolve({
          ok: false,
          reason: "error",
          message: "برای انتخاب مدل، صفحه محصول را باز کنید.",
        } as AddResult);
      }
      return addItem({ variant_id: variantId }, qty);
    },
    [addItem]
  );

  /** Optimistic change: show it now, keep the server's answer, roll back on failure. */
  const mutate = useCallback(
    async (
      optimistic: (items: ServerCartItem[]) => ServerCartItem[],
      method: string,
      path: string,
      body?: unknown
    ) => {
      setError(null);
      const before = cart;
      setCart((c) => ({ ...c, items: optimistic(c.items) }));

      const res = await request(method, path, body);
      if (!res.ok) {
        setCart(before);
        setError(res.message ?? ERROR_MESSAGE);
      }
    },
    [cart, request]
  );

  const removeItem = useCallback(
    (variantId: number) => {
      void mutate((items) => items.filter((i) => i.variant_id !== variantId), "DELETE", `/items/${variantId}`);
    },
    [mutate]
  );

  const updateQty = useCallback(
    (variantId: number, qty: number) => {
      if (qty < 1) {
        removeItem(variantId);
        return;
      }
      void mutate(
        (items) => items.map((i) => (i.variant_id === variantId ? { ...i, qty } : i)),
        "PATCH",
        `/items/${variantId}`,
        { qty }
      );
    },
    [mutate, removeItem]
  );

  const bumpLine = useCallback(
    (keyOrId: string | number, delta: number) => {
      const vId = typeof keyOrId === "number" ? keyOrId : parseInt(keyOrId, 10);
      const target = cart.items.find((i) => i.variant_id === vId);
      if (target) updateQty(target.variant_id, target.qty + delta);
    },
    [cart.items, updateQty]
  );

  const applyCoupon = useCallback(
    async (code: string) => {
      const trimmed = code.trim();
      if (!trimmed) return { ok: false, message: "کد تخفیف را وارد کنید." };
      const res = await request("POST", "/coupon", { code: trimmed });
      return res.ok ? { ok: true } : { ok: false, message: res.message ?? "کد تخفیف معتبر نیست." };
    },
    [request]
  );

  const removeCoupon = useCallback(async () => {
    await request("DELETE", "/coupon");
  }, [request]);

  const clearCart = useCallback(() => {
    void mutate(() => [], "DELETE", "");
  }, [mutate]);

  const items = useMemo(() => cart.items.map(toItem), [cart.items]);
  const count = useMemo(
    () => items.filter((i) => i.available !== false).reduce((acc, i) => acc + i.qty, 0),
    [items]
  );

  const offer = cart.offer ?? NO_OFFER;
  const subtotalIrr = cart.subtotal;
  const offerDiscountIrr = Math.min(cart.offer_discount ?? 0, subtotalIrr);
  const totalIrr = cart.total;

  // Backwards-compatible lines mapper for template components
  const lines = useMemo(
    () =>
      items.map((i) => ({
        key: String(i.variant_id),
        variant_id: i.variant_id,
        product: {
          id: String(i.product_id || i.variant_id),
          name: i.name,
          slug: i.product_slug,
          price: i.unit_price,
          image: i.image || "/products/fidget-dragon-black.png",
          cat: "محصول",
        },
        color: i.variant_label?.split(" - ")[0] || "",
        size: i.variant_label?.split(" - ")[1] || "",
        qty: i.qty,
        available: i.available,
        notice: i.notice,
      })),
    [items]
  );

  const value: CartContextValue = {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    items,
    lines,
    count,
    subtotal: irrToToman(subtotalIrr),
    subtotalIrr,
    discount: irrToToman(subtotalIrr - totalIrr),
    total: irrToToman(totalIrr),
    coupon: cart.coupon,
    couponCode: cart.coupon?.code ?? "",
    couponOk: cart.coupon ? cart.coupon.valid : null,
    offer,
    offerDiscount: irrToToman(offerDiscountIrr),
    addItem,
    addToCart,
    removeItem,
    updateQty,
    bumpLine,
    applyCoupon,
    removeCoupon,
    clearCart,
    refresh,
    isLoaded: authLoaded && loadedFor !== undefined && (token === null || loadedFor === token),
    isSignedIn: Boolean(token),
    error,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

/** Tell the shopper how an add went: done, log in first, or why it failed. */
export function toastAddResult(result: AddResult, success = "به سبد خرید افزوده شد") {
  if (result.ok) toast.success(success);
  else if (result.reason === "login_required") toast.info("برای افزودن به سبد خرید، ابتدا وارد حساب کاربری خود شوید");
  else toast.error(result.message ?? "افزودن به سبد خرید ناموفق بود.");
}

/** Persian label for a line the server flagged. */
export function cartNoticeLabel(notice: CartNotice | undefined): string | null {
  if (!notice) return null;
  if (notice === "qty_reduced") return "موجودی کم شد؛ تعداد اصلاح شد";
  if (notice === "out_of_stock") return "ناموجود — در سفارش حساب نمی‌شود";
  return "دیگر در دسترس نیست — در سفارش حساب نمی‌شود";
}

