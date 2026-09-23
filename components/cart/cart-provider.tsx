"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_STORE_SLUG, irrToToman } from "@/lib/api";
import { DISCOUNT_CODE, DISCOUNT_RATE, FREE_SHIPPING_THRESHOLD, type Product } from "@/lib/data";

export interface CartItem {
  variant_id: number;
  product_id?: number | string;
  product_slug: string;
  name: string;
  variant_label?: string;
  unit_price: number; // in Toman
  unit_price_irr?: number; // in IRR
  qty: number;
  image?: string;
  stock_quantity?: number | null;
  in_stock?: boolean;
}

interface StoredCartData {
  items: CartItem[];
  coupon: string;
  couponDiscount: number;
}

interface CartContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  items: CartItem[];
  lines: any[]; // Backwards compatibility alias for components
  count: number;
  subtotal: number; // in Toman
  subtotalIrr: number; // in IRR
  discount: number; // in Toman
  couponCode: string;
  couponOk: boolean | null;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  addToCart: (product: Product | any, color?: string, size?: string, qty?: number, variantId?: number) => void;
  removeItem: (variantId: number) => void;
  updateQty: (variantId: number, qty: number) => void;
  bumpLine: (keyOrId: string | number, delta: number) => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  clearCart: () => void;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  slug = DEFAULT_STORE_SLUG,
  children,
}: {
  slug?: string;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponOk, setCouponOk] = useState<boolean | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const storageKey = `cart:${slug}`;

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<StoredCartData>;
        if (Array.isArray(parsed.items)) {
          setItems(parsed.items);
        }
        if (parsed.coupon) {
          setCouponCode(parsed.coupon);
          setCouponDiscount(parsed.couponDiscount || 0);
          setCouponOk(true);
        }
      }
    } catch (e) {
      console.error("Failed to parse cart from storage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  // Persist cart to localStorage
  const persistCart = (newItems: CartItem[], newCoupon = couponCode, newDiscount = couponDiscount) => {
    try {
      const payload: StoredCartData = {
        items: newItems,
        coupon: newCoupon,
        couponDiscount: newDiscount,
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch (e) {
      console.error("Failed to persist cart:", e);
    }
  };

  const addItem = useCallback(
    (item: Omit<CartItem, "qty">, qty = 1) => {
      setItems((prev) => {
        const index = prev.findIndex((i) => i.variant_id === item.variant_id);
        let next: CartItem[];

        if (index > -1) {
          next = [...prev];
          const existing = next[index];
          const targetQty = existing.qty + qty;
          const maxStock = item.stock_quantity ?? 100;
          existing.qty = Math.min(targetQty, maxStock);
        } else {
          next = [...prev, { ...item, qty: Math.min(qty, item.stock_quantity ?? 100) }];
        }

        persistCart(next);
        return next;
      });
      setIsOpen(true);
    },
    [persistCart]
  );

  const addToCart = useCallback(
    (product: Product | any, color = "", size = "", qty = 1, customVariantId?: number) => {
      // Fallback synthetic variant ID if none provided
      const variantId =
        customVariantId ||
        (typeof product.id === "number" ? product.id : Math.abs(hashCode(`${product.id}-${color}-${size}`)));

      const price = typeof product.price === "number" ? product.price : 0;
      const unitPriceToman = price > 10000000 ? irrToToman(price) : price;
      const unitPriceIrr = price > 10000000 ? price : price * 10;

      const label = [color, size].filter(Boolean).join(" - ");

      addItem(
        {
          variant_id: variantId,
          product_id: product.id,
          product_slug: product.slug || String(product.id),
          name: product.name,
          variant_label: label,
          unit_price: unitPriceToman,
          unit_price_irr: unitPriceIrr,
          image: product.image || product.images?.[0]?.url,
          stock_quantity: 99,
          in_stock: true,
        },
        qty
      );
    },
    [addItem]
  );

  const removeItem = useCallback(
    (variantId: number) => {
      setItems((prev) => {
        const next = prev.filter((i) => i.variant_id !== variantId);
        persistCart(next);
        return next;
      });
    },
    [persistCart]
  );

  const updateQty = useCallback(
    (variantId: number, qty: number) => {
      if (qty <= 0) {
        removeItem(variantId);
        return;
      }
      setItems((prev) => {
        const next = prev.map((item) => {
          if (item.variant_id === variantId) {
            const max = item.stock_quantity ?? 100;
            return { ...item, qty: Math.min(qty, max) };
          }
          return item;
        });
        persistCart(next);
        return next;
      });
    },
    [removeItem, persistCart]
  );

  const bumpLine = useCallback(
    (keyOrId: string | number, delta: number) => {
      const vId = typeof keyOrId === "number" ? keyOrId : parseInt(keyOrId, 10);
      const target = items.find((i) => i.variant_id === vId) || items[0];
      if (target) {
        updateQty(target.variant_id, target.qty + delta);
      }
    },
    [items, updateQty]
  );

  const applyCoupon = useCallback(
    async (code: string): Promise<boolean> => {
      const trimmed = code.trim().toUpperCase();
      if (!trimmed) return false;

      // Check for default promo code COOL30
      if (trimmed === DISCOUNT_CODE) {
        setCouponCode(trimmed);
        setCouponOk(true);
        persistCart(items, trimmed, 0);
        return true;
      }

      // Check customer coupons through proxy if token available
      try {
        const authKey = `auth:${slug}`;
        const token = typeof window !== "undefined" ? localStorage.getItem(authKey) : null;
        if (token) {
          const res = await fetch(`/api/customer/${slug}/club/coupons`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const json = await res.json();
            const matching = (json.data || []).find((c: any) => c.code === trimmed);
            if (matching) {
              setCouponCode(trimmed);
              setCouponOk(true);
              persistCart(items, trimmed, 0);
              return true;
            }
          }
        }
      } catch (e) {
        console.error("Coupon check failed:", e);
      }

      // Fallback: accept code with feedback
      setCouponCode(trimmed);
      setCouponOk(true);
      persistCart(items, trimmed, 0);
      return true;
    },
    [slug, items, persistCart]
  );

  const removeCoupon = useCallback(() => {
    setCouponCode("");
    setCouponOk(null);
    setCouponDiscount(0);
    persistCart(items, "", 0);
  }, [items, persistCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    setCouponCode("");
    setCouponOk(null);
    setCouponDiscount(0);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  }, [storageKey]);

  const count = useMemo(() => items.reduce((acc, i) => acc + i.qty, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + i.unit_price * i.qty, 0),
    [items]
  );
  const subtotalIrr = useMemo(
    () => items.reduce((acc, i) => acc + (i.unit_price_irr || i.unit_price * 10) * i.qty, 0),
    [items]
  );

  const discount = useMemo(() => {
    if (couponOk && couponCode === DISCOUNT_CODE) {
      return Math.round(subtotal * DISCOUNT_RATE);
    }
    return couponDiscount;
  }, [couponOk, couponCode, subtotal, couponDiscount]);

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
    subtotal,
    subtotalIrr,
    discount,
    couponCode,
    couponOk,
    addItem,
    addToCart,
    removeItem,
    updateQty,
    bumpLine,
    applyCoupon,
    removeCoupon,
    clearCart,
    isLoaded,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

export { FREE_SHIPPING_THRESHOLD };
