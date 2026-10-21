"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  X,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toastAddResult, useCart } from "@/components/cart/cart-provider";
import type { Product } from "@/lib/data";
import { formatToman } from "@/lib/format";

export interface HotspotPin {
  id: string;
  productId: string;
  tag: string;
  desktop: { x: string; y: string };
  mobile: { x: string; y: string };
}

export interface HeroCategorySlide {
  id: string;
  category: string;
  badge: string;
  badgeHighlight: string;
  badgeIcon: "flame" | "sparkles" | "zap";
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix?: string;
  description: string;
  ctaText: string;
  href: string;
  statsTag: string;
  image: string;
  mobileImage: string;
  alt: string;
  hotspots: HotspotPin[];
}

/** The template's own slides — shown while the merchant hasn't made any in the Avval editor. */
export const HERO_SLIDES: HeroCategorySlide[] = [
  {
    id: "cat-denim-wallet",
    category: "کیف و اکسسوری",
    badge: "طراحی خاص و دست‌دوز",
    badgeHighlight: "DENIM WALLET",
    badgeIcon: "sparkles",
    titlePrefix: "استایل متفاوت و جذاب با",
    titleHighlight: "کیف پول طرح شلوار جین",
    titleSuffix: "",
    description:
      "کیف پول فانتزی با طرح جیب شلوار جین دوخته‌شده از پارچه لی مرغوب؛ دارای آستر داخلی، ۴ جای کارت مجزا، محفظه اسکناس و پل آویز کلید و اکسسوری.",
    ctaText: "مشاهده و خرید کیف پول",
    href: "/products/f-ol-shlo-r-g-n",
    statsTag: "پارچه لی درجه‌یک · ۴ جای کارت",
    image: "/banners/hero-denim-wallet-left.jpg",
    mobileImage: "/banners/hero-denim-wallet-mobile.jpg",
    alt: "کیف پول طرح شلوار جین لی",
    hotspots: [
      {
        id: "spot-w1",
        productId: "f-ol-shlo-r-g-n",
        tag: "پارچه لی با پل آویز کلید",
        desktop: { x: "28%", y: "50%" },
        mobile: { x: "50%", y: "30%" },
      },
    ],
  },
  {
    id: "cat-fidgets",
    category: "فیجت",
    badge: "دسته‌بندی فیجت و دکوری‌های خاص",
    badgeHighlight: "3D ARTICULATED",
    badgeIcon: "sparkles",
    titlePrefix: "دکوری خاص ۳ بعدی با",
    titleHighlight: "فیگور مفصلی بی‌دندون",
    titleSuffix: "",
    description:
      "فیگور اژدهای بی‌دندون چاپ سه‌بعدی با فیلامنت سه‌لایه و مقاوم؛ تمام اجزای بدن مفصلی و متحرک، همراه با چسب زیر کار برای نصب روی سطوح صاف.",
    ctaText: "مشاهده و خرید فیگور بی‌دندون",
    href: "/products/f-or-b-dndon-mfsl",
    statsTag: "تمام مفصلی · طول ۱۳ سانت",
    image: "/banners/hero-dragon-left.jpg",
    mobileImage: "/banners/hero-dragon-mobile.jpg",
    alt: "دسته‌بندی فیجت‌های مفصلی و دکوری اژدها",
    hotspots: [
      {
        id: "spot-f1",
        productId: "f-or-b-dndon-mfsl",
        tag: "تمام اجزا مفصلی و متحرک",
        desktop: { x: "34%", y: "48%" },
        mobile: { x: "68%", y: "22%" },
      },
    ],
  },
];

/**
 * products: the store's live products; hotspots show the one whose slug they name.
 * slides: the merchant's slides from the Avval editor (lib/hero-content.ts); none → HERO_SLIDES.
 */
