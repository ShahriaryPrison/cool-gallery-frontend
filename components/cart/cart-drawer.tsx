"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Gift, Minus, Plus, ShoppingCart, X } from "lucide-react";

import { cartNoticeLabel, useCart } from "@/components/cart/cart-provider";
import { useAuth } from "@/lib/auth";
import { ProductImage } from "@/components/product/product-image";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { formatToman, toFaDigits } from "@/lib/format";
import { toEnglishDigits } from "@/lib/digits";
import { CATALOG_ONLY_MESSAGE, useShippingMethods, useSiteFeatures } from "@/components/site-features";
import { FreeShippingBar } from "@/components/cart/free-shipping-bar";
import { defaultMethod } from "@/lib/checkout/shipping";

export function CartDrawer() {
  const cart = useCart();
  const features = useSiteFeatures();
  // The first real delivery method is the one checkout starts on; `default` is the free stand-in.
  const shippingMethod = defaultMethod(useShippingMethods().filter((m) => m.id !== "default"));
  const auth = useAuth();
  const router = useRouter();
  const [couponInput, setCouponInput] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const total = cart.total;
  const hasPurchasable = cart.items.some((i) => i.available !== false);
  const { offer } = cart.offer;

  const submitCoupon = async () => {
    const clean = toEnglishDigits(couponInput.trim());
    if (!clean || couponBusy) return;
    setCouponBusy(true);
    setCouponError(null);
    const res = await cart.applyCoupon(clean);
    setCouponBusy(false);
    if (res.ok) setCouponInput("");
    else setCouponError(res.message ?? "کد تخفیف واردشده معتبر نیست.");
  };

  return (
    <Drawer open={cart.isOpen} onOpenChange={(open) => (open ? cart.open() : cart.close())} showSwipeHandle>
      <DrawerContent className="mx-auto max-h-[88dvh] max-w-[468px] rounded-t-[32px] border-t border-x border-white/15 bg-[#0a0a10]/60 backdrop-blur-2xl px-5 pt-0 pb-7 shadow-[0_-16px_50px_rgba(0,0,0,0.65),inset_0_1px_0_0_rgba(255,255,255,0.18)] lg:max-w-[560px]">
        <DrawerHeader className="flex-row items-center justify-between p-0 pt-3 pb-4 text-right">
          <DrawerTitle className="text-[17px] font-bold text-white">سبد خرید شما</DrawerTitle>
          {cart.count > 0 && (
            <span className="glass-brand rounded-full px-3 py-1 text-[11px] font-bold text-white">
              {toFaDigits(cart.count)} کالا
            </span>
          )}
        </DrawerHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto">
          {cart.lines.length === 0 && !cart.isSignedIn && auth.isLoaded && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="grid size-16 place-items-center rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-md">
                <ShoppingCart className="text-brand size-7" strokeWidth={1.6} />
              </span>
              <p className="text-ink-2 text-[14px] font-bold">برای مشاهده سبد خرید وارد شوید</p>
              <p className="text-ink-4 text-[12px]">سبد خرید شما در حساب کاربری‌تان نگه داشته می‌شود</p>
              <motion.button
                type="button"
                onClick={() => {
                  cart.close();
                  auth.openLogin();
                }}
                whileTap={{ scale: 0.97 }}
                className="glass-brand mt-2 rounded-2xl px-6 py-3 text-[13px] font-bold text-white"
              >
                ورود / ثبت‌نام
              </motion.button>
            </div>
          )}

          {cart.lines.length === 0 && cart.isSignedIn && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="grid size-16 place-items-center rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-md">
                <ShoppingCart className="text-brand size-7" strokeWidth={1.6} />
              </span>
              <p className="text-ink-2 text-[14px] font-bold">
                {cart.isLoaded ? "سبد خرید شما در حال حاضر خالی است" : "در حال بارگذاری سبد خرید…"}
              </p>
              {cart.isLoaded && (
                <p className="text-ink-4 text-[12px]">محصولات مورد نظرتان را به سبد خرید اضافه کنید</p>
              )}
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {cart.lines.map((line) => (
              <motion.div
                key={line.key}
                layout
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30, height: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-md p-3 shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-colors hover:bg-white/[0.08]"
              >
                <ProductImage
                  image={line.product.image}
                  alt={line.product.name}
                  category={line.product.cat}
                  className="size-[56px] shrink-0 rounded-xl"
                  iconClassName="size-6"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-ink-1 truncate text-[13px] font-bold">{line.product.name}</div>
                  <div className="text-ink-5 mt-0.5 text-[10.5px]">
                    {[line.color, line.size].filter(Boolean).join(" · ") || "—"}
                  </div>
                  {line.notice && (
                    <div className="mt-0.5 text-[10.5px] font-bold text-amber-400">{cartNoticeLabel(line.notice)}</div>
                  )}
                  <div className="text-ink-2 mt-1 text-[11.5px] font-bold">
                    {formatToman(line.product.price * line.qty)} تومان
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-0.5 rounded-xl bg-white/6 p-1">
                  <motion.button
                    type="button"
                    onClick={() => cart.bumpLine(line.key, -1)}
                    whileTap={{ scale: 0.85 }}
                    className="text-ink-3 hover:text-ink-1 grid size-7 place-items-center rounded-lg"
                    aria-label="کم کردن تعداد"
                  >
                    <Minus className="size-3.5" strokeWidth={2.4} />
                  </motion.button>
                  <span className="min-w-[18px] text-center text-[12.5px] font-bold text-white">
                    {toFaDigits(line.qty)}
                  </span>
                  <motion.button
                    type="button"
                    onClick={() => cart.bumpLine(line.key, 1)}
                    disabled={line.available === false}
                    whileTap={{ scale: 0.85 }}
                    className="text-ink-3 hover:text-ink-1 grid size-7 place-items-center rounded-lg disabled:opacity-30"
                    aria-label="افزودن تعداد"
                  >
                    <Plus className="size-3.5" strokeWidth={2.4} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {cart.lines.length > 0 && (
          <motion.div layout className="mt-4 shrink-0 border-t border-white/8 pt-4">
            {features.coupons && (<>
            {cart.coupon ? (
              <div className="mb-3 flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 backdrop-blur-md">
                <div className="min-w-0 text-[12px]">
                  <span className="text-ink-3">کد </span>
                  <span dir="ltr" className="font-bold text-white">{cart.coupon.code}</span>
                  {cart.coupon.valid ? (
                    <span className="text-emerald-400"> اعمال شد</span>
                  ) : (
                    <div className="mt-0.5 text-[11px] text-rose-300">
                      {cart.coupon.message ?? "این کد دیگر برای سبد شما معتبر نیست."}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void cart.removeCoupon()}
                  className="text-ink-3 hover:text-ink-1 grid size-7 shrink-0 place-items-center rounded-lg"
                  aria-label="حذف کد تخفیف"
                >
                  <X className="size-3.5" strokeWidth={2.4} />
                </button>
              </div>
            ) : (
              <div className="mb-3 flex gap-2">
                <div className="flex flex-1 items-center rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-md px-3.5">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void submitCoupon()}
                    placeholder="کد تخفیف"
                    dir="ltr"
                    className="text-ink-1 placeholder:text-ink-4 h-11 w-full bg-transparent text-right text-[12.5px] outline-none"
                  />
                </div>
                <motion.button
                  type="button"
                  onClick={() => void submitCoupon()}
                  disabled={couponBusy || !couponInput.trim()}
                  whileTap={{ scale: 0.95 }}
                  className="shrink-0 rounded-2xl border border-white/12 bg-white/10 backdrop-blur-md px-5 text-[12.5px] font-bold text-white transition-colors hover:bg-white/15 disabled:opacity-50"
                >
                  {couponBusy ? "…" : "اعمال کد"}
                </motion.button>
              </div>
            )}

            <AnimatePresence>
              {couponError && !cart.coupon && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-2.5 text-[11.5px] text-rose-300"
                >
                  {couponError}
                </motion.div>
              )}
            </AnimatePresence>
            </>)}

            {cart.offer.eligible && offer && (
              <div className="mb-3 flex items-start gap-2 rounded-2xl border border-dashed border-brand/40 bg-brand/5 p-3 text-[11.5px] font-bold leading-6 text-white">
                <Gift className="text-brand mt-1 size-4 shrink-0" strokeWidth={2} />
                <span>
                  {cart.offerDiscount > 0
                    ? `تخفیف پیشنهاد ویژه روی سفارش شما اعمال شد: ${formatToman(cart.offerDiscount)} تومان`
                    : offer.headline}
                </span>
              </div>
            )}

            {features.checkout && (
              <FreeShippingBar method={shippingMethod} subtotalIrr={cart.subtotalIrr} coupon={cart.coupon} className="mb-3" />
            )}

            {cart.error && <div className="mb-3 text-[11.5px] text-rose-300">{cart.error}</div>}

            {cart.discount > 0 && (
              <div className="mb-1.5 flex items-baseline justify-between text-[12px]">
                <span className="text-ink-4">تخفیف</span>
                <span className="font-bold text-emerald-400">−{formatToman(cart.discount)} تومان</span>
              </div>
            )}

            <div className="mb-4 flex items-baseline justify-between">
              <span className="text-ink-3 text-[13px]">مبلغ کل خرید</span>
              <motion.span
                key={total}
                initial={{ opacity: 0.4, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[20px] font-bold text-white"
              >
                {formatToman(total)}{" "}
                <span className="text-ink-4 text-[11px] font-normal">تومان</span>
              </motion.span>
            </div>

            {!features.checkout ? (
              <>
                <p className="text-ink-3 mb-2.5 text-center text-[11.5px]">{CATALOG_ONLY_MESSAGE}</p>
                <motion.button
                  type="button"
                  onClick={() => {
                    cart.close();
                    router.push("/contact");
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-brand w-full rounded-2xl py-3.5 text-[14px] font-bold text-white"
                >
                  سفارش / تماس با فروشنده
                </motion.button>
              </>
            ) : (
            <motion.button
              type="button"
              onClick={() => {
                cart.close();
                router.push("/checkout");
              }}
              disabled={!hasPurchasable}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 460, damping: 30 }}
              className="glass-brand w-full rounded-2xl py-3.5 text-[14px] font-bold text-white shadow-[0_4px_20px_rgba(255,45,60,0.3)] disabled:opacity-50"
            >
              تکمیل خرید و ثبت سفارش
            </motion.button>
            )}
          </motion.div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
