"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Sparkles, Gift, ArrowLeft } from "lucide-react";

export function PromoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const cardY = useTransform(scrollYProgress, [0, 0.4], [60, 0]);
  const cardOpacity = useTransform(scrollYProgress, [0.05, 0.3], [0, 1]);
  const cardScale = useTransform(scrollYProgress, [0.05, 0.4], [0.94, 1]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[85vh] flex items-center justify-center py-28 lg:py-40 px-6 overflow-hidden"
    >
      {/* ─── Cinematic Spotlight ─── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* Central spotlight cone */}
        <div
          className="absolute top-1/2 left-1/2 size-[500px] lg:size-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(255,45,60,0.3) 0%, rgba(255,20,50,0.1) 35%, transparent 65%)",
          }}
        />

        {/* Vignette edge mask */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(5,5,7,0.7) 80%, #050507 100%)",
          }}
        />
      </div>

      {/* ─── Promo Card ─── */}
      <motion.div
        className="relative z-10 w-full max-w-[580px] mx-auto rounded-[2.5rem] p-[1px] bg-gradient-to-b from-brand/50 via-white/10 to-brand/20 shadow-[0_20px_70px_rgba(255,45,60,0.22),0_0_120px_rgba(0,0,0,0.8)]"
        style={{ y: cardY, opacity: cardOpacity, scale: cardScale }}
      >
        <div className="relative overflow-hidden rounded-[2.45rem] bg-[#0c090d]/90 p-8 sm:p-12 lg:p-14 text-center backdrop-blur-2xl">
          {/* Scanline overlay (CRT effect) */}
          <div className="pointer-events-none absolute inset-0 scanline-overlay opacity-30 rounded-[2.45rem]" />

          {/* Inner ambient card glow */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 size-72 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,45,60,0.25) 0%, transparent 70%)",
              filter: "blur(50px)",
            }}
          />

          {/* Top Badge */}
          <div className="relative inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/15 px-4 py-1.5 text-xs font-bold text-brand-soft shadow-[0_0_16px_rgba(255,45,60,0.3)] mb-6 sm:mb-8">
            <Sparkles className="size-3.5 text-brand animate-pulse" />
            <span>پیشنهاد ویژه و محدود</span>
          </div>

          {/* 30% Big Neon Text */}
          <div className="relative mb-3 sm:mb-5">
            <span className="font-black text-7xl sm:text-8xl lg:text-9xl tracking-tight bg-gradient-to-b from-white via-white/90 to-brand-soft bg-clip-text text-transparent animate-neon-flicker">
              ۳۰٪
            </span>
            {/* Neon glow reflection underneath */}
            <div
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-8 rounded-full blur-xl"
              style={{ background: "rgba(255,45,60,0.35)" }}
            />
          </div>

          <h3 className="relative text-2xl sm:text-3xl font-black text-white mb-3">
            تخفیف ویژه ست‌های هدیه
          </h3>

          <p className="relative text-ink-3 text-sm sm:text-base mb-8 max-w-sm mx-auto leading-relaxed">
            با وارد کردن کد تخفیف زیر هنگام ثبت سفارش، از ۳۰٪ تخفیف روی تمامی ست‌های کادویی بهره‌مند شوید.
          </p>

          {/* Discount Coupon Code Box */}
          <div className="relative group inline-flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.04] px-7 py-3.5 mb-8 backdrop-blur-md shadow-inner transition-all hover:border-brand/40 hover:bg-white/[0.07]">
            <span className="text-ink-4 text-xs font-medium">کد تخفیف:</span>
            <span className="text-xl sm:text-2xl font-black text-brand font-[family-name:var(--font-jakarta)] tracking-[0.2em] drop-shadow-[0_0_12px_rgba(255,45,60,0.6)]">
              COOL30
            </span>
          </div>

          {/* CTA Action Button */}
          <div className="relative">
            <a
              href="/shop?cat=%D8%B3%D8%AA%20%D9%87%D8%AF%DB%8C%D9%87"
              className="group inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand to-[#e01627] px-8 py-4 text-sm sm:text-base font-black text-white shadow-[0_8px_30px_rgba(255,45,60,0.45)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_12px_40px_rgba(255,45,60,0.65)] active:scale-95"
            >
              <Gift className="size-4.5 shrink-0 transition-transform group-hover:rotate-12" />
              <span>مشاهده و خرید ست‌های هدیه</span>
              <ArrowLeft className="size-4.5 shrink-0 transition-transform group-hover:-translate-x-1" strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