export function HeroSection({ products = [], slides: merchantSlides }: { products?: Product[]; slides?: HeroCategorySlide[] }) {
  const slides = merchantSlides && merchantSlides.length > 0 ? merchantSlides : HERO_SLIDES;
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cart = useCart();

  const total = slides.length;

  const nextSlide = useCallback(() => {
    setActiveHotspotId(null);
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setActiveHotspotId(null);
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    setActiveHotspotId(null);
    setCurrent(idx);
  };

  // Auto-play interval with pause-on-hover AND pause when a hotspot card is open
  useEffect(() => {
    if (isPaused || activeHotspotId !== null) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, isPaused, activeHotspotId]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    // RTL: Swipe left = next, swipe right = prev
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    setTouchStartX(null);
  };

  const slide = slides[current] ?? slides[0];

  // Helper renderer for hotspot pin and popover card
  const renderHotspot = (spot: HotspotPin, isMobile: boolean) => {
    const product = products.find((p) => p.id === spot.productId);
    if (!product) return null;
    const isOpen = activeHotspotId === spot.id;
    const pos = isMobile ? spot.mobile : spot.desktop;

    return (
      <div
        key={`${spot.id}-${isMobile ? "mob" : "desk"}`}
        className={cn(
          "pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 z-30",
          isMobile ? "block lg:hidden" : "hidden lg:block"
        )}
        style={{ left: pos.x, top: pos.y }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pulsing Target Pin Button */}
        <motion.button
          type="button"
          onClick={() => setActiveHotspotId(isOpen ? null : spot.id)}
          whileHover={{ scale: 1.18 }}
          whileTap={{ scale: 0.92 }}
          className={cn(
            "relative grid size-8 sm:size-9 place-items-center rounded-full border transition-all duration-300 cursor-pointer",
            isOpen
              ? "border-brand bg-brand text-white shadow-[0_0_24px_rgba(255,45,60,0.85)] scale-110"
              : "border-white/40 bg-black/65 text-white backdrop-blur-md hover:border-brand hover:bg-black/85 shadow-[0_0_16px_rgba(0,0,0,0.6)]"
          )}
          aria-label={spot.tag}
        >
          {/* Radar pulse rings */}
          <span className="pointer-events-none absolute -inset-1.5 rounded-full border border-brand/40 animate-ping opacity-60" />
          <span className="pointer-events-none absolute -inset-3 rounded-full border border-brand/20 animate-pulse" />

          {isOpen ? (
            <X className="size-4" strokeWidth={2.5} />
          ) : (
            <Plus className="size-4 text-brand" strokeWidth={2.5} />
          )}
        </motion.button>

        {/* Popover Product Card */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, y: 8, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 450, damping: 30 }}
              className="absolute z-50 mt-3 -translate-x-1/2 w-[230px] sm:w-[250px] rounded-2xl border border-white/18 bg-[#0a0a12]/92 p-3 sm:p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.9),0_0_35px_rgba(255,45,60,0.25)] backdrop-blur-2xl text-right"
              style={{ left: "50%" }}
            >
              <div className="flex items-start gap-2.5">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-black/50 border border-white/10">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover object-center"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-brand block">{spot.tag}</span>
                  <h4
                    className="text-[12px] sm:text-[13px] font-black text-white truncate mt-0.5"
                    title={product.name}
                  >
                    {product.name}
                  </h4>
                  <p className="text-[12px] sm:text-[13px] font-extrabold text-ink-2 mt-0.5">
                    {formatToman(product.price)}{" "}
                    <span className="text-[10px] font-normal text-white/50">تومان</span>
                  </p>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1.5">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.93 }}
                  onClick={async (e) => {
                    e.stopPropagation();
                    setActiveHotspotId(null);
                    const result = await cart.addToCart(
                      product,
                      product.colors[0]?.label || "",
                      product.sizes[0] || "",
                      1
                    );
                    if (!result.ok) toastAddResult(result);
                  }}
                  className="glass-brand flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 sm:py-2 text-[11px] sm:text-[12px] font-bold text-white shadow-[0_2px_12px_rgba(255,45,60,0.35)] hover:brightness-110 active:scale-95 cursor-pointer"
                >
                  <ShoppingCart className="size-3.5" strokeWidth={2.4} />
                  <span>خرید سریع</span>
                </motion.button>
                <Link
                  href={`/products/${product.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="glass text-ink-2 hover:text-white grid size-8 sm:size-9 place-items-center rounded-xl transition-colors hover:border-white/30 cursor-pointer"
                  title="مشاهده جزئیات کامل"
                >
                  <ArrowLeft className="size-3.5 sm:size-4" strokeWidth={2.2} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <section
      className="relative w-full overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={() => {
        if (activeHotspotId) setActiveHotspotId(null);
      }}
    >
      {/* Full-bleed Banner */}
      <div className="relative w-full min-h-[680px] sm:min-h-[720px] lg:h-[clamp(720px,100svh,1000px)] overflow-hidden bg-[#050507]">
        {/* Background Image Slides with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            {/* Desktop Banner (16:9 Landscape) */}
            <div className="hidden lg:block absolute inset-0">
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority
                quality={90}
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>

            {/* Mobile Banner (3:4 Portrait with Product on Top) */}
            <div className="block lg:hidden absolute inset-0">
              <Image
                src={slide.mobileImage}
                alt={slide.alt}
                fill
                priority
                quality={90}
                sizes="100vw"
                className="object-cover object-top sm:object-center"
              />
            </div>

            {/* Atmosphere Overlays */}
            {/* Desktop Right-side Vignette (Darkening right side for Persian RTL text readability) */}
            <div className="hidden lg:block absolute inset-0 bg-gradient-to-l from-[#050507]/95 via-[#050507]/75 to-transparent" />

            {/* Mobile Bottom Vignette */}
            <div className="block lg:hidden absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/90 via-50% to-transparent" />

            {/* Subtle red ambient lighting glow around product */}
            <div
              className="pointer-events-none absolute top-1/3 left-1/4 size-[400px] rounded-full opacity-35"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,45,60,0.35) 0%, rgba(255,45,60,0.05) 50%, transparent 70%)",
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Render Interactive Lookbook Hotspots */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          {slide.hotspots.map((spot) => (
            <div key={spot.id}>
              {renderHotspot(spot, false)}
              {renderHotspot(spot, true)}
            </div>
          ))}
        </div>

        {/* Content Box (Mobile: Pinned to bottom; Desktop: Vertically centered on right) */}
        <div className="relative z-20 mx-auto flex h-full min-h-[680px] sm:min-h-[720px] lg:h-full w-full max-w-[1536px] flex-col justify-end lg:justify-center p-5 pb-20 sm:p-8 sm:pb-24 lg:px-20 lg:pt-20 lg:pb-24 pointer-events-none">
          <div className="w-full sm:max-w-[540px] lg:max-w-[620px] flex flex-col items-start text-right pointer-events-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id + "-content"}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-start gap-2.5 sm:gap-4.5 w-full"
              >
                {/* 2. Category Headline */}
                <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-[54px] font-black text-white leading-[1.25] tracking-tight drop-shadow-md">
                  <span>{slide.titlePrefix} </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-[#ff6b74] to-brand-glow drop-shadow-[0_0_24px_rgba(255,45,60,0.6)]">
                    {slide.titleHighlight}
                  </span>
                  {slide.titleSuffix && <span> {slide.titleSuffix}</span>}
                </h1>

                {/* 3. Description Subtitle */}
                <p className="text-xs sm:text-base lg:text-[16.5px] text-white/75 leading-relaxed max-w-xl font-normal drop-shadow-sm line-clamp-2 sm:line-clamp-none">
                  {slide.description}
                </p>

                {/* 4. Action Row: CTA Button + Stats Tag */}
                <div className="mt-1 sm:mt-2 flex w-full sm:w-auto items-center gap-2.5 sm:gap-4">
                  <Link
                    href={slide.href}
                    className="flex-1 sm:flex-initial group inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-5 sm:px-8 py-3 sm:py-4 text-[13.5px] sm:text-[15px] font-bold text-white shadow-[0_0_25px_rgba(255,45,60,0.45)] transition-all hover:bg-brand-deep hover:shadow-[0_0_40px_rgba(255,45,60,0.7)] active:scale-[0.97]"
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowLeft
                      className="size-4 transition-transform duration-300 group-hover:-translate-x-1"
                      strokeWidth={2.4}
                    />
                  </Link>

                  {/* Stats Tag */}
                  {slide.statsTag && (
                  <div className="shrink-0 flex items-center gap-2 rounded-2xl bg-black/60 border border-white/10 px-3.5 py-2.5 sm:px-4 sm:py-3.5 backdrop-blur-xl shadow-lg">
                    <span className="flex size-2 rounded-full bg-brand animate-pulse" />
                    <span className="text-xs sm:text-sm font-bold text-white/90">
                      {slide.statsTag}
                    </span>
                  </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Side Navigation Arrows (Desktop / Tablet) */}
        <button
          onClick={nextSlide}
          aria-label="اسلاید بعدی"
          className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 size-11 items-center justify-center rounded-2xl bg-black/50 border border-white/15 text-white/70 backdrop-blur-xl transition-all hover:bg-brand hover:text-white hover:border-brand hover:scale-105 shadow-xl cursor-pointer"
        >
          <ChevronRight className="size-5" />
        </button>

        <button
          onClick={prevSlide}
          aria-label="اسلاید قبلی"
          className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 size-11 items-center justify-center rounded-2xl bg-black/50 border border-white/15 text-white/70 backdrop-blur-xl transition-all hover:bg-brand hover:text-white hover:border-brand hover:scale-105 shadow-xl cursor-pointer"
        >
          <ChevronLeft className="size-5" />
        </button>

        {/* Bottom Curved Shape — gentle arc rising to the sides */}
        <svg
          aria-hidden
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 -bottom-px z-20 h-10 w-full sm:h-16 lg:h-24"
        >
          <defs>
            <linearGradient id="hero-curve-stroke" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#ff2d3c" stopOpacity="0.15" />
              <stop offset="0.3" stopColor="#ff2d3c" stopOpacity="0.85" />
              <stop offset="0.7" stopColor="#ff2d3c" stopOpacity="0.85" />
              <stop offset="1" stopColor="#ff2d3c" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <path
            d="M0,0 C260,100 480,100 720,100 C960,100 1180,100 1440,0 L1440,100 L0,100 Z"
            className="fill-surface-0"
          />
          <path
            d="M0,0 C260,100 480,100 720,100 C960,100 1180,100 1440,0"
            fill="none"
            stroke="url(#hero-curve-stroke)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            className="drop-shadow-[0_0_6px_rgba(255,45,60,0.8)]"
          />
        </svg>

        {/* Center Tab Notch holding the pagination */}
        <div className="absolute bottom-[-1px] left-1/2 z-30 -translate-x-1/2">
          <svg
            aria-hidden
            viewBox="0 0 240 44"
            className="pointer-events-none block h-9 w-[200px] sm:h-11 sm:w-[240px]"
          >
            <path
              d="M0,44 C34,44 48,4 84,2 C96,1 144,1 156,2 C192,4 206,44 240,44 Z"
              className="fill-surface-0"
            />
            <path
              d="M0,44 C34,44 48,4 84,2 C96,1 144,1 156,2 C192,4 206,44 240,44"
              fill="none"
              stroke="#ff2d3c"
              strokeOpacity="0.55"
              strokeWidth="1.2"
              className="drop-shadow-[0_0_5px_rgba(255,45,60,0.7)]"
            />
          </svg>
          <div className="absolute inset-x-0 bottom-2.5 sm:bottom-3.5 flex items-center justify-center gap-2 sm:gap-2.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(idx);
                }}
                aria-label={`رفتن به اسلاید ${idx + 1}`}
                className={cn(
                  "h-2 sm:h-2.5 rounded-full transition-all duration-400 cursor-pointer",
                  idx === current
                    ? "w-6 sm:w-8 bg-brand shadow-[0_0_14px_#ff2d3c]"
                    : "w-2 sm:w-2.5 bg-white/30 hover:bg-white/60"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
