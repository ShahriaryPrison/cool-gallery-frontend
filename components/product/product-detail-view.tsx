"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import {
  ArrowRight,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/components/cart/cart-provider";
import { Reveal } from "@/components/motion/reveal";
import { irrToToman } from "@/lib/api";
import { formatToman, toFaDigits } from "@/lib/format";
import type { Variants } from "motion/react";
import type { Product } from "@/lib/data";
import type { ProductDetail, ProductVariant } from "@/lib/types";
import { cn } from "@/lib/utils";

// Luxurious 3D-depth scroll & slide transition
const imageVariants: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    scale: 0.94,
    y: direction > 0 ? 25 : -25,
    filter: "blur(3px)",
  }),
  center: {
    zIndex: 1,
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: (direction: number) => ({
    zIndex: 0,
    opacity: 0,
    scale: 1.04,
    y: direction > 0 ? -25 : 25,
    filter: "blur(3px)",
    transition: {
      duration: 0.28,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

interface GalleryItem {
  id: string | number;
  url: string;
  thumb_url: string;
  label: string;
  optionId?: number;
  valueId?: number;
}

interface ProductDetailViewProps {
  product: Product;
  backendProduct?: ProductDetail | null;
  relatedProducts?: Product[];
}

export function ProductDetailView({
  product,
  backendProduct,
  relatedProducts = [],
}: ProductDetailViewProps) {
  const cart = useCart();
  const [qty, setQty] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [direction, setDirection] = useState(0);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const mobileThumbRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const isUserInteractingRef = useRef(false);
  const userInteractionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Identify if any option has value images (e.g. Models or Colors)
  const visualOption = useMemo(() => {
    return backendProduct?.options?.find((opt) =>
      opt.values.some((v) => Boolean(v.image?.url))
    ) || null;
  }, [backendProduct]);

  // Non-visual options (e.g. Size, Material) that need separate text pills
  const textOptions = useMemo(() => {
    if (!backendProduct?.options) return [];
    return backendProduct.options.filter((opt) => opt.id !== visualOption?.id);
  }, [backendProduct, visualOption]);

  // Default variant
  const defaultVar =
    backendProduct?.variants.find((v) => v.is_default) ||
    backendProduct?.variants[0] ||
    null;

  const [activeVariant, setActiveVariant] = useState<ProductVariant | null>(defaultVar);

  // Selected option values: optionId -> valueId
  const [selectedOptionValues, setSelectedOptionValues] = useState<Record<number, number>>(() => {
    if (!backendProduct?.options?.length) return {};
    const initial: Record<number, number> = {};
    backendProduct.options.forEach((opt) => {
      if (opt.values?.length) {
        if (defaultVar?.option_value_ids?.length) {
          const matchVal = opt.values.find((v) => defaultVar.option_value_ids.includes(v.id));
          initial[opt.id] = matchVal ? matchVal.id : opt.values[0].id;
        } else {
          initial[opt.id] = opt.values[0].id;
        }
      }
    });
    return initial;
  });

  // Unified Gallery & Model Items (Zero Duplication!)
  const allGalleryImages = useMemo<GalleryItem[]>(() => {
    const items: GalleryItem[] = [];
    const seenUrls = new Set<string>();

    // 1. If we have a visual option (e.g. Models/Colors), add those as primary items
    if (visualOption) {
      visualOption.values.forEach((v) => {
        const url = v.image?.url || "";
        if (url && !seenUrls.has(url)) {
          seenUrls.add(url);
          items.push({
            id: `opt-${v.id}`,
            url,
            thumb_url: v.image?.thumb_url || url,
            label: v.value,
            optionId: visualOption.id,
            valueId: v.id,
          });
        }
      });
    }

    // 2. Add any general product images that aren't already included
    if (backendProduct?.images?.length) {
      backendProduct.images.forEach((img, idx) => {
        if (!seenUrls.has(img.url)) {
          seenUrls.add(img.url);
          items.push({
            id: img.id,
            url: img.url,
            thumb_url: img.thumb_url || img.url,
            label: `نمای ${toFaDigits(items.length + 1)}`,
          });
        }
      });
    }

    // 3. Fallback to product main image
    if (items.length === 0 && product.image) {
      items.push({
        id: "main",
        url: product.image,
        thumb_url: product.image,
        label: "اصلی",
      });
    }

    return items;
  }, [backendProduct, product.image, visualOption]);

  const activeImage =
    allGalleryImages[activeImageIdx]?.url || product.image || "/products/fidget-dragon-black.png";

  const markUserInteraction = useCallback(() => {
    isUserInteractingRef.current = true;
    if (userInteractionTimeoutRef.current) {
      clearTimeout(userInteractionTimeoutRef.current);
    }
    userInteractionTimeoutRef.current = setTimeout(() => {
      isUserInteractingRef.current = false;
    }, 1200);
  }, []);

  // Sync variant when option values change
  const syncVariant = useCallback(
    (nextOptions: Record<number, number>) => {
      if (!backendProduct?.variants) return;
      const selectedIds = Object.values(nextOptions);
      const matchedVariant = backendProduct.variants.find((v) =>
        selectedIds.every((id) => v.option_value_ids.includes(id))
      );
      if (matchedVariant) {
        setActiveVariant(matchedVariant);
      }
    },
    [backendProduct]
  );

  // Handle option select
  const handleOptionSelect = useCallback(
    (optionId: number, valueId: number, updateSlider = true) => {
      const nextOptions = { ...selectedOptionValues, [optionId]: valueId };
      setSelectedOptionValues(nextOptions);
      syncVariant(nextOptions);

      if (updateSlider) {
        const foundIdx = allGalleryImages.findIndex(
          (img) => img.optionId === optionId && img.valueId === valueId
        );
        if (foundIdx !== -1 && foundIdx !== activeImageIdx) {
          markUserInteraction();
          setDirection(foundIdx > activeImageIdx ? 1 : -1);
          setActiveImageIdx(foundIdx);
        }
      }
    },
    [selectedOptionValues, syncVariant, allGalleryImages, activeImageIdx, markUserInteraction]
  );

  const changeSlide = useCallback(
    (newIdx: number) => {
      markUserInteraction();
      const count = allGalleryImages.length;
      if (count <= 1) return;
      const next = (newIdx + count) % count;
      setDirection(next > activeImageIdx ? 1 : -1);
      setActiveImageIdx(next);

      // Auto-select linked model/option value
      const targetItem = allGalleryImages[next];
      if (targetItem?.optionId && targetItem?.valueId) {
        handleOptionSelect(targetItem.optionId, targetItem.valueId, false);
      }
    },
    [allGalleryImages, activeImageIdx, markUserInteraction, handleOptionSelect]
  );

  const goToNext = () => changeSlide(activeImageIdx + 1);
  const goToPrev = () => changeSlide(activeImageIdx - 1);

  // Track scroll position to update center image on desktop as user scrolls
  const { scrollYProgress } = useScroll({
    target: scrollTrackRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (isUserInteractingRef.current) return;
    const count = allGalleryImages.length;
    if (count <= 1) return;

    const targetIdx = Math.min(count - 1, Math.max(0, Math.floor(latest * count * 0.999)));
    if (targetIdx !== activeImageIdx) {
      setDirection(targetIdx > activeImageIdx ? 1 : -1);
      setActiveImageIdx(targetIdx);

      const targetItem = allGalleryImages[targetIdx];
      if (targetItem?.optionId && targetItem?.valueId) {
        handleOptionSelect(targetItem.optionId, targetItem.valueId, false);
      }
    }
  });

  // Auto-scroll thumbnail strip
  useEffect(() => {
    [thumbnailContainerRef.current, mobileThumbRef.current].forEach((container) => {
      if (!container) return;
      const activeEl = container.children[activeImageIdx] as HTMLElement;
      if (activeEl) {
        const scrollPos = activeEl.offsetLeft - container.offsetWidth / 2 + activeEl.offsetWidth / 2;
        container.scrollTo({ left: scrollPos, behavior: "smooth" });
      }
    });
  }, [activeImageIdx]);

  // Pricing calculations
  const priceToman = activeVariant ? irrToToman(activeVariant.base_price) : product.price;

  const compareAtToman = activeVariant?.compare_at_price
    ? irrToToman(activeVariant.compare_at_price)
    : product.oldPrice;

  const discountPercent =
    compareAtToman && compareAtToman > priceToman
      ? Math.round(((compareAtToman - priceToman) / compareAtToman) * 100)
      : null;

  // Inventory & Stock
  const inStock = activeVariant ? activeVariant.in_stock : true;
  const stockQty = activeVariant?.stock_quantity ?? null;

  // Add to cart action
  const handleAddToCart = () => {
    if (backendProduct && activeVariant) {
      const variantOptionLabels = backendProduct.options
        .map((opt) => {
          const valId = selectedOptionValues[opt.id];
          const val = opt.values.find((v) => v.id === valId);
          return val?.value;
        })
        .filter(Boolean)
        .join(" - ");

      cart.addItem(
        {
          variant_id: activeVariant.id,
          product_id: backendProduct.id,
          product_slug: backendProduct.slug,
          name: backendProduct.name,
          variant_label: variantOptionLabels || "پیش‌فرض",
          unit_price: priceToman,
          unit_price_irr: activeVariant.base_price,
          image: activeImage,
          stock_quantity: activeVariant.stock_quantity,
          in_stock: activeVariant.in_stock,
        },
        qty
      );
    } else {
      cart.addToCart(product, "", "", qty);
    }

    toast.success("محصول به سبد خرید اضافه شد");
  };

  const hasMultipleImages = allGalleryImages.length > 1;
  const currentActiveModelLabel = allGalleryImages[activeImageIdx]?.label;

  return (
    <div className="relative w-full bg-[#050507] text-white">
      {/* ── Top Header Navigation ── */}
      <div className="max-w-[1400px] mx-auto px-5 pt-4 pb-2 lg:px-10 lg:pt-6 flex items-center justify-between z-30 relative">
        <Link
          href="/shop"
          className="glass text-ink-2 hover:text-white inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all hover:scale-105 active:scale-95"
        >
          <ArrowRight className="size-3.5" strokeWidth={2.4} />
          <span>بازگشت به فروشگاه</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-ink-4">
          <span className="hidden sm:inline">دسته‌بندی:</span>
          <span className="text-brand font-bold bg-brand/10 border border-brand/20 px-3 py-1 rounded-full">
            {product.cat}
          </span>
        </div>
      </div>

      {/* ─── DESKTOP VIEW: 3-Column Luxury Center-Stage Scroll Sequence ─── */}
      <div
        ref={scrollTrackRef}
        style={{
          minHeight: hasMultipleImages ? `${Math.max(160, allGalleryImages.length * 65)}vh` : "auto",
        }}
        className="hidden lg:block relative max-w-[1440px] mx-auto px-8"
      >
        <div className="sticky top-20 h-[calc(100vh-5rem)] flex items-center">
          <div className="grid grid-cols-12 gap-8 w-full items-center">
            
            {/* ─── COLUMN 1 (Right): Product Story & Specs ─── */}
            <div className="col-span-3 text-right flex flex-col justify-center max-h-[82vh] overflow-y-auto no-scrollbar pr-2 py-4">
              <div className="flex items-center gap-2 text-xs mb-3">
                <span className="glass-brand flex items-center gap-1 rounded-full px-3 py-1 font-bold text-white shadow-[0_0_12px_rgba(255,45,60,0.3)]">
                  <Star className="size-3 fill-current" />
                  {toFaDigits(product.rating || 4.9)}
                </span>
                {product.badge && product.badge !== "جدید" && (
                  <span className="border border-white/15 bg-white/5 text-white/90 text-[11px] font-bold px-3 py-1 rounded-full">
                    {product.badge}
                  </span>
                )}
              </div>

              <h1 className="text-2xl xl:text-3xl font-black text-white leading-snug tracking-tight mb-4">
                {product.name}
              </h1>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">
                    درباره محصول
                  </h3>
                  <p className="text-ink-3 text-xs xl:text-sm leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Specs Table */}
              {product.specs && product.specs.length > 0 && (
                <div className="glass rounded-2xl border border-white/8 divide-y divide-white/6 overflow-hidden mb-4">
                  {product.specs.slice(0, 4).map((s) => (
                    <div key={s.k} className="flex justify-between px-3.5 py-2.5 text-xs">
                      <span className="text-ink-4">{s.k}</span>
                      <span className="text-ink-1 font-semibold">{s.v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Guarantees */}
              <div className="grid grid-cols-1 gap-2 pt-2 text-[11px] text-ink-4">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="size-3.5 text-emerald-400 shrink-0" />
                  <span>رنگ ثابت و ضمانت اصالت فیزیکی</span>
                </span>
                <span className="flex items-center gap-2">
                  <Truck className="size-3.5 text-brand shrink-0" />
                  <span>ارسال سریع و بسته‌بندی امن</span>
                </span>
                <span className="flex items-center gap-2">
                  <RotateCcw className="size-3.5 text-amber-400 shrink-0" />
                  <span>۷ روز مهلت تعویض و بازگشت</span>
                </span>
              </div>
            </div>

            {/* ─── COLUMN 2 (Center): Unified Interactive Model & Image Stage ─── */}
            <div className="col-span-6 flex flex-col items-center justify-center relative">
              {/* Central Spotlight Aura */}
              <div
                className="pointer-events-none absolute size-[500px] rounded-full opacity-35"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,45,60,0.28) 0%, rgba(255,45,60,0.06) 45%, transparent 70%)",
                }}
                aria-hidden
              />

              {/* Main Image Stage */}
              <div className="relative aspect-[3/4] w-full max-w-[420px] xl:max-w-[460px] rounded-[36px] overflow-hidden border border-white/10 bg-[#08080c] shadow-[0_24px_80px_rgba(0,0,0,0.8),0_0_40px_rgba(255,45,60,0.15)] select-none">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                  <motion.div
                    key={activeImageIdx}
                    custom={direction}
                    variants={imageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, { offset, velocity }) => {
                      const swipe = offset.x;
                      if (swipe > 40 || velocity.x > 0.3) {
                        goToNext();
                      } else if (swipe < -40 || velocity.x < -0.3) {
                        goToPrev();
                      }
                    }}
                    className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center p-4"
                  >
                    <Image
                      src={activeImage}
                      alt={product.name}
                      fill
                      priority
                      quality={90}
                      sizes="(min-width: 1024px) 500px, 90vw"
                      className="object-contain rounded-[32px] pointer-events-none drop-shadow-[0_16px_36px_rgba(0,0,0,0.7)]"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Top Badge Overlay */}
                {discountPercent && (
                  <span className="absolute top-4 right-4 bg-brand text-white text-xs font-black px-3 py-1 rounded-full shadow-[0_0_14px_rgba(255,45,60,0.6)] z-20 pointer-events-none">
                    {discountPercent}% تخفیف
                  </span>
                )}

                {/* Top Left Slide Number Indicator */}
                {hasMultipleImages && (
                  <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-xs font-bold text-white/90 shadow-lg pointer-events-none">
                    {toFaDigits(activeImageIdx + 1)} / {toFaDigits(allGalleryImages.length)}
                  </div>
                )}

                {/* Left/Right Navigation Arrows */}
                {hasMultipleImages && (
                  <>
                    <button
                      type="button"
                      onClick={goToNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 size-11 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/90 hover:text-white transition-all active:scale-90 shadow-lg"
                      aria-label="بعدی"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={goToPrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 size-11 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/90 hover:text-white transition-all active:scale-90 shadow-lg"
                      aria-label="قبلی"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                  </>
                )}

                {/* Bottom Step Progress Line */}
                {hasMultipleImages && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/12">
                    {allGalleryImages.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => changeSlide(i)}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300",
                          activeImageIdx === i
                            ? "w-6 bg-brand shadow-[0_0_10px_rgba(255,45,60,0.9)]"
                            : "w-1.5 bg-white/30 hover:bg-white/70"
                        )}
                        aria-label={`اسلاید ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* ── UNIFIED MODEL & THUMBNAIL STRIP ── */}
              {hasMultipleImages && (
                <div className="mt-4 w-full max-w-[460px]">
                  <div
                    ref={thumbnailContainerRef}
                    className="flex items-center gap-2.5 no-scrollbar overflow-x-auto p-1.5 scroll-smooth"
                  >
                    {allGalleryImages.map((img, i) => {
                      const isActive = activeImageIdx === i;
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => changeSlide(i)}
                          className={cn(
                            "relative flex flex-col items-center shrink-0 rounded-2xl border transition-all duration-300 p-1.5 bg-[#09090d]",
                            isActive
                              ? "border-brand shadow-[0_0_16px_rgba(255,45,60,0.5)] scale-105 ring-2 ring-brand/40 bg-brand/10"
                              : "border-white/10 opacity-55 hover:opacity-100 hover:border-white/30"
                          )}
                        >
                          <div className="relative size-12 xl:size-14 rounded-xl overflow-hidden mb-1 bg-[#060608]">
                            <Image
                              src={img.thumb_url || img.url}
                              alt={img.label}
                              fill
                              className="object-cover rounded-xl"
                            />
                          </div>
                          <span
                            className={cn(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none whitespace-nowrap",
                              isActive ? "text-white bg-brand" : "text-white/60 bg-white/5"
                            )}
                          >
                            {img.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ─── COLUMN 3 (Left): Pricing & Order Actions ─── */}
            <div className="col-span-3 text-right flex flex-col justify-center max-h-[82vh] overflow-y-auto no-scrollbar pl-2 py-4">
              <div className="glass rounded-[28px] border border-white/10 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
                {/* Price Display */}
                <div className="mb-5">
                  <span className="text-[11px] text-white/40 block mb-1">قیمت نهایی</span>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-black text-white tracking-tight">
                      {formatToman(priceToman)}
                    </span>
                    <span className="text-xs text-white/50">تومان</span>
                  </div>
                  {compareAtToman && compareAtToman > priceToman && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-white/35 line-through">
                        {formatToman(compareAtToman)}
                      </span>
                      <span className="text-[10px] font-bold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-md">
                        {discountPercent}% تخفیف
                      </span>
                    </div>
                  )}
                </div>

                {/* Non-Visual Options (e.g. Size, Material) */}
                {textOptions.length > 0 && (
                  <div className="space-y-4 mb-6 border-t border-white/8 pt-4">
                    {textOptions.map((opt) => {
                      const selectedValId = selectedOptionValues[opt.id];
                      const currentVal = opt.values.find((v) => v.id === selectedValId)?.value;

                      return (
                        <div key={opt.id}>
                          <div className="text-xs text-ink-3 mb-2 flex items-center justify-between">
                            <span>{opt.name}:</span>
                            <span className="font-bold text-white">{currentVal}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {opt.values.map((v) => {
                              const active = v.id === selectedValId;
                              return (
                                <button
                                  key={v.id}
                                  type="button"
                                  onClick={() => handleOptionSelect(opt.id, v.id)}
                                  className={cn(
                                    "relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
                                    active
                                      ? "glass-brand text-white border-brand/50 shadow-[0_0_12px_rgba(255,45,60,0.3)] ring-1 ring-brand"
                                      : "glass text-ink-3 hover:text-white hover:border-white/20"
                                  )}
                                >
                                  <span>{v.value}</span>
                                  {active && <Check className="size-3 text-white" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Active Model Summary Pill if visualOption exists */}
                {visualOption && (
                  <div className="mb-5 p-3 rounded-2xl bg-white/[0.04] border border-white/8 flex items-center justify-between">
                    <span className="text-xs text-white/50">{visualOption.name} انتخابی:</span>
                    <span className="text-xs font-bold text-white bg-brand/20 border border-brand/30 px-2.5 py-1 rounded-lg">
                      {currentActiveModelLabel}
                    </span>
                  </div>
                )}

                {/* Stock Status */}
                <div className="mb-5 text-xs">
                  {!inStock ? (
                    <span className="font-bold text-rose-500">ناموجود در انبار</span>
                  ) : stockQty !== null && stockQty <= 3 ? (
                    <span className="font-bold text-amber-400">
                      تنها {toFaDigits(stockQty)} عدد در انبار باقی مانده است
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-medium">موجود در انبار و آماده ارسال</span>
                  )}
                </div>

                {/* Quantity Controls & CTA Button */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-white/50">تعداد:</span>
                    <div className="glass flex items-center rounded-xl p-0.5 border border-white/10">
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="text-ink-3 hover:text-white size-8 grid place-items-center rounded-lg transition-colors active:scale-90"
                        aria-label="کاهش تعداد"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="min-w-[28px] text-center font-bold text-xs text-white">
                        {toFaDigits(qty)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty((q) => (stockQty ? Math.min(stockQty, q + 1) : q + 1))}
                        className="text-ink-3 hover:text-white size-8 grid place-items-center rounded-lg transition-colors active:scale-90"
                        aria-label="افزایش تعداد"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    disabled={!inStock}
                    onClick={handleAddToCart}
                    whileTap={{ scale: 0.96 }}
                    className={cn(
                      "w-full rounded-2xl py-3.5 text-sm font-black transition-all duration-300 shadow-[0_8px_30px_rgba(255,45,60,0.35)] flex items-center justify-center gap-2",
                      inStock
                        ? "bg-gradient-to-r from-brand to-[#e01627] text-white hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(255,45,60,0.55)] cursor-pointer"
                        : "bg-white/10 text-white/40 cursor-not-allowed"
                    )}
                  >
                    <ShoppingBag className="size-4" />
                    <span>{inStock ? "افزودن به سبد خرید" : "ناموجود"}</span>
                  </motion.button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ─── MOBILE VIEW: Unified Modern Gallery & Model Picker ─── */}
      <div className="block lg:hidden px-4 pt-2 pb-32">
        {/* Main Image Slider Viewport */}
        <div className="relative aspect-square w-full overflow-hidden rounded-[28px] border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.6)] bg-[#09090c] select-none mb-3">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={activeImageIdx}
              custom={direction}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, { offset, velocity }) => {
                const swipe = offset.x;
                if (swipe > 40 || velocity.x > 0.3) {
                  goToNext();
                } else if (swipe < -40 || velocity.x < -0.3) {
                  goToPrev();
                }
              }}
              className="absolute inset-0 cursor-grab active:cursor-grabbing w-full h-full p-3 flex items-center justify-center"
            >
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                sizes="90vw"
                className="object-contain rounded-[24px] pointer-events-none"
              />
            </motion.div>
          </AnimatePresence>

          {/* Top Badges */}
          {discountPercent ? (
            <span className="absolute top-3 right-3 bg-brand text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md z-20 pointer-events-none">
              {discountPercent}% تخفیف
            </span>
          ) : product.badge && product.badge !== "جدید" ? (
            <span className="glass-brand absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md z-20 pointer-events-none">
              {product.badge}
            </span>
          ) : null}

          {/* Top Left Slide Number Indicator */}
          {hasMultipleImages && (
            <div className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full text-[10.5px] font-bold text-white/90 shadow-md pointer-events-none">
              {toFaDigits(activeImageIdx + 1)} / {toFaDigits(allGalleryImages.length)}
            </div>
          )}

          {/* Arrow Buttons */}
          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 size-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-90"
                aria-label="بعدی"
              >
                <ChevronRight className="size-4" />
              </button>
              <button
                type="button"
                onClick={goToPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 size-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-90"
                aria-label="قبلی"
              >
                <ChevronLeft className="size-4" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {hasMultipleImages && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              {allGalleryImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => changeSlide(i)}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    activeImageIdx === i ? "w-4 bg-brand" : "w-1 bg-white/30"
                  )}
                  aria-label={`اسلاید ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── UNIFIED MOBILE MODEL & THUMBNAIL SELECTOR (NO DUPLICATION) ── */}
        {hasMultipleImages && (
          <div className="mb-4">
            {visualOption && (
              <div className="flex items-center justify-between px-1 mb-2 text-xs">
                <span className="text-white/60 font-medium flex items-center gap-1">
                  <Sparkles className="size-3 text-brand" />
                  <span>انتخاب {visualOption.name}:</span>
                </span>
                <span className="font-bold text-white bg-brand/15 border border-brand/30 px-2.5 py-0.5 rounded-full text-[11px]">
                  {currentActiveModelLabel}
                </span>
              </div>
            )}

            <div
              ref={mobileThumbRef}
              className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1.5 scroll-smooth p-1"
            >
              {allGalleryImages.map((img, i) => {
                const isActive = activeImageIdx === i;
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => changeSlide(i)}
                    className={cn(
                      "relative flex flex-col items-center shrink-0 rounded-2xl border transition-all duration-200 p-1 bg-[#09090d]",
                      isActive
                        ? "border-brand shadow-[0_0_12px_rgba(255,45,60,0.5)] scale-105 ring-2 ring-brand/40 bg-brand/10"
                        : "border-white/10 opacity-55 hover:opacity-100"
                    )}
                  >
                    <div className="relative size-13 sm:size-15 rounded-xl overflow-hidden mb-1 bg-[#060608]">
                      <Image
                        src={img.thumb_url || img.url}
                        alt={img.label}
                        fill
                        className="object-cover rounded-xl"
                      />
                    </div>
                    <span
                      className={cn(
                        "text-[9.5px] font-bold px-1.5 py-0.5 rounded-md leading-none whitespace-nowrap",
                        isActive ? "text-white bg-brand" : "text-white/60 bg-white/5"
                      )}
                    >
                      {img.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Product Title & Info */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 text-xs">
            <span className="glass-brand flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold text-white">
              <Star className="size-3 fill-current" />
              {toFaDigits(product.rating || 4.9)}
            </span>
            <span className="glass text-ink-3 rounded-full px-2.5 py-0.5">
              {product.cat}
            </span>
          </div>

          <h1 className="text-xl font-black text-white leading-tight mb-2">
            {product.name}
          </h1>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-black text-white">
              {formatToman(priceToman)}
            </span>
            <span className="text-xs text-white/50">تومان</span>
            {compareAtToman && compareAtToman > priceToman && (
              <span className="text-xs text-white/35 line-through mr-1">
                {formatToman(compareAtToman)}
              </span>
            )}
          </div>
        </div>

        {/* Text-Only Options on Mobile (e.g. Size / Material) */}
        {textOptions.length > 0 && (
          <div className="glass rounded-2xl p-4 border border-white/8 space-y-4 mb-4">
            {textOptions.map((opt) => {
              const selectedValId = selectedOptionValues[opt.id];
              const currentVal = opt.values.find((v) => v.id === selectedValId)?.value;

              return (
                <div key={opt.id}>
                  <div className="text-xs text-ink-3 mb-2 flex items-center justify-between">
                    <span>{opt.name}:</span>
                    <span className="font-bold text-white">{currentVal}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {opt.values.map((v) => {
                      const active = v.id === selectedValId;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleOptionSelect(opt.id, v.id)}
                          className={cn(
                            "relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
                            active
                              ? "glass-brand text-white border-brand/50 ring-1 ring-brand"
                              : "glass text-ink-3 hover:text-white"
                          )}
                        >
                          <span>{v.value}</span>
                          {active && <Check className="size-3 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Description & Specs on Mobile */}
        {product.description && (
          <div className="glass rounded-2xl p-4 border border-white/8 mb-4">
            <h3 className="text-xs font-bold text-white mb-2">توضیحات</h3>
            <p className="text-ink-3 text-xs leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}

        {product.specs && product.specs.length > 0 && (
          <div className="glass rounded-2xl border border-white/8 divide-y divide-white/6 overflow-hidden mb-4">
            {product.specs.map((s) => (
              <div key={s.k} className="flex justify-between px-3.5 py-2.5 text-xs">
                <span className="text-ink-4">{s.k}</span>
                <span className="text-ink-1 font-semibold">{s.v}</span>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Sticky Bottom Floating Action Bar */}
        <div className="fixed bottom-20 left-0 right-0 z-40 px-4">
          <div className="glass-dark border border-white/15 backdrop-blur-xl rounded-2xl p-3 shadow-[0_12px_36px_rgba(0,0,0,0.8)] flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-white/40 block">
                قیمت {visualOption ? `(${currentActiveModelLabel})` : "نهایی"}
              </span>
              <span className="text-base font-extrabold text-white">
                {formatToman(priceToman)}{" "}
                <span className="text-[9px] text-white/50">تومان</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="glass flex items-center rounded-xl p-0.5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="text-ink-3 hover:text-white size-7 grid place-items-center rounded-lg"
                  aria-label="کاهش"
                >
                  <Minus className="size-3" />
                </button>
                <span className="min-w-[20px] text-center font-bold text-xs text-white">
                  {toFaDigits(qty)}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => (stockQty ? Math.min(stockQty, q + 1) : q + 1))}
                  className="text-ink-3 hover:text-white size-7 grid place-items-center rounded-lg"
                  aria-label="افزایش"
                >
                  <Plus className="size-3" />
                </button>
              </div>

              <motion.button
                type="button"
                disabled={!inStock}
                onClick={handleAddToCart}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "rounded-xl px-4 py-2 text-xs font-black shadow-[0_4px_16px_rgba(255,45,60,0.4)] flex items-center gap-1.5",
                  inStock
                    ? "bg-brand text-white"
                    : "bg-white/10 text-white/40 cursor-not-allowed"
                )}
              >
                <ShoppingBag className="size-3.5" />
                <span>{inStock ? "خرید" : "ناموجود"}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
