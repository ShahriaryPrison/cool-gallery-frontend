"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getBestSellers, type Product } from "@/lib/data";
import { formatToman } from "@/lib/format";
import { ArrowLeft, Sparkles } from "lucide-react";

const THEMES = [
  { accent: "#ff2d3c", glow: "rgba(255,45,60,0.22)" },
  { accent: "#3b82f6", glow: "rgba(59,130,246,0.2)" },
  { accent: "#f59e0b", glow: "rgba(245,158,11,0.2)" },
  { accent: "#10b981", glow: "rgba(16,185,129,0.2)" },
];

const COUNTER = ["01", "02", "03", "04", "05", "06", "07", "08"];

export function ProductShowcase({
  products: initialProducts,
}: {
  products?: Product[];
}) {
  const products = initialProducts && initialProducts.length > 0 ? initialProducts.slice(0, 4) : getBestSellers(4);
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const scrollLeft = Math.abs(el.scrollLeft);
    const itemWidth = el.offsetWidth * 0.85;
    if (itemWidth > 0) {
      const idx = Math.min(products.length - 1, Math.max(0, Math.round(scrollLeft / itemWidth)));
      if (idx !== activeIdx) {
        setActiveIdx(idx);
      }
    }
  };

  const scrollToIndex = (idx: number) => {
    if (!scrollContainerRef.current) return;
    const itemWidth = scrollContainerRef.current.offsetWidth * 0.85 + 16;
    scrollContainerRef.current.scrollTo({
      left: -(idx * itemWidth),
      behavior: "smooth",
    });
    setActiveIdx(idx);
  };

  return (
    <section id="products" className="relative w-full border-y border-white/5 bg-[#070709] py-14 overflow-hidden z-20">
      {/* Header */}
      <div className="px-6 mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-brand font-black text-sm">/</span>
            <span className="text-[11px] font-bold tracking-[0.2em] text-brand uppercase">
              آف ویژه
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">
            محصولات تخفیف‌دار
          </h2>
        </div>

        {/* Counter Indicators */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIdx === i ? "w-6 bg-brand shadow-[0_0_8px_rgba(255,45,60,0.6)]" : "w-1.5 bg-white/20"
              }`}
              aria-label={`اسلاید ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Touch-optimized snap carousel with 60fps native momentum */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar px-6 pb-4 pt-1"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {products.map((product, i) => {
          const theme = THEMES[i % THEMES.length];
          const isActive = activeIdx === i;
          const discountPct = product.oldPrice && product.oldPrice > product.price
            ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
            : null;

          return (
            <div
              key={product.id}
              className={`relative shrink-0 w-[82vw] max-w-[340px] snap-center rounded-[30px] p-4 transition-all duration-300 ${
                isActive
                  ? "bg-[#0d0d12] border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
                  : "bg-[#09090c] border border-white/5 opacity-80"
              }`}
            >
              {/* Product Card Glow */}
              <div
                className="pointer-events-none absolute inset-0 rounded-[30px] opacity-40 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(ellipse at 50% 30%, ${theme.glow} 0%, transparent 70%)`,
                }}
              />

              {/* Top Frame Counter Badge */}
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="cinematic-counter text-[10px] font-semibold tracking-widest text-white/40">
                  FRAME {COUNTER[i] ?? String(i + 1).padStart(2, "0")}/{COUNTER[products.length - 1] ?? "04"}
                </span>
                <span className="text-[10px] font-medium text-white/50 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                  {product.cat}
                </span>
              </div>

              {/* Product Image */}
              <div className="relative w-full aspect-square rounded-[24px] overflow-hidden bg-black/40 border border-white/10 mb-4 shadow-inner">
                <Image
                  src={product.image || "/products/fidget-dragon-black.png"}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 340px, 400px"
                  className="object-cover rounded-[24px] transition-transform duration-500 hover:scale-105"
                />
                {discountPct ? (
                  <span className="absolute top-2.5 right-2.5 bg-brand text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(255,45,60,0.6)] z-10">
                    {discountPct}%
                  </span>
                ) : product.badge ? (
                  <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg z-10">
                    {product.badge}
                  </span>
                ) : null}
              </div>

              {/* Info */}
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-extrabold text-white leading-tight line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-white/50 text-[11.5px] leading-relaxed line-clamp-2 min-h-[34px]">
                  {product.description}
                </p>

                {/* Specs */}
                {product.specs && product.specs.length > 0 && (
                  <div className="flex flex-wrap gap-1 my-1">
                    {product.specs.slice(0, 2).map((spec, idx) => (
                      <span
                        key={idx}
                        className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-[9.5px] text-white/70"
                      >
                        <span className="text-white/40 ml-1">{spec.k}:</span>
                        {spec.v}
                      </span>
                    ))}
                  </div>
                )}

                {/* Pricing & CTA Button */}
                <div className="mt-2 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    {product.oldPrice && (
                      <span className="text-white/35 line-through text-[10px]">
                        {formatToman(product.oldPrice)}
                      </span>
                    )}
                    <span className="text-base font-black text-brand">
                      {formatToman(product.price)}{" "}
                      <span className="text-[10px] font-normal text-white/40">تومان</span>
                    </span>
                  </div>

                  <Link
                    href={`/product/${product.id}`}
                    className="bg-brand text-white font-bold text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-[0_4px_16px_rgba(255,45,60,0.35)] active:scale-95 transition-all"
                  >
                    <span>خرید</span>
                    <ArrowLeft className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
