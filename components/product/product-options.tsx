"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/components/cart/cart-provider";
import type { Product } from "@/lib/data";
import { toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductOptions({ product }: { product: Product }) {
  const [selColor, setSelColor] = useState(0);
  const [selSize, setSelSize] = useState(0);
  const [qty, setQty] = useState(1);
  const cart = useCart();

  const colorLabel = product.colors[selColor]?.label ?? "";
  const sizeLabel = product.sizes[selSize] ?? "";

  return (
    <div>
      {product.colors.length > 0 && (
        <div className="mt-7">
          <div className="text-ink-3 mb-3 text-[12px]">
            رنگ: <span className="font-bold text-white">{colorLabel}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c, i) => {
              const active = i === selColor;
              return (
                <motion.button
                  key={c.label}
                  type="button"
                  onClick={() => setSelColor(i)}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  className={cn(
                    "relative flex items-center gap-2.5 rounded-2xl px-4 py-3 text-[12.5px]",
                    active ? "text-white font-bold" : "glass text-ink-3",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="color-pill"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="glass-brand absolute inset-0 rounded-2xl"
                    />
                  )}
                  <span
                    className="relative block size-4 rounded-full ring-1 ring-white/25"
                    style={{ background: c.swatch }}
                  />
                  <span className="relative">{c.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {product.sizes.length > 0 && (
        <div className="mt-6">
          <div className="text-ink-3 mb-3 text-[12px]">
            سایز: <span className="font-bold text-white">{sizeLabel}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s, i) => {
              const active = i === selSize;
              return (
                <motion.button
                  key={s}
                  type="button"
                  onClick={() => setSelSize(i)}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  className={cn(
                    "relative min-w-[64px] rounded-2xl px-4 py-3 text-[12.5px] font-bold",
                    active ? "text-white" : "glass text-ink-3",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="size-pill"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="glass-brand absolute inset-0 rounded-2xl"
                    />
                  )}
                  <span className="relative">{s}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-7 flex items-stretch gap-2.5">
        <div className="glass flex items-center gap-1 rounded-2xl p-1.5">
          <motion.button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            whileTap={{ scale: 0.85 }}
            className="text-ink-2 hover:text-ink-1 grid size-9 place-items-center rounded-xl"
            aria-label="کم کردن تعداد"
          >
            <Minus className="size-4" strokeWidth={2.4} />
          </motion.button>
          <motion.span
            key={qty}
            initial={{ scale: 0.7, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 24 }}
            className="min-w-[28px] text-center text-[15px] font-bold text-white"
          >
            {toFaDigits(qty)}
          </motion.span>
          <motion.button
            type="button"
            onClick={() => setQty((q) => Math.min(9, q + 1))}
            whileTap={{ scale: 0.85 }}
            className="text-ink-2 hover:text-ink-1 grid size-9 place-items-center rounded-xl"
            aria-label="زیاد کردن تعداد"
          >
            <Plus className="size-4" strokeWidth={2.4} />
          </motion.button>
        </div>

          <motion.button
            type="button"
            onClick={() => {
              cart.addToCart(product, colorLabel, sizeLabel, qty);
              toast.success("محصول به سبد خرید اضافه شد");
            }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 460, damping: 30 }}
            className="glass-brand flex-1 rounded-2xl py-3.5 text-[15px] font-bold text-white shadow-[0_4px_20px_rgba(255,45,60,0.25)]"
          >
            افزودن به سبد خرید
          </motion.button>
      </div>
    </div>
  );
}
