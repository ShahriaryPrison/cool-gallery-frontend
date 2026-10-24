import type { StorefrontShippingMethod } from '@/lib/types';

/**
 * How much of the shipping fee a club free-shipping code takes off: all of it,
 * or up to the reward's cap. Zero for any other code or an invalid one.
 */
export function couponShippingDiscount(
  coupon: { valid: boolean; free_shipping?: boolean; max_shipping_discount?: number | null } | null | undefined,
  fee: number,
): number {
  if (!coupon?.valid || !coupon.free_shipping) return 0;

  return Math.min(fee, coupon.max_shipping_discount ?? fee);
}

/** What a delivery method costs for this subtotal (IRR): its fee, or 0 at or above its free line; پس‌کرایه charges nothing here. */
export function methodFee(method: StorefrontShippingMethod, subtotal: number): number {
  if (method.collect_on_delivery) return 0;
  return method.free_over !== null && subtotal >= method.free_over ? 0 : method.flat_fee;
}

/** How much more to spend for a method to ship free, or null when it doesn't apply. */
export function remainingForMethodFree(method: StorefrontShippingMethod, subtotal: number): number | null {
  if (method.collect_on_delivery || method.free_over === null || !method.flat_fee || subtotal >= method.free_over) return null;
  return method.free_over - subtotal;
}

/** The methods that reach this province (all of them before a province is picked). */
export function methodsForProvince(methods: StorefrontShippingMethod[], province: string): StorefrontShippingMethod[] {
  return methods.filter((m) => !province || !m.provinces?.length || m.provinces.includes(province));
}

/** The method an order gets when the buyer picks none — the first one, as checkout does. */
export function defaultMethod(methods: StorefrontShippingMethod[]): StorefrontShippingMethod | null {
  return methods[0] ?? null;
}

export interface FreeShippingProgress {
  /** The method's free line (IRR). */
  threshold: number;
  /** Still to spend (IRR); 0 once reached. */
  remaining: number;
  /** 0–100, how far the cart is toward the line. */
  percent: number;
  reached: boolean;
}

/**
 * How far the cart is toward a method's free shipping, or null when there is no
 * line to reach: no method, پس‌کرایه, no free line, no fee to waive, or a
 * free-shipping code already covers it.
 */
export function freeShippingProgress(
  method: StorefrontShippingMethod | null | undefined,
  subtotal: number,
  coupon?: { valid: boolean; free_shipping?: boolean } | null,
): FreeShippingProgress | null {
  if (!method || method.collect_on_delivery || method.free_over === null || method.free_over <= 0 || !method.flat_fee) return null;
  if (coupon?.valid && coupon.free_shipping) return null;

  const threshold = method.free_over;
  const remaining = Math.max(0, threshold - subtotal);
  return {
    threshold,
    remaining,
    percent: Math.min(100, Math.max(0, Math.round((subtotal / threshold) * 100))),
    reached: remaining === 0,
  };
}
