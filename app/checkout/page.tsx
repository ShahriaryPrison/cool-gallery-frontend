"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, ShoppingCart, ShieldCheck } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import {
  FREE_SHIPPING_THRESHOLD,
  PAYMENT_OPTIONS,
  SHIPPING_OPTIONS,
} from "@/lib/data";
import { formatToman, toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

interface FormState {
  name: string;
  phone: string;
  city: string;
  addr: string;
  zip: string;
}

const FIELDS: { key: keyof FormState; label: string; placeholder: string }[] = [
  { key: "name", label: "نام و نام خانوادگی گیرنده", placeholder: "مثلاً سارا محمدی" },
  { key: "phone", label: "شماره موبایل جهت هماهنگی", placeholder: "۰۹۱۲۳۴۵۶۷۸۹" },
  { key: "city", label: "استان و شهر", placeholder: "تهران" },
  { key: "addr", label: "آدرس کامل پستی", placeholder: "خیابان، کوچه، پلاک، واحد" },
  { key: "zip", label: "کد پستی (۱۰ رقمی)", placeholder: "مثلاً ۱۲۳۴۵۶۷۸۹۰" },
];

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    city: "",
    addr: "",
    zip: "",
  });
  const [ship, setShip] = useState(SHIPPING_OPTIONS[0].key);
  const [pay, setPay] = useState(PAYMENT_OPTIONS[0].key);

  const subtotalAfterDiscount = Math.max(0, cart.subtotal - cart.discount);
  const shipOption = SHIPPING_OPTIONS.find((s) => s.key === ship)!;
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
        v: shipCost ? `${formatToman(shipCost)} تومان` : "رایگان",
        color: "text-ink-1",
      },
    ],
    [cart.subtotal, cart.discount, shipCost],
  );

  function placeOrder() {
    const code = `۱۴۰۵-${toFaDigits(1000 + Math.floor(Math.random() * 8999))}`;
    cart.clearCart();
    router.push(`/checkout/success?code=${encodeURIComponent(code)}`);
  }

  if (cart.lines.length === 0) {
    return (
      <div className="flex flex-col items-center px-5 pt-20 text-center">
        <span className="glass grid size-20 place-items-center rounded-[28px]">
          <ShoppingCart className="text-brand size-8" strokeWidth={1.5} />
        </span>
        <p className="text-ink-2 mt-5 text-[15px] font-bold">سبد خرید شما در حال حاضر خالی است</p>
        <p className="text-ink-4 mt-1.5 text-[12.5px]">برای مشاهده اکسسوری‌ها و فیجت‌ها به فروشگاه سر بزنید</p>
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
    <div className="px-5 pt-4 lg:mx-auto lg:max-w-[980px] lg:px-12 lg:pt-8">
      <button
        type="button"
        onClick={() => cart.open()}
        className="glass text-ink-2 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[12.5px] font-bold"
      >
        <ArrowRight className="size-4" strokeWidth={2.2} />
        بازگشت به سبد خرید
      </button>

      <h1 className="mt-5 text-[30px] leading-tight font-black text-white lg:text-[42px]">
        تکمیل اطلاعات و ثبت سفارش
      </h1>
      <div className="text-ink-4 mt-1.5 text-[12.5px]">
        {toFaDigits(cart.count)} قلم کالا در سبد خرید شما
      </div>

      <div className="lg:mt-10 lg:flex lg:items-start lg:gap-10">
        <div className="lg:flex-1">
          <h3 className="mt-6 mb-3 text-[16px] font-black text-white">
            مشخصات و آدرس تحویل‌گیرنده
          </h3>
          <div className="space-y-2.5">
            {FIELDS.map((f, i) => (
              <motion.div
                key={f.key}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.05,
                  type: "spring",
                  stiffness: 320,
                  damping: 30,
                }}
              >
                <label className="text-ink-4 mb-2 block text-[11.5px]">
                  {f.label}
                </label>
                <div className="glass rounded-2xl px-4">
                  <input
                    value={form[f.key]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                    }
                    placeholder={f.placeholder}
                    className="text-ink-1 placeholder:text-ink-5 h-12 w-full bg-transparent text-[13.5px] outline-none"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <h3 className="mt-8 mb-3 text-[16px] font-black text-white">
            انتخاب روش ارسال
          </h3>
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
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 460, damping: 30 }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-4 text-right transition-colors",
                    active ? "glass-brand" : "glass",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid size-[18px] shrink-0 place-items-center rounded-full border-2",
                        active ? "border-white" : "border-white/25",
                      )}
                    >
                      {active && (
                        <span className="block size-2 rounded-full bg-white" />
                      )}
                    </span>
                    <span className="text-[13.5px] font-bold text-white">
                      {s.label}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "text-[12.5px]",
                      active ? "text-white/90 font-bold" : "text-ink-3",
                    )}
                  >
                    {cost}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <h3 className="mt-8 mb-3 text-[16px] font-black text-white">
            روش پرداخت
          </h3>
          <div className="flex gap-2.5">
            {PAYMENT_OPTIONS.map((p) => {
              const active = pay === p.key;
              return (
                <motion.button
                  key={p.key}
                  type="button"
                  onClick={() => setPay(p.key)}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 460, damping: 30 }}
                  className={cn(
                    "flex-1 rounded-2xl px-3 py-4 text-[13px] font-bold transition-colors",
                    active ? "glass-brand text-white" : "glass text-ink-2",
                  )}
                >
                  {p.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:w-[340px] lg:shrink-0">
          <div className="glass mt-7 rounded-3xl p-5 lg:mt-0">
            <h4 className="text-ink-2 mb-3 text-[14px] font-bold">خلاصه فاکتور</h4>
            {summary.map((row) => (
              <div
                key={row.k}
                className="flex justify-between py-1.5 text-[13px]"
              >
                <span className="text-ink-3">{row.k}</span>
                <span className={cn("font-medium", row.color)}>{row.v}</span>
              </div>
            ))}
            <div className="mt-3 flex items-baseline justify-between border-t border-white/8 pt-4">
              <span className="text-ink-2 text-[13px]">مبلغ قابل پرداخت</span>
              <span className="text-[23px] font-black text-white">
                {formatToman(payable)}{" "}
                <span className="text-ink-4 text-[11px] font-normal">
                  تومان
                </span>
              </span>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={placeOrder}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 460, damping: 30 }}
            className="glass-brand mt-4 w-full rounded-2xl py-[18px] text-[15px] font-bold text-white shadow-[0_4px_24px_rgba(255,45,60,0.3)]"
          >
            تایید و پرداخت نهایی
          </motion.button>
          <div className="text-ink-4 mt-3.5 flex items-center justify-center gap-1.5 text-center text-[11.5px]">
            <ShieldCheck className="size-4 text-emerald-400" />
            ضمانت ۷ روزه سلامت و اصالت کالا
          </div>
        </div>
      </div>
    </div>
  );
}
