"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  ArrowLeft,
  Truck,
  MapPin,
  Phone,
  Receipt,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { formatIrrAsToman, irrToToman } from "@/lib/api";
import { formatToman, toFaDigits } from "@/lib/format";
import type { OrderDetail } from "@/lib/types";

export default function OrderTrackingPage() {
  const params = useParams<{ reference: string }>();
  const reference = params.reference;
  const auth = useAuth();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) return;

    async function loadOrder() {
      try {
        setLoading(true);
        const headers: Record<string, string> = {};
        if (auth.token) {
          headers["Authorization"] = `Bearer ${auth.token}`;
        }

        const res = await fetch(`/api/customer/${auth.slug}/orders/${reference}`, {
          headers,
        });

        if (res.status === 401) {
          setError("برای مشاهده جزئیات این سفارش لطفاً ابتدا وارد حساب کاربری خود شوید.");
          return;
        }

        if (!res.ok) {
          setError("سفارش با این شماره پیگیری یافت نشد.");
          return;
        }

        const json = await res.json();
        setOrder(json.data);
      } catch (e) {
        setError("خطا در برقراری ارتباط با سرور.");
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [reference, auth.slug, auth.token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="size-10 border-2 border-white/20 border-t-brand rounded-full animate-spin" />
        <div className="text-ink-4 text-[13px]">در حال دریافت اطلاعات سفارش...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-[500px] px-5 pt-20 pb-16 text-center">
        <div className="glass mx-auto grid size-20 place-items-center rounded-3xl border border-rose-500/20 text-rose-400">
          <XCircle className="size-10" />
        </div>
        <h2 className="text-white text-[20px] font-black mt-5">پیگیری سفارش</h2>
        <p className="text-ink-3 text-[13.5px] mt-2 leading-relaxed">{error || "سفارش مورد نظر یافت نشد."}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/shop"
            className="glass-brand rounded-2xl px-6 py-3.5 text-[13.5px] font-bold text-white shadow-[0_4px_16px_rgba(255,45,60,0.25)]"
          >
            بازگشت به فروشگاه
          </Link>
          {!auth.customer && (
            <button
              type="button"
              onClick={() => auth.openLogin(`/order/${reference}`)}
              className="glass rounded-2xl px-6 py-3.5 text-[13.5px] font-bold text-white hover:bg-white/10"
            >
              ورود به حساب کاربری
            </button>
          )}
        </div>
      </div>
    );
  }

  const isSuccess = order.payment_status === "paid" || order.status === "confirmed" || order.status === "completed";
  const isPending = order.payment_status === "pending";

  return (
    <div className="mx-auto max-w-[840px] px-5 pt-6 pb-20 lg:pt-12">
      {/* Header Badge */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel overflow-hidden rounded-[28px] border border-white/10 p-6 text-center sm:p-8"
      >
        <div
          className={`mx-auto grid size-16 place-items-center rounded-2xl ${
            isSuccess
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.2)]"
              : isPending
              ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="size-8" />
          ) : isPending ? (
            <Clock className="size-8" />
          ) : (
            <XCircle className="size-8" />
          )}
        </div>

        <h1 className="text-white text-[22px] sm:text-[26px] font-black mt-4">
          {isSuccess ? "سفارش شما با موفقیت ثبت شد" : isPending ? "سفارش در انتظار پرداخت" : "پرداخت ناموفق یا لغو شده"}
        </h1>

        <div className="text-ink-4 text-[13px] mt-1.5 flex items-center justify-center gap-2">
          <span>کد رهگیری سفارش:</span>
          <span className="font-mono font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-lg">
            {order.reference_number}
          </span>
        </div>

        {order.status_label && (
          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/15 border border-brand/30 px-3.5 py-1 text-[12px] font-bold text-brand">
              <Package className="size-3.5" />
              <span>وضعیت: {order.status_label}</span>
            </span>
          </div>
        )}
      </motion.div>

      {/* Order Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Shipping Address */}
        <div className="glass-panel rounded-3xl p-5 border border-white/8">
          <div className="flex items-center gap-2 text-[14.5px] font-bold text-white mb-3">
            <MapPin className="size-4 text-brand" />
            <span>اطلاعات تحویل‌گیرنده</span>
          </div>
          <div className="space-y-2 text-[12.5px] text-ink-3">
            <div className="flex justify-between">
              <span className="text-ink-4">گیرنده:</span>
              <span className="text-white font-medium">{order.shipping.recipient_name || order.customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-4">شماره تماس:</span>
              <span className="text-white font-medium" dir="ltr">{toFaDigits(order.shipping.phone || order.customer.phone)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-4">استان و شهر:</span>
              <span className="text-white font-medium">{[order.shipping.province, order.shipping.city].filter(Boolean).join("، ") || "—"}</span>
            </div>
            <div className="pt-2 border-t border-white/6 text-ink-2 leading-relaxed">
              <span className="text-ink-4 block text-[11px] mb-0.5">آدرس:</span>
              {order.shipping.address}
            </div>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="glass-panel rounded-3xl p-5 border border-white/8">
          <div className="flex items-center gap-2 text-[14.5px] font-bold text-white mb-3">
            <Receipt className="size-4 text-brand" />
            <span>اطلاعات فاکتور</span>
          </div>
          <div className="space-y-2 text-[12.5px] text-ink-3">
            <div className="flex justify-between">
              <span className="text-ink-4">مبلغ کالاها:</span>
              <span className="text-white font-medium">{formatIrrAsToman(order.subtotal_amount)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>تخفیف:</span>
                <span>−{formatIrrAsToman(order.discount_amount)}</span>
              </div>
            )}
            {order.fees?.map((f, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-ink-4">{f.label}:</span>
                <span className="text-white font-medium">{formatIrrAsToman(f.amount)}</span>
              </div>
            ))}
            <div className="pt-2.5 border-t border-white/8 flex justify-between items-baseline">
              <span className="text-ink-2 font-bold text-[13.5px]">مبلغ نهایی:</span>
              <span className="text-[19px] font-black text-white">{formatIrrAsToman(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/8 mt-6">
        <h3 className="text-white text-[15px] font-bold mb-4">اقلام سفارش ({toFaDigits(order.items.length)})</h3>
        <div className="divide-y divide-white/6">
          {order.items.map((item, index) => (
            <div key={index} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-bold text-white truncate">{item.name}</div>
                <div className="text-ink-4 text-[11.5px] mt-0.5">
                  {toFaDigits(item.quantity)} عدد × {formatIrrAsToman(item.unit_price)}
                </div>
              </div>
              <div className="text-white font-bold text-[13.5px] shrink-0">
                {formatIrrAsToman(item.total_price)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action CTA */}
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/shop"
          className="glass-brand rounded-2xl px-7 py-3.5 text-[14px] font-bold text-white shadow-[0_4px_20px_rgba(255,45,60,0.3)] inline-flex items-center gap-2"
        >
          <span>ادامه خرید از فروشگاه</span>
          <ArrowLeft className="size-4" strokeWidth={2.4} />
        </Link>
      </div>
    </div>
  );
}
