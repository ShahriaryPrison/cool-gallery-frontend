"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  ShoppingCart,
  ChevronDown,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/components/cart/cart-provider";
import { useAuth } from "@/lib/auth";
import { IRAN_PROVINCES } from "@/lib/iran";
import { formatToman, toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { submitCheckoutAction, type CheckoutPayload } from "./actions";

// Generate UUID v4 for Idempotency-Key
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function CheckoutPage() {
  const cart = useCart();
  const auth = useAuth();

  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-fill customer info if logged in (from auth state)
  useEffect(() => {
    if (auth.customer) {
      if (!recipientName && auth.customer.display_name) {
        setRecipientName(auth.customer.display_name);
      }
      if (!recipientPhone && auth.customer.phone) {
        setRecipientPhone(auth.customer.phone);
      }
    }
  }, [auth.customer, recipientName, recipientPhone]);

  // Update city options when province changes
  const availableCities = useMemo(() => {
    if (!province) return [];
    const p = IRAN_PROVINCES.find((item) => item.name === province);
    return p ? p.cities : [];
  }, [province]);

  const handleProvinceChange = (newProvince: string) => {
    setProvince(newProvince);
    const p = IRAN_PROVINCES.find((item) => item.name === newProvince);
    if (p && p.cities.length > 0) {
      setCity(p.cities[0]);
    } else {
      setCity("");
    }
  };

  const subtotalAfterDiscount = Math.max(0, cart.subtotal - cart.discount);
  const payable = subtotalAfterDiscount;

  const handlePlaceOrder = async () => {
    setErrorMessage(null);

    // 1. Ensure user is authenticated
    if (!auth.customer || !auth.token) {
      toast.error("لطفاً ابتدا وارد حساب کاربری خود شوید");
      auth.openLogin("/checkout");
      return;
    }

    // 2. Form Validations
    if (!recipientName.trim()) {
      setErrorMessage("لطفاً نام و نام خانوادگی تحویل‌گیرنده را وارد کنید.");
      toast.error("نام و نام خانوادگی تحویل‌گیرنده الزامی است");
      return;
    }

    if (!recipientPhone.trim()) {
      setErrorMessage("لطفاً شماره تماس تحویل‌گیرنده را وارد کنید.");
      toast.error("شماره تماس تحویل‌گیرنده الزامی است");
      return;
    }

    if (!province.trim()) {
      setErrorMessage("لطفاً استان را انتخاب کنید.");
      toast.error("انتخاب استان الزامی است");
      return;
    }

    if (!city.trim()) {
      setErrorMessage("لطفاً شهر را انتخاب کنید.");
      toast.error("انتخاب شهر الزامی است");
      return;
    }

    if (!address.trim()) {
      setErrorMessage("لطفاً آدرس پستی دقیق را وارد کنید.");
      toast.error("آدرس پستی دقیق الزامی است");
      return;
    }

    // 3. Prepare payload
    const items = cart.items.map((item) => ({
      variant_id: item.variant_id,
      qty: item.qty,
    }));

    if (items.length === 0) {
      toast.error("سبد خرید شما خالی است");
      return;
    }

    setSubmitting(true);
    try {
      const idempotencyKey = generateUUID();
      const payload: CheckoutPayload = {
        items,
        shipping: {
          recipient_name: recipientName.trim(),
          phone: recipientPhone.trim(),
          province: province.trim(),
          city: city.trim(),
          address: address.trim(),
          postal_code: postalCode.trim() || null,
        },
        coupon_code: couponInput.trim() || cart.couponCode || null,
        note: note.trim() || null,
      };

      const result = await submitCheckoutAction(
        auth.slug,
        idempotencyKey,
        payload,
        auth.token
      );

      if (result.success && result.data?.payment_url) {
        toast.success("در حال انتقال به درگاه پرداخت رسمی...");
        window.location.href = result.data.payment_url;
      } else {
        const msg = result.message || "ثبت سفارش با خطا مواجه شد. لطفاً اطلاعات را بررسی نمایید.";
        setErrorMessage(msg);
        toast.error(msg);
        setSubmitting(false);
      }
    } catch (err) {
      console.error("Checkout submission failed:", err);
      const msg = "خطای غیرمنتظره در برقراری ارتباط با درگاه پرداخت.";
      setErrorMessage(msg);
      toast.error(msg);
      setSubmitting(false);
    }
  };

  const isCartEmpty = cart.items.length === 0 && cart.lines.length === 0;

  if (isCartEmpty) {
    return (
      <div className="flex flex-col items-center px-5 pt-24 pb-20 text-center">
        <span className="grid size-20 place-items-center rounded-[28px] bg-white/5 border border-white/10 shadow-xl">
          <ShoppingCart className="size-8 text-brand" strokeWidth={1.5} />
        </span>
        <p className="mt-5 text-base font-bold text-white">سبد خرید شما در حال حاضر خالی است</p>
        <p className="mt-1.5 text-xs text-white/50">برای مشاهده محصولات و افزودن به سبد به فروشگاه مراجعه کنید</p>
        <Link
          href="/shop"
          className="mt-6 rounded-2xl bg-gradient-to-r from-brand to-[#e01627] px-7 py-3.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(255,45,60,0.35)] transition-all hover:scale-105 active:scale-95"
        >
          مشاهده محصولات فروشگاه
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[680px] px-4 py-8 sm:px-6 lg:py-12">
      {/* Top Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => cart.open()}
          className="glass text-ink-2 hover:text-white inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ArrowRight className="size-3.5" strokeWidth={2.4} />
          <span>بازگشت به سبد خرید</span>
        </button>

        <span className="text-xs text-white/50">
          {toFaDigits(cart.count)} قلم کالا در سبد
        </span>
      </div>

      {/* Main Title */}
      <div className="mb-6 text-right">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          تکمیل سفارش و پرداخت
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-white/60">
          لطفاً مشخصات تحویل را وارد کرده و سفارش خود را نهایی کنید.
        </p>
      </div>

      {/* Error Alert Message */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300 text-xs sm:text-sm"
        >
          <AlertCircle className="size-4.5 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1 leading-relaxed">{errorMessage}</div>
        </motion.div>
      )}

      {/* Form Card: اطلاعات تحویل و گیرنده */}
      <div className="rounded-[30px] bg-[#0d0d12] border border-white/10 p-5 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-5">
        <h2 className="text-base sm:text-lg font-extrabold text-white">
          اطلاعات تحویل و گیرنده
        </h2>

        <div className="border-t border-white/10 pt-5 space-y-4">
          {/* Recipient Name */}
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5">
              نام و نام خانوادگی تحویل‌گیرنده <span className="text-brand font-bold">*</span>
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="نام و نام خانوادگی"
              className="w-full rounded-2xl bg-[#14141c] border border-white/10 px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-brand/60 focus:ring-1 focus:ring-brand"
            />
          </div>

          {/* Recipient Phone */}
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5">
              شماره تماس تحویل‌گیرنده <span className="text-brand font-bold">*</span>
            </label>
            <input
              type="tel"
              dir="ltr"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              className="w-full rounded-2xl bg-[#14141c] border border-white/10 px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-brand/60 focus:ring-1 focus:ring-brand text-right"
            />
          </div>

          {/* Province Select */}
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5">
              استان <span className="text-brand font-bold">*</span>
            </label>
            <div className="relative">
              <select
                value={province}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className="w-full appearance-none rounded-2xl bg-[#14141c] border border-white/10 px-4 py-3.5 text-sm text-white outline-none transition-all focus:border-brand/60 focus:ring-1 focus:ring-brand cursor-pointer"
              >
                <option value="" className="bg-[#14141c] text-white/50">
                  انتخاب استان...
                </option>
                {IRAN_PROVINCES.map((p) => (
                  <option key={p.name} value={p.name} className="bg-[#14141c] text-white">
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/50 pointer-events-none" />
            </div>
          </div>

          {/* City Select */}
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5">
              شهر <span className="text-brand font-bold">*</span>
            </label>
            <div className="relative">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!province}
                className="w-full appearance-none rounded-2xl bg-[#14141c] border border-white/10 px-4 py-3.5 text-sm text-white outline-none transition-all focus:border-brand/60 focus:ring-1 focus:ring-brand disabled:opacity-40 cursor-pointer"
              >
                <option value="" className="bg-[#14141c] text-white/50">
                  {province ? "انتخاب شهر..." : "ابتدا استان را انتخاب کنید"}
                </option>
                {availableCities.map((c) => (
                  <option key={c} value={c} className="bg-[#14141c] text-white">
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/50 pointer-events-none" />
            </div>
          </div>

          {/* Detailed Address */}
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5">
              آدرس پستی دقیق <span className="text-brand font-bold">*</span>
            </label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="مثال: خیابان آزادی، کوچه مریم، پلاک ۱۰، واحد ۲"
              className="w-full rounded-2xl bg-[#14141c] border border-white/10 p-4 text-sm text-white placeholder:text-white/30 outline-none resize-none transition-all focus:border-brand/60 focus:ring-1 focus:ring-brand"
            />
          </div>

          {/* Postal Code */}
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5">
              کد پستی ۱۰ رقمی (اختیاری)
            </label>
            <input
              type="text"
              maxLength={10}
              dir="ltr"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="مثال: ۱۲۳۴۵۶۷۸۹۰"
              className="w-full rounded-2xl bg-[#14141c] border border-white/10 px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-brand/60 focus:ring-1 focus:ring-brand text-right"
            />
          </div>

          {/* Coupon Code */}
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5">
              کد تخفیف (در صورت وجود)
            </label>
            <input
              type="text"
              dir="ltr"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="مثال: OFF10"
              className="w-full rounded-2xl bg-[#14141c] border border-white/10 px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-brand/60 focus:ring-1 focus:ring-brand text-right uppercase"
            />
          </div>

          {/* Order Note */}
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5">
              توضیحات سفارش (اختیاری)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="توضیحات بیشتر درباره ارسال یا سفارش..."
              className="w-full rounded-2xl bg-[#14141c] border border-white/10 p-4 text-sm text-white placeholder:text-white/30 outline-none resize-none transition-all focus:border-brand/60 focus:ring-1 focus:ring-brand"
            />
          </div>
        </div>

        {/* Big Submit Button */}
        <motion.button
          type="button"
          disabled={submitting}
          onClick={handlePlaceOrder}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-2xl bg-gradient-to-r from-brand to-[#e01627] py-4 text-sm sm:text-base font-black text-white shadow-[0_8px_30px_rgba(255,45,60,0.45)] hover:shadow-[0_12px_40px_rgba(255,45,60,0.65)] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-6"
        >
          {submitting ? (
            <div className="flex items-center gap-2">
              <div className="size-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>در حال اتصال به درگاه پرداخت...</span>
            </div>
          ) : (
            <span>ثبت سفارش و پرداخت آنلاین</span>
          )}
        </motion.button>
      </div>

      {/* Order Summary Box */}
      <div className="mt-6 rounded-[30px] bg-[#0d0d12] border border-white/10 p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <h3 className="text-base font-black text-white mb-4">
          خلاصه سفارش ({toFaDigits(cart.count)} کالا)
        </h3>

        {/* Cart Item Rows */}
        <div className="divide-y divide-white/5 space-y-3">
          {cart.items.map((item) => (
            <div key={item.variant_id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative size-14 rounded-2xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                  <Image
                    src={item.image || "/products/fidget-dragon-black.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                    {item.name}
                  </h4>
                  {item.variant_label && (
                    <span className="text-[11px] text-white/50 block mt-0.5">
                      {item.variant_label}
                    </span>
                  )}
                  <span className="text-[11px] text-white/40 block mt-0.5">
                    تعداد: {toFaDigits(item.qty)}
                  </span>
                </div>
              </div>

              <div className="text-left shrink-0">
                <span className="text-sm sm:text-base font-black text-white">
                  {formatToman(item.unit_price * item.qty)}{" "}
                  <span className="text-[10px] font-normal text-white/40">تومان</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Subtotal and Payable */}
        <div className="mt-5 pt-4 border-t border-white/10 space-y-2 text-xs sm:text-sm">
          <div className="flex items-center justify-between text-white/60">
            <span>مجموع سبد خرید:</span>
            <span className="font-bold text-white">{formatToman(cart.subtotal)} تومان</span>
          </div>

          {cart.discount > 0 && (
            <div className="flex items-center justify-between text-emerald-400">
              <span>تخفیف:</span>
              <span className="font-bold">−{formatToman(cart.discount)} تومان</span>
            </div>
          )}

          <div className="flex items-baseline justify-between pt-3 border-t border-white/10">
            <span className="text-xs font-bold text-white">مبلغ قابل پرداخت:</span>
            <span className="text-xl sm:text-2xl font-black text-brand">
              {formatToman(payable)}{" "}
              <span className="text-xs font-normal text-white/50">تومان</span>
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-white/40">
          <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
          <span>اتصال مستقیم و امن به درگاه رسمی شاپرک</span>
        </div>
      </div>
    </div>
  );
}
