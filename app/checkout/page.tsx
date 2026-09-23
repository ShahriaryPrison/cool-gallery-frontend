"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ShoppingCart,
  ShieldCheck,
  CreditCard,
  MapPin,
  User,
  Phone,
  FileText,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { useAuth } from "@/lib/auth";
import { IRAN_PROVINCES } from "@/lib/iran";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_OPTIONS } from "@/lib/data";
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
  const router = useRouter();

  const [province, setProvince] = useState(IRAN_PROVINCES[0].name);
  const [city, setCity] = useState(IRAN_PROVINCES[0].cities[0]);
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [note, setNote] = useState("");
  const [ship, setShip] = useState(SHIPPING_OPTIONS[0].key);
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-fill customer info if logged in
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

  // Update city list when province changes
  const availableCities = useMemo(() => {
    const p = IRAN_PROVINCES.find((item) => item.name === province);
    return p ? p.cities : [];
  }, [province]);

  const handleProvinceChange = (newProvince: string) => {
    setProvince(newProvince);
    const p = IRAN_PROVINCES.find((item) => item.name === newProvince);
    if (p && p.cities.length > 0) {
      setCity(p.cities[0]);
    }
  };

  const subtotalAfterDiscount = Math.max(0, cart.subtotal - cart.discount);
  const shipOption = SHIPPING_OPTIONS.find((s) => s.key === ship) || SHIPPING_OPTIONS[0];
  const shipCost =
    subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : shipOption.cost;
  const payable = subtotalAfterDiscount + shipCost;

  const summary = useMemo(
    () => [
      {
        k: "مجموع سبد خرید",
        v: `${formatToman(cart.subtotal)} تومان`,
        color: "text-ink-1",
      },
      {
        k: "تخفیف اعمال‌شده",
        v: cart.discount ? `−${formatToman(cart.discount)} تومان` : "—",
        color: cart.discount ? "text-emerald-400" : "text-ink-4",
      },
      {
        k: "هزینه ارسال",
        v: shipCost === 0 ? "رایگان" : `${formatToman(shipCost)} تومان`,
        color: shipCost === 0 ? "text-emerald-400" : "text-ink-1",
      },
    ],
    [cart.subtotal, cart.discount, shipCost]
  );

  async function handlePlaceOrder() {
    setErrorMessage(null);

    // If user is not logged in, open login modal
    if (!auth.customer || !auth.token) {
      auth.openLogin("/checkout");
      return;
    }

    if (!address.trim()) {
      setErrorMessage("لطفاً آدرس کامل پستی خود را وارد کنید.");
      return;
    }

    if (!recipientName.trim()) {
      setErrorMessage("لطفاً نام و نام خانوادگی تحویل‌گیرنده را وارد کنید.");
      return;
    }

    if (!recipientPhone.trim()) {
      setErrorMessage("لطفاً شماره تماس تحویل‌گیرنده را وارد کنید.");
      return;
    }

    try {
      setSubmitting(true);
      const idempotencyKey = generateUUID();

      const itemsPayload = cart.items.map((i) => ({
        variant_id: i.variant_id,
        qty: i.qty,
      }));

      const payload: CheckoutPayload = {
        items: itemsPayload,
        shipping: {
          recipient_name: recipientName.trim(),
          phone: recipientPhone.trim(),
          province: province,
          city: city,
          address: address.trim(),
          postal_code: postalCode.trim() || null,
        },
        coupon_code: cart.couponOk && cart.couponCode ? cart.couponCode : null,
        note: note.trim() || null,
        gateway: selectedGateway,
      };

      const result = await submitCheckoutAction(
        auth.slug,
        idempotencyKey,
        payload,
        auth.token
      );

      if (result.success && result.data) {
        cart.clearCart();
        if (result.data.payment_url) {
          window.location.href = result.data.payment_url;
        } else {
          router.push(`/order/${result.data.order_reference}`);
        }
      } else {
        // Handle validation errors or backend issues
        if (result.errors) {
          const firstErr = Object.values(result.errors).flat()[0];
          setErrorMessage(firstErr || result.message || "خطا در ثبت سفارش.");
        } else {
          setErrorMessage(result.message || "خطا در ثبت سفارش.");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "خطا در برقراری ارتباط با درگاه پرداخت.");
    } finally {
      setSubmitting(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center px-5 pt-20 pb-16 text-center">
        <span className="glass grid size-20 place-items-center rounded-[28px]">
          <ShoppingCart className="text-brand size-8" strokeWidth={1.5} />
        </span>
        <p className="text-ink-2 mt-5 text-[15px] font-bold">
          سبد خرید شما در حال حاضر خالی است
        </p>
        <p className="text-ink-4 mt-1.5 text-[12.5px]">
          برای مشاهده اکسسوری‌ها و فیجت‌ها به فروشگاه سر بزنید
        </p>
        <Link
          href="/shop"
          className="glass-brand mt-6 rounded-2xl px-7 py-3.5 text-[14px] font-bold text-white shadow-[0_4px_16px_rgba(255,45,60,0.2)]"
        >
          مشاهده محصولات فروشگاه
        </Link>
      </div>
    );
  }

  return (
    <div className="px-5 pt-4 pb-16 lg:mx-auto lg:max-w-[1020px] lg:px-12 lg:pt-8">
      <button
        type="button"
        onClick={() => cart.open()}
        className="glass text-ink-2 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[12.5px] font-bold hover:text-white transition-colors"
      >
        <ArrowRight className="size-4" strokeWidth={2.2} />
        بازگشت به سبد خرید
      </button>

      <h1 className="mt-5 text-[30px] leading-tight font-black text-white lg:text-[40px]">
        تکمیل اطلاعات و ثبت سفارش
      </h1>
      <div className="text-ink-4 mt-1.5 text-[12.5px]">
        {toFaDigits(cart.count)} قلم کالا در سبد خرید شما
      </div>

      {/* Guest Login Banner */}
      {!auth.customer && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-brand mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 rounded-2xl p-4.5 border border-brand/30"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="size-5 text-brand shrink-0" />
            <div className="text-[13px] text-white">
              <span className="font-bold">حساب کاربری دارید؟</span> برای پیگیری آسان سفارش‌ها و استفاده از امتیازات باشگاه وارد شوید.
            </div>
          </div>
          <button
            type="button"
            onClick={() => auth.openLogin("/checkout")}
            className="rounded-xl bg-white px-4 py-2 text-[12.5px] font-bold text-black hover:bg-white/90 transition-colors whitespace-nowrap"
          >
            ورود سریع با پیامک
          </button>
        </motion.div>
      )}

      {errorMessage && (
        <div className="mt-5 flex items-center gap-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 text-[13px] text-rose-300">
          <AlertCircle className="size-5 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="mt-8 lg:flex lg:items-start lg:gap-10">
        <div className="lg:flex-1 space-y-7">
          {/* Section: Delivery Details */}
          <div>
            <div className="flex items-center gap-2 text-[16px] font-black text-white mb-4">
              <MapPin className="size-4 text-brand" />
              <span>مشخصات و آدرس تحویل‌گیرنده</span>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-ink-3 block text-[11.5px] mb-1.5 font-medium">
                    نام و نام خانوادگی تحویل‌گیرنده *
                  </label>
                  <div className="glass rounded-2xl px-4 flex items-center gap-2">
                    <User className="size-4 text-ink-4 shrink-0" />
                    <input
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="مثلاً سارا محمدی"
                      className="text-ink-1 placeholder:text-ink-5 h-12 w-full bg-transparent text-[13.5px] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-ink-3 block text-[11.5px] mb-1.5 font-medium">
                    شماره موبایل جهت هماهنگی *
                  </label>
                  <div className="glass rounded-2xl px-4 flex items-center gap-2">
                    <Phone className="size-4 text-ink-4 shrink-0" />
                    <input
                      type="tel"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      className="text-ink-1 placeholder:text-ink-5 h-12 w-full bg-transparent text-[13.5px] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Province & City Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-ink-3 block text-[11.5px] mb-1.5 font-medium">
                    استان *
                  </label>
                  <div className="glass rounded-2xl px-4">
                    <select
                      value={province}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className="text-ink-1 h-12 w-full bg-transparent text-[13.5px] outline-none cursor-pointer"
                    >
                      {IRAN_PROVINCES.map((p) => (
                        <option key={p.name} value={p.name} className="bg-[#121218] text-white">
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-ink-3 block text-[11.5px] mb-1.5 font-medium">
                    شهر *
                  </label>
                  <div className="glass rounded-2xl px-4">
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="text-ink-1 h-12 w-full bg-transparent text-[13.5px] outline-none cursor-pointer"
                    >
                      {availableCities.map((c) => (
                        <option key={c} value={c} className="bg-[#121218] text-white">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-ink-3 block text-[11.5px] mb-1.5 font-medium">
                  آدرس دقیق پستی *
                </label>
                <div className="glass rounded-2xl p-3">
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="خیابان، کوچه، پلاک، واحد"
                    className="text-ink-1 placeholder:text-ink-5 w-full bg-transparent text-[13px] outline-none resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-ink-3 block text-[11.5px] mb-1.5 font-medium">
                    کد پستی (۱۰ رقمی - اختیاری)
                  </label>
                  <div className="glass rounded-2xl px-4">
                    <input
                      type="text"
                      maxLength={10}
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="۱۲۳۴۵۶۷۸۹۰"
                      className="text-ink-1 placeholder:text-ink-5 h-12 w-full bg-transparent text-[13.5px] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-ink-3 block text-[11.5px] mb-1.5 font-medium">
                    یادداشت سفارش (اختیاری)
                  </label>
                  <div className="glass rounded-2xl px-4 flex items-center gap-2">
                    <FileText className="size-4 text-ink-4 shrink-0" />
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="توضیحات بسته بندی یا ارسال..."
                      className="text-ink-1 placeholder:text-ink-5 h-12 w-full bg-transparent text-[13.5px] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Shipping Methods */}
          <div>
            <h3 className="text-[16px] font-black text-white mb-3.5">انتخاب روش ارسال</h3>
            <div className="space-y-2.5">
              {SHIPPING_OPTIONS.map((s) => {
                const active = ship === s.key;
                const cost =
                  active && shipCost === 0
                    ? "رایگان (تخفیف ویژه)"
                    : `${formatToman(s.cost)} تومان`;
                return (
                  <motion.button
                    key={s.key}
                    type="button"
                    onClick={() => setShip(s.key)}
                    whileTap={{ scale: 0.99 }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-right transition-all",
                      active
                        ? "glass-brand border-brand/50 shadow-[0_0_20px_rgba(255,45,60,0.15)]"
                        : "glass border-white/8 hover:border-white/15"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={cn(
                          "grid size-[18px] shrink-0 place-items-center rounded-full border-2",
                          active ? "border-white" : "border-white/30"
                        )}
                      >
                        {active && <span className="block size-2 rounded-full bg-white" />}
                      </span>
                      <span className="text-[13.5px] font-bold text-white">{s.label}</span>
                    </span>
                    <span className={cn("text-[12.5px]", active ? "text-white font-bold" : "text-ink-3")}>
                      {cost}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Section: Payment Method */}
          <div>
            <div className="flex items-center gap-2 text-[16px] font-black text-white mb-3.5">
              <CreditCard className="size-4 text-brand" />
              <span>روش پرداخت</span>
            </div>
            <div className="glass rounded-2xl p-4 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
                  <CreditCard className="size-5" />
                </span>
                <div>
                  <div className="text-[13.5px] font-bold text-white">پرداخت آنلاین با کلیه کارت‌های عضو شتاب</div>
                  <div className="text-ink-4 text-[11.5px] mt-0.5">اتصال امن به درگاه رسمی شاپرک</div>
                </div>
              </div>
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            </div>
          </div>
        </div>

        {/* Invoice Summary Box */}
        <div className="lg:sticky lg:top-28 lg:w-[350px] lg:shrink-0 mt-8 lg:mt-0">
          <div className="glass-panel rounded-3xl p-5 border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
            <h4 className="text-white text-[15px] font-black mb-4">خلاصه فاکتور</h4>

            <div className="space-y-2.5 pb-4 border-b border-white/8">
              {summary.map((row) => (
                <div key={row.k} className="flex justify-between text-[13px]">
                  <span className="text-ink-3">{row.k}</span>
                  <span className={cn("font-bold", row.color)}>{row.v}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-ink-2 text-[13px]">مبلغ قابل پرداخت</span>
              <span className="text-[24px] font-black text-white">
                {formatToman(payable)}{" "}
                <span className="text-ink-4 text-[11px] font-normal">تومان</span>
              </span>
            </div>

            <motion.button
              type="button"
              disabled={submitting}
              onClick={handlePlaceOrder}
              whileTap={{ scale: 0.98 }}
              className="glass-brand mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-bold text-white shadow-[0_4px_24px_rgba(255,45,60,0.35)] disabled:opacity-50"
            >
              {submitting ? (
                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>تایید و ورود به درگاه پرداخت</span>
                  <ArrowRight className="size-4 rotate-180" strokeWidth={2.4} />
                </>
              )}
            </motion.button>

            <div className="text-ink-4 mt-4 flex items-center justify-center gap-1.5 text-center text-[11px]">
              <ShieldCheck className="size-4 text-emerald-400" />
              <span>پرداخت امن با پروتکل رمزنگاری شده شاپرک</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
