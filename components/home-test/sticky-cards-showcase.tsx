"use client";

import { motion, useScroll, useTransform, useSpring, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getBestSellers, type Product } from "@/lib/data";
import { formatToman, toFaDigits } from "@/lib/format";
import { ArrowLeft, Sparkles, Grid } from "lucide-react";

const COUNTER = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

export function StickyCardsShowcase({
  products: initialProducts,
}: {
  products?: Product[];
}) {
  const products = (initialProducts && initialProducts.length > 0 ? initialProducts : getBestSellers(10)).slice(0, 10);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxTranslate, setMaxTranslate] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    function measure() {
      if (!trackRef.current) return;
      const trackWidth = trackRef.current.scrollWidth;
      // Generous clearance ensures the last "View All" card easily glides to full view
      const clearance = window.innerWidth * 0.18;
      setMaxTranslate(Math.max(0, trackWidth - window.innerWidth + clearance));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [products.length]);

  const rawX = useTransform(scrollYProgress, [0, 0.92], [0, -maxTranslate]);
  const smoothX = useSpring(rawX, { stiffness: 85, damping: 25, restDelta: 0.5 });

  return (
    <section className="relative w-full bg-surface-0 z-20 pb-16 lg:pb-0">
      {/* Title & View All Header */}
      <div dir="rtl" className="max-w-[1200px] mx-auto px-6 lg:px-12 pt-16 pb-6 lg:pt-28 lg:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between pb-2"
        >
          <div className="text-right">
            <span className="text-brand text-[11px] font-bold tracking-[0.25em] uppercase block mb-1">
              NEW ARRIVALS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
              تازه‌ترین محصولات
            </h2>
          </div>

          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 text-brand text-xs sm:text-sm font-bold bg-brand/10 hover:bg-brand/20 border border-brand/30 px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(255,45,60,0.15)]"
          >
            <span>مشاهده همه</span>
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          </Link>
        </motion.div>
      </div>

      {/* ─── MOBILE VIEW: Native Touch-Smooth Horizontal Snap Carousel (Zero JS lag / 120fps smooth) ─── */}
      <div className="block lg:hidden px-4">
        <div
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-6 pt-2 scroll-smooth"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {products.map((product, i) => {
            const discountPct = product.oldPrice && product.oldPrice > product.price
              ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
              : null;

            return (
              <div
                key={product.id}
                className="relative shrink-0 w-[78vw] max-w-[300px] snap-center rounded-[28px] border border-white/10 bg-[#0a0a0e] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.5)] flex flex-col justify-between transform-gpu"
              >
                <div>
                  <div className="relative w-full aspect-[4/5] mb-3.5 rounded-[22px] overflow-hidden border border-white/10 bg-[#060608]">
                    <Image
                      src={product.image || "/products/fidget-dragon-black.png"}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 300px, 400px"
                      className="object-cover rounded-[22px]"
                    />
                    {discountPct ? (
                      <span className="absolute top-2.5 right-2.5 bg-brand text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(255,45,60,0.5)] z-10">
                        {discountPct}%
                      </span>
                    ) : product.badge && product.badge !== "جدید" ? (
                      <span className="absolute top-2.5 right-2.5 border border-white/20 bg-black/50 backdrop-blur-md text-white text-[9.5px] font-bold px-2.5 py-0.5 rounded-full z-10">
                        {product.badge}
                      </span>
                    ) : null}
                  </div>

                  <span className="text-white/35 text-[10.5px] font-medium block mb-1">
                    {product.cat}
                  </span>
                  <h3 className="text-base font-bold text-white leading-snug line-clamp-1 mb-1.5">
                    {product.name}
                  </h3>
                  <p className="text-white/45 text-[11px] leading-relaxed line-clamp-2 mb-3">
                    {product.description}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10 mt-2">
                  <div className="flex flex-col">
                    {product.oldPrice && (
                      <span className="text-white/35 line-through text-[9.5px]">
                        {formatToman(product.oldPrice)}
                      </span>
                    )}
                    <span className="text-sm font-extrabold text-white">
                      {formatToman(product.price)}{" "}
                      <span className="text-[9px] text-white/40 font-normal">تومان</span>
                    </span>
                  </div>

                  <Link
                    href={`/product/${product.id}`}
                    className="inline-flex items-center gap-1 text-white bg-white/10 hover:bg-brand px-3 py-1.5 rounded-xl text-xs font-medium transition-colors active:scale-95"
                  >
                    <span>مشاهده</span>
                    <ArrowLeft className="size-3" />
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Final "View All" card in mobile track */}
          <div
            className="relative shrink-0 w-[55vw] max-w-[220px] snap-center rounded-[28px] border border-brand/30 bg-gradient-to-b from-brand/10 to-transparent p-6 shadow-[0_12px_32px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center text-center transform-gpu"
          >
            <div className="size-12 rounded-2xl bg-brand/20 border border-brand/40 flex items-center justify-center mb-4 text-brand shadow-[0_0_16px_rgba(255,45,60,0.3)]">
              <Grid className="size-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">مشاهده تمام محصولات</h4>
            <p className="text-xs text-white/50 mb-5 leading-relaxed">کالکشن کامل اکسسوری، فیجت و زیورآلات خاص</p>
            <Link
              href="/shop"
              className="bg-brand text-white text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 shadow-[0_4px_16px_rgba(255,45,60,0.4)] active:scale-95 transition-transform"
            >
              <span>فروشگاه</span>
              <ArrowLeft className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ─── DESKTOP VIEW: 3D Horizontal Runway Showcase ─── */}
      <div
        ref={containerRef}
        style={{ height: `${(products.length + 1) * 85}vh` }}
        className="relative hidden lg:block"
      >
        <div dir="ltr" className="sticky top-0 h-[100dvh] w-full overflow-hidden flex items-center bg-surface-0">
          {/* Subtle Progress Bar */}
          <div dir="rtl" className="absolute top-8 left-6 right-6 lg:top-12 lg:left-16 lg:right-16 z-30 flex items-center gap-5">
            <div className="flex-1 h-px bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand origin-right"
                style={{ scaleX: scrollYProgress }}
              />
            </div>
          </div>

          <motion.div
            ref={trackRef}
            className="flex items-center gap-6 lg:gap-12 pl-[7vw] pr-[20vw] lg:pl-[12vw] lg:pr-[28vw]"
            style={{ x: smoothX }}
          >
            {products.map((product, i) => (
              <div dir="rtl" key={product.id} className="contents">
                <RunwayCard
                  product={product}
                  index={i}
                  progress={scrollYProgress}
                  total={products.length + 1}
                />
              </div>
            ))}

            {/* Final "View All" Slide in Desktop Runway */}
            <div dir="rtl" className="contents">
              <RunwayViewAllCard
                progress={scrollYProgress}
                total={products.length + 1}
                index={products.length}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function RunwayCard({
  product,
  index,
  progress,
  total,
}: {
  product: Product;
  index: number;
  progress: MotionValue<number>;
  total: number;
}) {
  const step = total > 1 ? 1 / (total - 1) : 1;
  const peak = index * step;

  const dist = useTransform(progress, (v) => Math.abs(v - peak));

  const rotateY = useTransform(progress, (v) => {
    const d = v - peak;
    return d * -18;
  });

  const scale = useTransform(dist, [0, 0.3, 1], [1, 0.9, 0.82]);
  const opacity = useTransform(dist, [0, 0.3, 0.7], [1, 0.75, 0.4]);

  const discountPct = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  return (
    <motion.div
      className="relative shrink-0 w-[78vw] max-w-[420px] lg:w-[26vw] lg:max-w-[400px]"
      style={{
        rotateY,
        scale,
        opacity,
        transformStyle: "preserve-3d",
      }}
    >
      <div className="relative w-full aspect-[4/5] mb-6 rounded-[32px] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] bg-[#09090c]">
        <div className="absolute inset-0 rounded-full blur-[70px] opacity-[0.12] bg-brand" />
        <Image
          src={product.image || "/products/fidget-dragon-black.png"}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 400px, 80vw"
          className="object-cover rounded-[32px] transition-transform duration-500 hover:scale-105"
        />
        {discountPct ? (
          <span className="absolute top-3 right-3 bg-brand text-white text-xs font-black tracking-wide px-3 py-1 rounded-full z-10 shadow-[0_0_12px_rgba(255,45,60,0.6)]">
            {discountPct}%
          </span>
        ) : product.badge && product.badge !== "جدید" ? (
          <span className="absolute top-3 right-3 border border-white/20 bg-black/40 backdrop-blur-md text-white/90 text-[10px] font-bold tracking-wide px-3 py-1 rounded-full z-10">
            {product.badge}
          </span>
        ) : null}
      </div>

      <div className="relative">
        <span className="text-white/40 text-xs font-medium block mb-2">
          {product.cat}
        </span>
        <h3 className="text-xl lg:text-2xl font-bold text-white leading-snug mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-white/45 text-xs leading-relaxed line-clamp-2 mb-5 max-w-[90%]">
          {product.description}
        </p>

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="flex flex-col">
            {product.oldPrice && (
              <span className="text-white/35 line-through text-[10px] mb-0.5">
                {formatToman(product.oldPrice)}
              </span>
            )}
            <span className="text-base font-bold text-white">
              {formatToman(product.price)} <span className="text-[10px] text-white/40 font-normal">تومان</span>
            </span>
          </div>

          <Link
            href={`/product/${product.id}`}
            className="group inline-flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-medium transition-colors"
          >
            مشاهده محصول
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function RunwayViewAllCard({
  progress,
  total,
  index,
}: {
  progress: MotionValue<number>;
  total: number;
  index: number;
}) {
  const step = total > 1 ? 1 / (total - 1) : 1;
  const peak = index * step;
  const dist = useTransform(progress, (v) => Math.abs(v - peak));
  const rotateY = useTransform(progress, (v) => (v - peak) * -18);
  const scale = useTransform(dist, [0, 0.3, 1], [1, 0.9, 0.82]);
  const opacity = useTransform(dist, [0, 0.3, 0.7], [1, 0.75, 0.4]);

  return (
    <motion.div
      className="relative shrink-0 w-[78vw] max-w-[420px] lg:w-[26vw] lg:max-w-[400px]"
      style={{
        rotateY,
        scale,
        opacity,
        transformStyle: "preserve-3d",
      }}
    >
      <div className="relative w-full aspect-[4/5] rounded-[32px] overflow-hidden border border-brand/40 bg-gradient-to-b from-brand/15 via-[#0d090d] to-[#060608] p-8 shadow-[0_20px_50px_rgba(255,45,60,0.15)] flex flex-col items-center justify-center text-center">
        <div className="size-16 rounded-3xl bg-brand/20 border border-brand/40 flex items-center justify-center mb-6 text-brand shadow-[0_0_24px_rgba(255,45,60,0.4)]">
          <Grid className="size-8" />
        </div>
        <h4 className="text-2xl font-black text-white mb-3">مشاهده تمام محصولات</h4>
        <p className="text-sm text-white/50 mb-8 leading-relaxed max-w-[260px]">
          کالکشن کامل اکسسوری‌های خاص، فیجت‌ها و زیورآلات کول
        </p>
        <Link
          href="/shop"
          className="group inline-flex items-center gap-2.5 bg-brand hover:bg-[#e01627] text-white text-sm font-bold px-7 py-3.5 rounded-2xl shadow-[0_8px_24px_rgba(255,45,60,0.45)] hover:scale-105 active:scale-95 transition-all"
        >
          <span>دیدن همه محصولات</span>
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}
