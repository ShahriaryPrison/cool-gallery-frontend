"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { ArrowLeft, Flame } from "lucide-react";
import { useIntroDone, useIntroLanded } from "@/components/intro/use-intro-done";

/** Hero copy enters line by line once the title sequence lifts. */
const heroLine: Variants = {
  hidden: { opacity: 0, y: 34, filter: "blur(12px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: 0.15 + i * 0.11, duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function HeroSection() {
  const introDone = useIntroDone();
  const logoLanded = useIntroLanded();
  const cue = introDone ? "show" : "hidden";

  return (
    <section className="relative flex h-[100dvh] min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#050507] px-4 pb-12 text-center sm:px-6 lg:h-[100dvh] lg:min-h-[100dvh] lg:px-12 z-10">
      {/* Cinematic Hero Background Image */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={introDone ? { scale: 1, opacity: 0.48 } : { scale: 1.08, opacity: 0 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src="/hero-bg.webp"
            alt="COOL Luxury Dark Accessories"
            fill
            priority
            quality={95}
            className="object-cover object-center"
          />
        </motion.div>
        {/* Deep atmospheric gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/60 to-[#050507]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,5,7,0.15)_0%,rgba(5,5,7,0.75)_75%,rgba(5,5,7,0.98)_100%)]" />
      </div>

      {/* Dynamic ambient drifting lights */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* Main Brand Glow - Drifts softly in the center */}
        <motion.div
          className="absolute top-1/2 left-1/2 size-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full sm:size-[620px]"
          style={{
            background: "radial-gradient(circle, rgba(255,45,60,0.3) 0%, rgba(255,45,60,0.1) 45%, transparent 70%)",
            filter: "blur(90px)",
          }}
          animate={{
            x: ["-50%", "-44%", "-54%", "-48%", "-50%"],
            y: ["-50%", "-56%", "-46%", "-52%", "-50%"],
            scale: [1, 1.12, 0.94, 1.08, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Secondary Crimson / Ember Orb - Drifts around bottom-right */}
        <motion.div
          className="absolute top-[40%] right-[10%] size-[380px] rounded-full sm:size-[520px]"
          style={{
            background: "radial-gradient(circle, rgba(230,20,60,0.22) 0%, rgba(255,80,40,0.08) 50%, transparent 72%)",
            filter: "blur(80px)",
          }}
          animate={{
            x: [0, 45, -35, 25, 0],
            y: [0, -35, 40, -20, 0],
            scale: [0.95, 1.15, 0.9, 1.1, 0.95],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Tertiary Velvet Violet / Dark Ruby Orb - Drifts around top-left */}
        <motion.div
          className="absolute bottom-[35%] left-[8%] size-[360px] rounded-full sm:size-[480px]"
          style={{
            background: "radial-gradient(circle, rgba(160,20,90,0.18) 0%, rgba(90,10,60,0.06) 60%, transparent 75%)",
            filter: "blur(75px)",
          }}
          animate={{
            x: [0, -40, 35, -20, 0],
            y: [0, 30, -35, 25, 0],
            scale: [1.05, 0.92, 1.18, 0.96, 1.05],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Subtle vignette to preserve deep edges */}
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
            initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
            animate={
              introDone
                ? { opacity: 1, y: 0, filter: "blur(0px)" }
                : { opacity: 0, y: 24, filter: "blur(10px)" }
            }
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            همیشه
          </motion.span>
          <span className="inline-flex items-center justify-center gap-3">
            {/* Stays invisible until the flying logo lands on it, then swaps in
                instantly so there is never a second copy on screen. */}
            <span
              id="hero-logo-slot"
              className={`inline-flex items-center justify-center ${
                logoLanded ? "opacity-100" : "opacity-0"
              }`}
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
              initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
              animate={
                introDone
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, y: 24, filter: "blur(10px)" }
              }
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              باش
            </motion.span>
          </span>
        </h1>

        <motion.div
          variants={heroLine}
          custom={1}
          initial="hidden"
          animate={cue}
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
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 lg:bottom-8"
        initial={{ opacity: 0 }}
        animate={introDone ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="flex flex-col items-center gap-0.5"
        >
          <div className="h-7 w-[1px] bg-gradient-to-b from-transparent via-white/25 to-white/50" />
          <div className="size-1.5 rounded-full bg-white/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
