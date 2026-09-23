"use client";

import { motion, useScroll, useTransform, useSpring, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getBestSellers, type Product } from "@/lib/data";
import { formatToman } from "@/lib/format";
import { ArrowLeft } from "lucide-react";

const COUNTER = ["01", "02", "03", "04", "05", "06", "07", "08"];

export function StickyCardsShowcase({
  products: initialProducts,
}: {
  products?: Product[];
}) {
  const allProducts = initialProducts && initialProducts.length > 0 ? initialProducts : getBestSellers(8);
  const products = allProducts.length > 4 ? allProducts.slice(4, 8) : allProducts;
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
      setMaxTranslate(Math.max(0, trackWidth - window.innerWidth));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [products.length]);

  const rawX = useTransform(scrollYProgress, [0, 1], [0, -maxTranslate]);
  const smoothX = useSpring(rawX, { stiffness: 90, damping: 30, restDelta: 0.5 });

  return (
    <section className="relative w-full bg-surface-0 z-20">
      {/* عنوان — قبل از شروع پین شدن، در جریان عادی صفحه */}
      <div className="text-center pt-24 pb-8 lg:pt-32 lg:pb-12 px-6">
        <span className="text-white/30 text-xs tracking-[0.35em] uppercase block mb-4">
          New Collection
        </span>
        <h2 className="text-3xl lg:text-5xl font-black text-white">
          تازه‌های گالری
        </h2>
      </div>

      <div
        ref={containerRef}
        style={{ height: `${products.length * 100}vh` }}
        className="relative"
      >
        <div dir="ltr" className="sticky top-0 h-[100dvh] w-full overflow-hidden flex items-center bg-surface-0">
          {/* نوار وضعیت مینیمال */}
          <div dir="rtl" className="absolute top-8 left-6 right-6 lg:top-12 lg:left-16 lg:right-16 z-30 flex items-center gap-5">
            <span className="text-xs text-white/40 tracking-[0.2em] shrink-0">
              {COUNTER[0]} — {COUNTER[products.length - 1] ?? String(products.length).padStart(2, "0")}
            </span>
            <div className="flex-1 h-px bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand origin-right"
                style={{ scaleX: scrollYProgress }}
              />
            </div>
          </div>

          <motion.div
            ref={trackRef}
            className="flex items-center gap-6 lg:gap-12 px-[7vw] lg:px-[12vw]"
            style={{ x: smoothX }}
          >
            {products.map((product, i) => (
              <div dir="rtl" key={product.id} className="contents">
                <RunwayCard
                  product={product}
                  index={i}
                  progress={scrollYProgress}
                  total={products.length}
                  counter={COUNTER[i] ?? String(i + 1).padStart(2, "0")}
                />
              </div>
            ))}
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
  counter,
}: {
  product: Product;
  index: number;
  progress: MotionValue<number>;
  total: number;
  counter: string;
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
      <div className="relative w-full aspect-[4/5] mb-6">
        <div className="absolute inset-0 rounded-full blur-[70px] opacity-[0.12] bg-brand" />
        <Image
          src={product.image || "/products/fidget-dragon-black.png"}
          alt={product.name}
          fill
          className="object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.55)] p-4"
        />
        {product.badge && (
          <span className="absolute top-2 right-0 border border-white/20 text-white/80 text-[10px] font-medium tracking-wide px-3 py-1 rounded-full">
            {product.badge}
          </span>
        )}
      </div>

      <div className="relative">
        <span className="text-white/35 text-[11px] tracking-[0.2em] block mb-2">
          N.{counter} — {product.cat}
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
