"use client";

import { motion } from "motion/react";
import { Truck } from "lucide-react";
import { formatIrrAsToman } from "@/lib/api";
import { freeShippingProgress } from "@/lib/checkout/shipping";
import type { StorefrontShippingMethod } from "@/lib/types";

/**
 * «فقط X تومان تا ارسال رایگان» with a bar that fills toward the delivery method's free line;
 * «ارسال شما رایگان شد» once the cart reaches it. Draws nothing when there is no line to reach
 * (see `freeShippingProgress`). Amounts are IRR, as the API sends them.
 */
export function FreeShippingBar({
  method,
  subtotalIrr,
  coupon,
  className = "",
}: {
  method: StorefrontShippingMethod | null | undefined;
  subtotalIrr: number;
  coupon?: { valid: boolean; free_shipping?: boolean } | null;
  className?: string;
}) {
  const progress = freeShippingProgress(method, subtotalIrr, coupon);
  if (!progress) return null;

  const label = progress.reached
    ? "ارسال شما رایگان شد"
    : `فقط ${formatIrrAsToman(progress.remaining)} تومان تا ارسال رایگان`;

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.05] p-3 ${className}`}>
      <p className="flex items-center gap-2 text-[11.5px] leading-5 text-ink-3">
        <Truck className="size-3.5 shrink-0 text-brand" strokeWidth={2.2} />
        {progress.reached ? (
          <span className="font-bold text-emerald-400">{label}</span>
        ) : (
          <span>
            فقط <span className="font-bold text-white">{formatIrrAsToman(progress.remaining)} تومان</span> تا ارسال رایگان
          </span>
        )}
      </p>
      <div
        role="progressbar"
        aria-label="پیشرفت تا ارسال رایگان"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.percent}
        aria-valuetext={label}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
      >
        <motion.div
          className={`h-full rounded-full ${progress.reached ? "bg-emerald-400" : "bg-brand"}`}
          initial={false}
          animate={{ width: `${progress.percent}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
