'use server';

import { API_BASE, DEFAULT_STORE_SLUG } from '@/lib/api';

export interface CheckoutShippingPayload {
  recipient_name?: string;
  phone?: string;
  province: string;
  city: string;
  address: string;
  postal_code?: string | null;
}

export interface CheckoutPayload {
  items: { variant_id: number; qty: number }[];
  shipping: CheckoutShippingPayload;
  coupon_code: string | null;
  note: string | null;
  gateway?: string | null;
}

export interface CheckoutResult {
  success: boolean;
  status: number;
  data?: {
    order_reference: string;
    payment_url: string;
    expires_at: string;
  };
  errors?: Record<string, string[]> | null;
  message?: string;
}

export async function submitCheckoutAction(
  slug: string = DEFAULT_STORE_SLUG,
  idempotencyKey: string,
  payload: CheckoutPayload,
  token: string
): Promise<CheckoutResult> {
  const storeSlug = slug || DEFAULT_STORE_SLUG;
  try {
    const res = await fetch(`${API_BASE}/${storeSlug}/sites/storefront/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const status = res.status;
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        status,
        errors: json.errors || null,
        message: json.message || 'ثبت سفارش با خطا مواجه شد. لطفاً دوباره تلاش کنید.',
      };
    }

    return {
      success: true,
      status,
      data: json.data as { order_reference: string; payment_url: string; expires_at: string },
    };
  } catch (error: any) {
    console.error('Checkout action server error:', error);
    return {
      success: false,
      status: 500,
      errors: null,
      message: 'خطا در برقراری ارتباط با سرور پرداخت. لطفاً اینترنت خود را بررسی و دوباره تلاش کنید.',
    };
  }
}
