"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  DISCOUNT_CODE,
  DISCOUNT_RATE,
  FREE_SHIPPING_THRESHOLD,
  getProductById,
  type Product,
} from "@/lib/data";

const STORAGE_KEY = "cool-gallery-cart";

export interface CartLine {
  key: string;
  product: Product;
  color: string;
  size: string;
  qty: number;
}

interface StoredCart {
  lines: Record<string, number>;
  coupon: string;
  couponOk: boolean | null;
}

const EMPTY_CART: StoredCart = { lines: {}, coupon: "", couponOk: null };

function parseStoredCart(raw: string | null): StoredCart {
  if (!raw) return EMPTY_CART;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredCart>;
    return { lines: parsed.lines ?? {}, coupon: parsed.coupon ?? "", couponOk: parsed.couponOk ?? null };
  } catch {
    return EMPTY_CART;
  }
}

/**
 * The cart lives in localStorage, not React state — components read it via
 * useSyncExternalStore so the server snapshot (empty) and the real
 * client-side value reconcile without a hydration-effect + setState dance.
 */
const cartStore = (() => {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null = null;
  let cachedSnapshot: StoredCart = EMPTY_CART;

  function readRaw(): string | null {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function subscribe(onChange: () => void) {
    listeners.add(onChange);
    window.addEventListener("storage", onChange);
    return () => {
      listeners.delete(onChange);
      window.removeEventListener("storage", onChange);
    };
  }

  function getSnapshot(): StoredCart {
    const raw = readRaw();
    if (raw === cachedRaw) return cachedSnapshot;
    cachedRaw = raw;
    cachedSnapshot = parseStoredCart(raw);
    return cachedSnapshot;
  }

  function getServerSnapshot(): StoredCart {
    return EMPTY_CART;
  }

  function write(next: StoredCart) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore (private browsing, storage disabled, etc.)
    }
    cachedRaw = null;
    listeners.forEach((l) => l());
  }

  function update(updater: (prev: StoredCart) => StoredCart) {
    write(updater(getSnapshot()));
  }

  return { subscribe, getSnapshot, getServerSnapshot, update };
})();

interface CartContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  lines: CartLine[];
  count: number;
  subtotal: number;
  discount: number;
  couponCode: string;
  couponOk: boolean | null;
  addToCart: (product: Product, color: string, size: string, qty: number) => void;
  bumpLine: (key: string, delta: number) => void;
  applyCoupon: (code: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function lineKey(productId: string, color: string, size: string) {
  return [productId, color, size].join("|");
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const cart = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);

  const addToCart = useCallback((product: Product, color: string, size: string, qty: number) => {
    const key = lineKey(product.id, color, size);
    cartStore.update((prev) => ({
      ...prev,
      lines: { ...prev.lines, [key]: (prev.lines[key] ?? 0) + qty },
    }));
    setIsOpen(true);
  }, []);

  const bumpLine = useCallback((key: string, delta: number) => {
    cartStore.update((prev) => {
      const lines = { ...prev.lines };
      const nextQty = (lines[key] ?? 0) + delta;
      if (nextQty <= 0) delete lines[key];
      else lines[key] = nextQty;
      return { ...prev, lines };
    });
  }, []);

  const applyCoupon = useCallback((code: string) => {
    cartStore.update((prev) => ({ ...prev, coupon: code, couponOk: code.trim().toUpperCase() === DISCOUNT_CODE }));
  }, []);

  const clearCart = useCallback(() => {
    cartStore.update(() => EMPTY_CART);
  }, []);

  const lines = useMemo<CartLine[]>(() => {
    return Object.entries(cart.lines)
      .map(([key, qty]) => {
        const [productId, color, size] = key.split("|");
        const product = getProductById(productId);
        if (!product) return null;
        return { key, product, color, size, qty };
      })
      .filter((line): line is CartLine => line !== null);
  }, [cart.lines]);

  const count = useMemo(() => lines.reduce((acc, l) => acc + l.qty, 0), [lines]);
  const subtotal = useMemo(
    () => lines.reduce((acc, l) => acc + l.product.price * l.qty, 0),
    [lines],
  );
  const discount = cart.couponOk ? Math.round(subtotal * DISCOUNT_RATE) : 0;

  const value: CartContextValue = {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    lines,
    count,
    subtotal,
    discount,
    couponCode: cart.coupon,
    couponOk: cart.couponOk,
    addToCart,
    bumpLine,
    clearCart,
    applyCoupon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

export { FREE_SHIPPING_THRESHOLD };
