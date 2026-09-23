"use client";

import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValue,
  useSpring,
  useMotionValueEvent,
} from "motion/react";
import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBestSellers, type Product } from "@/lib/data";
import { formatToman } from "@/lib/format";

const THEMES = [
  { accent: "#ff2d3c", glow: "rgba(255,45,60,0.35)" },
  { accent: "#3b82f6", glow: "rgba(59,130,246,0.3)" },
  { accent: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
  { accent: "#10b981", glow: "rgba(16,185,129,0.3)" },
];

const COUNTER = ["01", "02", "03", "04"];

export function DesktopWheelShowcase({
  products: initialProducts,
}: {
  products?: Product[];
}) {
  const [active, setActive] = useState(0);
  const products = initialProducts && initialProducts.length > 0 ? initialProducts.slice(0, 4) : getBestSellers(4);
  const containerRef = useRef<HTMLElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const maxIdx = Math.max(0, products.length - 1);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const newActive = Math.min(maxIdx, Math.max(0, Math.round(latest * maxIdx)));
    if (newActive !== active) setActive(newActive);
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      mouseX.set(x * 18);
      mouseY.set(y * 12);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const theme = THEMES[active % THEMES.length];

  return (
    <section
      ref={containerRef}
      className="relative hidden lg:block h-[400vh] z-10"
    >
      <div
        className="sticky top-0 h-[100dvh] w-full overflow-hidden transition-colors duration-700"
        style={{ backgroundColor: "#050507" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* ─── Spotlight cone ─── */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-0"
          animate={{
            background: `radial-gradient(ellipse 60% 50% at 35% 50%, ${theme.glow} 0%, transparent 70%)`,
          }}
          transition={{ duration: 1 }}
        />

        {/* ─── Counter watermark ─── */}
        <AnimatePresence mode="wait">
          <motion.span
            key={`c-${active}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 0.04, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.6 }}
            className="pointer-events-none absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 text-[28vw] font-black text-white select-none cinematic-counter z-0"
          >
            {COUNTER[active]}
          </motion.span>
        </AnimatePresence>

        {/* ─── Vertical divider beam ─── */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 z-20">
          <div className="h-full w-full bg-gradient-to-b from-transparent via-brand/40 to-transparent animate-divider-pulse" />
        </div>

        {/* ─── SPLIT LAYOUT ─── */}
        <div className="relative z-10 flex h-full w-full">
          {/* ── LEFT: Product image ── */}
          <div className="relative flex w-1/2 items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`img-${active}`}
                initial={{ clipPath: "inset(100% 0 0 0)" }}
                animate={{ clipPath: "inset(0% 0 0 0)" }}
                exit={{ clipPath: "inset(0 0 100% 0)" }}
                transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {/* Glow behind product */}
                <div
                  className="absolute size-[420px] rounded-full blur-[80px] opacity-40 transition-colors duration-700"
                  style={{ backgroundColor: theme.accent }}
                />

                <motion.div
                  className="relative w-[380px] h-[380px] xl:w-[440px] xl:h-[440px] rounded-[32px] overflow-hidden border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] bg-[#09090c]"
                  style={{ x: springX, y: springY }}
                >
                  <Image
                    src={products[active]?.image ?? "/products/fidget-dragon-black.png"}
                    alt={products[active]?.name ?? ""}
                    fill
                    priority
                    sizes="(min-width: 1280px) 440px, 380px"
                    className="object-cover rounded-[32px] transition-transform duration-500 hover:scale-105"
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Badge */}
            {products[active]?.badge && (
              <span className="absolute top-28 left-10 bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-bold px-4 py-2 rounded-full z-30">
                {products[active].badge}
              </span>
            )}
          </div>

          {/* ── RIGHT: Text content ── */}
          <div className="relative flex w-1/2 flex-col items-start justify-center px-12 xl:px-20">
            {/* Category + frame counter */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`meta-${active}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-4 mb-5"
              >
                <span className="cinematic-counter text-xs text-white/30 tracking-[0.3em] uppercase">
                  FRAME {COUNTER[active]}/{COUNTER[products.length - 1]}
                </span>
                <span className="h-px w-8 bg-white/20" />
                <span className="text-sm text-white/50 font-medium">
                  {products[active]?.cat}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Title with wipe */}
            <AnimatePresence mode="wait">
              <motion.h2
                key={`t-${active}`}
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                animate={{ clipPath: "inset(0 0% 0 0)" }}
                exit={{ clipPath: "inset(0 0 0 100%)" }}
                transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                className="text-4xl xl:text-5xl font-black text-white leading-tight mb-5"
              >
                {products[active]?.name}
              </motion.h2>
            </AnimatePresence>

            {/* Description */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`d-${active}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-white/60 text-base xl:text-lg leading-relaxed max-w-lg mb-8"
              >
                {products[active]?.description}
              </motion.p>
            </AnimatePresence>

            {/* Price & Specs */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-black text-white">
                {formatToman(products[active]?.price ?? 0)}
              </span>
              <span className="text-sm text-white/50">تومان</span>
              {products[active]?.oldPrice && (
                <span className="text-sm text-white/30 line-through mr-2">
                  {formatToman(products[active].oldPrice)}
                </span>
              )}
            </div>

            {/* Specs pills */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`s-${active}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="flex flex-wrap gap-2 mb-10"
              >
                {products[active]?.specs?.slice(0, 3).map((spec, i) => (
                  <span
                    key={i}
                    className="text-xs border border-white/10 bg-white/[0.04] backdrop-blur-sm rounded-lg px-3 py-1.5 text-white/70"
                  >
                    <span className="text-white/40 ml-1">{spec.k}:</span>{" "}
                    {spec.v}
                  </span>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* CTA */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`cta-${active}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Link
                  href={`/product/${products[active]?.id}`}
                  className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-black shadow-[0_10px_30px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-105 hover:shadow-[0_15px_40px_rgba(255,255,255,0.35)] active:scale-95"
                >
                  <span>مشاهده و خرید</span>
                  <ArrowLeft
                    className="size-4 transition-transform group-hover:-translate-x-1"
                    strokeWidth={2.4}
                  />
                </Link>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="absolute bottom-12 left-12 xl:left-20 flex items-center gap-3">
              {products.map((_, i) => (
                <div key={i} className="relative">
                  <div
                    className={`size-2 rounded-full transition-all duration-500 ${
                      i === active
                        ? "bg-white scale-125"
                        : "bg-white/20 scale-100"
                    }`}
                  />
                  {i === active && (
                    <motion.div
                      layoutId="dot-ring"
                      className="absolute -inset-1.5 rounded-full border border-white/40"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
