"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { ArrowLeft, Flame } from "lucide-react";

/** Hero copy enters cleanly and quickly with pure GPU transforms (no expensive blur filter). */
const heroLine: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 + i * 0.08, duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function HeroSection() {
  return (
    <section className="relative flex h-[100dvh] min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#050507] px-4 pb-12 text-center sm:px-6 lg:h-[100dvh] lg:min-h-[100dvh] lg:px-12 z-10">
      {/* Cinematic Hero Background Image */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0">
          <Image
            src="/hero-bg.webp"
            alt="COOL Luxury Dark Accessories"
            fill
            priority
            quality={80}
            sizes="100vw"
            className="object-cover object-center opacity-50"
          />
        </div>
        {/* Deep atmospheric gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/60 to-[#050507]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,5,7,0.1)_0%,rgba(5,5,7,0.7)_75%,rgba(5,5,7,0.98)_100%)]" />
      </div>

      {/* Dynamic ambient lights (CSS static hardware-accelerated radial gradients) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* Center Brand Glow */}
        <div
          className="absolute top-1/2 left-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full sm:size-[580px] opacity-40"
          style={{
            background: "radial-gradient(circle, rgba(255,45,60,0.3) 0%, rgba(255,45,60,0.08) 45%, transparent 70%)",
          }}
        />

        {/* Ember Orb */}
        <div
          className="absolute top-[35%] right-[5%] size-[320px] rounded-full sm:size-[460px] opacity-35"
          style={{
            background: "radial-gradient(circle, rgba(230,20,60,0.2) 0%, rgba(255,80,40,0.06) 50%, transparent 70%)",
          }}
        />

        {/* Ruby Orb */}
        <div
          className="absolute bottom-[30%] left-[5%] size-[300px] rounded-full sm:size-[420px] opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(160,20,90,0.18) 0%, rgba(90,10,60,0.05) 60%, transparent 70%)",
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(5,5,7,0.85) 95%)",
          }}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-[680px] flex-col items-center">
        {/* Heading */}
        <h1 className="flex flex-col items-center justify-center text-[48px] leading-[1.1] font-black tracking-[-0.03em] text-white sm:text-[58px] lg:text-[78px]">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          >
            همیشه
          </motion.span>
          <span className="inline-flex items-center justify-center gap-3">
            <span
              id="hero-logo-slot"
              className="inline-flex items-center justify-center opacity-100"
            >
              <Image
                src="/logo.png"
                alt="COOL"
                width={868}
                height={336}
                priority
                className="h-12 w-auto drop-shadow-[0_0_30px_rgba(255,45,60,0.55)] sm:h-16 lg:h-22"
              />
            </span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              باش
            </motion.span>
          </span>
        </h1>

        <motion.div
          variants={heroLine}
          custom={1}
          initial="hidden"
          animate="show"
          className="mt-8 flex w-full max-w-[440px] items-center justify-center gap-3 px-2 sm:max-w-[480px] sm:gap-3.5 lg:mt-10"
        >
          <Link href="/shop" className="flex-[1.25] min-w-0">
            <motion.span
              whileTap={{ scale: 0.97 }}
              className="glass-brand flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl px-4 py-4 text-[13.5px] font-bold text-white shadow-[0_4px_24px_rgba(255,45,60,0.3)] transition-all sm:px-6 sm:text-[14.5px]"
            >
              <span>مشاهده همه محصولات</span>
              <ArrowLeft className="size-4 shrink-0" strokeWidth={2.4} />
            </motion.span>
          </Link>
          <Link href="#bestsellers" className="flex-1 min-w-0">
            <motion.span
              whileTap={{ scale: 0.97 }}
              className="glass text-ink-2 flex items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl px-3 py-4 text-[13.5px] font-medium transition-colors hover:text-white sm:px-5 sm:text-[14.5px]"
            >
              <Flame className="size-4 shrink-0 text-brand" />
              <span>پرفروش‌ترین‌ها</span>
            </motion.span>
          </Link>
        </motion.div>
      </div>

      {/* Scroll hint — bouncing chevron at the bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 lg:bottom-8">
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="flex flex-col items-center gap-0.5 opacity-70"
        >
          <div className="h-7 w-[1px] bg-gradient-to-b from-transparent via-white/25 to-white/50" />
          <div className="size-1.5 rounded-full bg-white/50" />
        </motion.div>
      </div>
    </section>
  );
}
