"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ShoppingCart,
  ChevronDown,
  ShieldCheck,
  AlertCircle,
  Truck,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { cartNoticeLabel, useCart } from "@/components/cart/cart-provider";
import { CouponBox } from "@/components/cart/coupon-box";
import { useAuth } from "@/lib/auth";
import { IRAN_PROVINCES } from "@/lib/iran";
import { formatToman, toFaDigits } from "@/lib/format";
import { toEnglishDigits } from "@/lib/digits";
import { irrToToman } from "@/lib/api";
import type { SiteConfig, StorefrontShippingMethod } from "@/lib/types";
import {
  couponShippingDiscount,
  defaultMethod,
  methodFee,
  methodsForProvince,
} from "@/lib/checkout/shipping";
import { resolveInitialGateway } from "@/lib/checkout/resolveInitialGateway";
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

interface CheckoutViewProps {
  site: SiteConfig | null;
}

export function CheckoutView({ site }: CheckoutViewProps) {
  const cart = useCart();
  const auth = useAuth();

  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [note, setNote] = useState("");

  // Shipping methods from site
  const allMethods = useMemo(
    () => (site?.shipping_methods ?? []).filter((m) => m.id !== "default"),
    [site?.shipping_methods]
  );
  const methods = useMemo(
    () => methodsForProvince(allMethods, province),
    [allMethods, province]
  );
  const [methodId, setMethodId] = useState<string>(
    () => defaultMethod(allMethods)?.id ?? ""
  );
  const method = methods.find((m) => m.id === methodId) ?? (allMethods.length > 0 ? defaultMethod(methods) : null);
  const postalRequired = method?.requires_postal_code === true;

  // Gateways from site
  const gateways = site?.payment_gateways ?? [];
  const [gateway, setGateway] = useState<string | null>(() =>
    resolveInitialGateway(gateways)
  );

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

  // When province changes and selected method is not available in new province, auto-switch
  useEffect(() => {
    if (allMethods.length === 0 || methods.some((m) => m.id === methodId)) return;
    setMethodId(defaultMethod(methods)?.id ?? "");
  }, [province, methods, methodId, allMethods.length]);

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

  // Shipping fee and discount calculations
  const baseShippingIrr = method ? methodFee(method, cart.subtotalIrr) : 0;
  const shippingDiscountIrr = couponShippingDiscount(cart.coupon, baseShippingIrr);
  const shippingFeeIrr = Math.max(0, baseShippingIrr - shippingDiscountIrr);
  const shippingFeeToman = method?.collect_on_delivery ? 0 : irrToToman(shippingFeeIrr);

  // Totals
  const couponDiscount = cart.coupon?.valid ? Math.max(0, cart.discount - cart.offerDiscount) : 0;
  const payable = cart.total + shippingFeeToman;
  const hasPurchasable = cart.items.some((i) => i.available !== false);

  const handlePlaceOrder = async () => {
    setErrorMessage(null);

    // 1. Ensure user is authenticated
    if (!auth.customer || !auth.token) {
      toast.error("لطفاً ابتدا وارد حساب کاربری خود شوید");
      auth.openLogin("/checkout");
      return;
    }

    // 2. Normalization
    const normalizedRecipientName = recipientName.trim();
    const normalizedPhone = toEnglishDigits(recipientPhone.trim().replace(/[\s-]/g, ""));
    const normalizedPostal = postalCode
      ? toEnglishDigits(postalCode.trim().replace(/[\s-]/g, ""))
      : null;

    // 3. Form Validations
    if (!normalizedRecipientName) {
      setErrorMessage("لطفاً نام و نام خانوادگی تحویل‌گیرنده را وارد کنید.");
      toast.error("نام و نام خانوادگی تحویل‌گیرنده الزامی است");
      return;
    }

    if (!normalizedPhone) {
      setErrorMessage("لطفاً شماره تماس تحویل‌گیرنده را وارد کنید.");
      toast.error("شماره تماس تحویل‌گیرنده الزامی است");
      return;
    }

    if (!/^09\d{9}$/.test(normalizedPhone) && !/^\+?\d{10,15}$/.test(normalizedPhone)) {
      setErrorMessage("شماره موبایل تحویل‌گیرنده نامعتبر است (مثال: ۰۹۱۲۳۴۵۶۷۸۹).");
      toast.error("شماره موبایل نامعتبر است");
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

    if (allMethods.length > 0 && !method) {
      setErrorMessage("لطفاً یک روش ارسال انتخاب کنید.");
      toast.error("انتخاب روش ارسال الزامی است");
      return;
    }

    if (postalRequired) {
      if (!normalizedPostal) {
        setErrorMessage("کد پستی ۱۰ رقمی برای روش ارسال انتخابی الزامی است.");
        toast.error("کد پستی ۱۰ رقمی الزامی است");
        return;
      }
      if (!/^\d{10}$/.test(normalizedPostal)) {
        setErrorMessage("کد پستی باید ۱۰ رقم باشد.");
        toast.error("کد پستی نامعتبر است");
        return;
      }
    } else if (normalizedPostal && !/^\d{10}$/.test(normalizedPostal)) {
      setErrorMessage("کد پستی باید ۱۰ رقم باشد.");
      toast.error("کد پستی نامعتبر است");
      return;
    }

    if (gateways.length > 1 && !gateway) {
      setErrorMessage("لطفاً درگاه پرداخت را انتخاب کنید.");
      toast.error("انتخاب درگاه پرداخت الزامی است");
      return;
    }

    if (!hasPurchasable) {
      toast.error("سبد خرید شما خالی است");
      return;
    }

    setSubmitting(true);
    try {
      const idempotencyKey = generateUUID();
      const payload: CheckoutPayload = {
        shipping: {
          recipient_name: normalizedRecipientName,
          phone: normalizedPhone,
          province: province.trim(),
          city: city.trim(),
          address: address.trim(),
          postal_code: normalizedPostal,
        },
        ...(method ? { shipping_method_id: method.id } : {}),
        gateway: gateway || null,
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

  if (!auth.isLoaded || (auth.token && !cart.isLoaded)) {
    return (
      <div className="flex flex-col items-center px-5 pt-24 pb-20 text-center">
        <div className="size-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="mt-4 text-xs text-white/50">در حال بارگذاری سبد خرید…</p>
      </div>
    );
  }

  if (!auth.token) {
    return (
      <div className="flex flex-col items-center px-5 pt-24 pb-20 text-center">
        <span className="grid size-20 place-items-center rounded-[28px] bg-white/5 border border-white/10 shadow-xl">
          <ShoppingCart className="size-8 text-brand" strokeWidth={1.5} />
        </span>
        <p className="mt-5 text-base font-bold text-white">برای ادامه خرید وارد حساب کاربری خود شوید</p>
        <p className="mt-1.5 text-xs text-white/50">سبد خرید شما در حساب کاربری‌تان نگه داشته می‌شود</p>
        <button
          type="button"
          onClick={() => auth.openLogin("/checkout")}
          className="mt-6 rounded-2xl bg-gradient-to-r from-brand to-[#e01627] px-7 py-3.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(255,45,60,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          ورود / ثبت‌نام
        </button>
      </div>
    );
  }

  if (!hasPurchasable) {
    return (
      <div className="flex flex-col items-center px-5 pt-24 pb-20 text-center">
        <span className="grid size-20 place-items-center rounded-[28px] bg-white/5 border border-white/10 shadow-xl">
          <ShoppingCart className="size-8 text-brand" strokeWidth={1.5} />
        </span>
        <p className="mt-5 text-base font-bold text-white">سبد خرید شما در حال حاضر خالی است</p>
        <p className="mt-1.5 text-xs text-white/50">برای مشاهده محصولات و افزودن به سبد به فروشگاه مراجعه کنید</p>
        <Link
          href="/products"
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
          لطفاً مشخصات تحویل و روش ارسال را انتخاب کرده و سفارش خود را نهایی کنید.
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
      <div className="rounded-[30px] bg-[#0d0d12] border border-white/10 p-5 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-6">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-white">
            اطلاعات تحویل و گیرنده
          </h2>
          <div className="border-t border-white/10 mt-4 pt-5 space-y-4">
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
                کد پستی ۱۰ رقمی {postalRequired ? <span className="text-brand font-bold">*</span> : "(اختیاری)"}
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
              {postalRequired && (
                <p className="mt-1 text-[11px] text-brand">
                  کد پستی ۱۰ رقمی برای روش ارسال انتخابی الزامی است.
                </p>
              )}
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
        </div>

        {/* Shipping Methods Section */}
        {allMethods.length > 0 && (
          <div className="border-t border-white/10 pt-5 space-y-3">
            <div className="flex items-center gap-2">
              <Truck className="size-4 text-brand" />
              <h3 className="text-sm sm:text-base font-bold text-white">
                روش ارسال <span className="text-brand font-bold">*</span>
              </h3>
            </div>
            {methods.length === 0 ? (
              <p className="text-xs text-amber-300/80 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                هیچ روش ارسالی برای استان انتخاب‌شده تعریف نشده است. لطفاً استان دیگری را بررسی کنید یا با پشتیبانی تماس بگیرید.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {methods.map((m) => {
                  const feeIrr = methodFee(m, cart.subtotalIrr);
                  const feeToman = irrToToman(feeIrr);
                  const isSelected = method?.id === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethodId(m.id)}
                      className={`flex items-center justify-between gap-3 rounded-2xl p-4 text-right transition-all border ${
                        isSelected
                          ? "border-brand/70 bg-brand/10 shadow-[0_4px_20px_rgba(255,45,60,0.15)]"
                          : "border-white/10 bg-[#14141c] hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "border-brand bg-brand"
                              : "border-white/30 bg-transparent"
                          }`}
                        >
                          {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                            {m.title}
                          </p>
                          {m.description && (
                            <p className="text-[11px] text-white/50 mt-0.5 line-clamp-1">
                              {m.description}
                            </p>
                          )}
                          {m.collect_on_delivery && (
                            <p className="text-[10px] text-amber-300/80 mt-0.5">
                              پرداخت کرایه در مقصد به مامور تحویل
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 text-left">
                        <span className="text-xs sm:text-sm font-bold text-white">
                          {m.collect_on_delivery
                            ? "پس‌کرایه"
                            : feeToman === 0
                            ? "رایگان"
                            : `${formatToman(feeToman)} تومان`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Payment Gateway Picker (if multiple) */}
        {gateways.length > 1 && (
          <div className="border-t border-white/10 pt-5 space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="size-4 text-brand" />
              <h3 className="text-sm sm:text-base font-bold text-white">
                درگاه پرداخت بانکی <span className="text-brand font-bold">*</span>
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {gateways.map((g) => {
                const isSelected = gateway === g.key;
                return (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setGateway(g.key)}
                    className={`flex items-center gap-3 rounded-2xl p-3.5 text-right transition-all border ${
                      isSelected
                        ? "border-brand/70 bg-brand/10 shadow-[0_4px_20px_rgba(255,45,60,0.15)]"
                        : "border-white/10 bg-[#14141c] hover:border-white/20"
                    }`}
                  >
                    <div
                      className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-brand bg-brand"
                          : "border-white/30 bg-transparent"
                      }`}
                    >
                      {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-white">{g.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative size-14 rounded-2xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                  <Image
                    src={item.image || "/products/fidget-dragon-black.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                    {item.name}
                  </h4>
                  {item.variant_label && (
                    <span className="text-[11px] text-white/50 block mt-0.5 line-clamp-1">
                      {item.variant_label}
                    </span>
                  )}
                  <span className="text-[11px] text-white/40 block mt-0.5">
                    تعداد: {toFaDigits(item.qty)}
                  </span>
                  {item.notice && (
                    <span className="text-[11px] font-bold text-amber-400 block mt-0.5">
                      {cartNoticeLabel(item.notice)}
                    </span>
                  )}
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

        {/* Coupon Box on Checkout */}
        <CouponBox className="mt-5 pt-4 border-t border-white/10" />

        {/* Pricing Subtotal, Shipping, and Payable */}
        <div className="mt-4 pt-4 border-t border-white/10 space-y-2.5 text-xs sm:text-sm">
          <div className="flex items-center justify-between text-white/60">
            <span>مجموع سبد خرید:</span>
            <span className="font-bold text-white">{formatToman(cart.subtotal)} تومان</span>
          </div>

          {couponDiscount > 0 && (
            <div className="flex items-center justify-between text-emerald-400">
              <span>
                کد تخفیف <span dir="ltr">{cart.coupon?.code}</span>:
              </span>
              <span className="font-bold">−{formatToman(couponDiscount)} تومان</span>
            </div>
          )}

          {cart.offerDiscount > 0 && (
            <div className="flex items-center justify-between text-emerald-400">
              <span>تخفیف پیشنهاد ویژه:</span>
              <span className="font-bold">−{formatToman(cart.offerDiscount)} تومان</span>
            </div>
          )}

          {/* Shipping Fee Line */}
          <div className="flex items-center justify-between text-white/60">
            <span>
              هزینه ارسال {method ? `(${method.title})` : ""}:
            </span>
            <span className="font-bold text-white">
              {allMethods.length === 0
                ? "رایگان"
                : method?.collect_on_delivery
                ? "پس‌کرایه (تحویل در محل)"
                : shippingFeeToman === 0
                ? "رایگان"
                : `${formatToman(shippingFeeToman)} تومان`}
            </span>
          </div>

          {shippingDiscountIrr > 0 && (
            <div className="flex items-center justify-between text-emerald-400">
              <span>
                ارسال رایگان با کد <span dir="ltr">{cart.coupon?.code}</span>:
              </span>
              <span className="font-bold">−{formatToman(irrToToman(shippingDiscountIrr))} تومان</span>
            </div>
          )}

          {cart.coupon && !cart.coupon.valid && (
            <div className="text-[11px] text-rose-300">
              {cart.coupon.message ?? "کد تخفیف دیگر برای سبد شما معتبر نیست."}
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
