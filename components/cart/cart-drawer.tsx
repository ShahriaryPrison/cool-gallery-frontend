"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, ShoppingCart } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { ProductImage } from "@/components/product/product-image";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { formatToman, toFaDigits } from "@/lib/format";

export function CartDrawer() {
  const cart = useCart();
  const router = useRouter();
  const [couponInput, setCouponInput] = useState("");

  const total = Math.max(0, cart.subtotal - cart.discount);

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
          {cart.lines.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="grid size-16 place-items-center rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-md">
                <ShoppingCart className="text-brand size-7" strokeWidth={1.6} />
              </span>
              <p className="text-ink-2 text-[14px] font-bold">سبد خرید شما در حال حاضر خالی است</p>
              <p className="text-ink-4 text-[12px]">محصولات مورد نظرتان را به سبد خرید اضافه کنید</p>
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
                    whileTap={{ scale: 0.85 }}
                    className="text-ink-3 hover:text-ink-1 grid size-7 place-items-center rounded-lg"
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
            <div className="mb-3 flex gap-2">
              <div className="flex flex-1 items-center rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-md px-3.5">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="کد تخفیف (مثلاً COOL30)"
                  className="text-ink-1 placeholder:text-ink-4 h-11 w-full bg-transparent text-[12.5px] outline-none"
                />
              </div>
              <motion.button
                type="button"
                onClick={() => cart.applyCoupon(couponInput)}
                whileTap={{ scale: 0.95 }}
                className="shrink-0 rounded-2xl border border-white/12 bg-white/10 backdrop-blur-md px-5 text-[12.5px] font-bold text-white transition-colors hover:bg-white/15"
              >
                اعمال کد
              </motion.button>
            </div>

            <AnimatePresence>
              {cart.couponOk !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mb-2.5 text-[11.5px] ${cart.couponOk ? "text-emerald-400" : "text-rose-300"}`}
                >
                  {cart.couponOk ? "۳۰٪ تخفیف با موفقیت اعمال شد." : "کد تخفیف واردشده معتبر نیست."}
                </motion.div>
              )}
            </AnimatePresence>

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

            <motion.button
              type="button"
              onClick={() => {
                cart.close();
                router.push("/checkout");
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 460, damping: 30 }}
              className="glass-brand w-full rounded-2xl py-3.5 text-[14px] font-bold text-white shadow-[0_4px_20px_rgba(255,45,60,0.3)]"
            >
              تکمیل خرید و ثبت سفارش
            </motion.button>
          </motion.div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
