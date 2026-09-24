"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Star, ShieldCheck, Truck, RotateCcw, Minus, Plus, Check } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/components/cart/cart-provider";
import { Reveal } from "@/components/motion/reveal";
import { ProductCard } from "@/components/product/product-card";
import { formatIrrAsToman, irrToToman } from "@/lib/api";
import { formatToman, toFaDigits } from "@/lib/format";
import type { Product } from "@/lib/data";
import type { ProductDetail, ProductVariant } from "@/lib/types";
import { cn } from "@/lib/utils";

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
        // If default variant has option values, select them
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

  // Active Main Image
  const [activeImage, setActiveImage] = useState<string>(() => {
    return (
      activeVariant?.images?.[0]?.url ||
      backendProduct?.images?.[0]?.url ||
      product.image ||
      "/products/fidget-dragon-black.png"
    );
  });

  // Handle option value click
  const handleOptionSelect = (optionId: number, valueId: number) => {
    const nextOptions = { ...selectedOptionValues, [optionId]: valueId };
    setSelectedOptionValues(nextOptions);

    // Find the option value object to check for an associated image
    const currentOpt = backendProduct?.options.find((o) => o.id === optionId);
    const currentVal = currentOpt?.values.find((v) => v.id === valueId);

    // If this option value has an image, switch immediately to it!
    if (currentVal?.image?.url) {
      setActiveImage(currentVal.image.url);
    }

    // Match variant with selected options
    if (backendProduct?.variants) {
      const selectedIds = Object.values(nextOptions);
      const matchedVariant = backendProduct.variants.find((v) =>
        selectedIds.every((id) => v.option_value_ids.includes(id))
      );

      if (matchedVariant) {
        setActiveVariant(matchedVariant);
        // If variant has specific image and option value didn't already override
        if (matchedVariant.images?.[0]?.url && !currentVal?.image?.url) {
          setActiveImage(matchedVariant.images[0].url);
        }
      }
    }
  };

  // Pricing calculations
  const priceToman = activeVariant
    ? irrToToman(activeVariant.base_price)
    : product.price;

  const compareAtToman = activeVariant?.compare_at_price
    ? irrToToman(activeVariant.compare_at_price)
    : product.oldPrice;

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

  // Gallery thumbnails
  const allGalleryImages = useMemo(() => {
    const images: { id: string | number; url: string; thumb_url?: string }[] = [];
    if (backendProduct?.images?.length) {
      backendProduct.images.forEach((img) => {
        if (!images.some((i) => i.url === img.url)) {
          images.push({ id: img.id, url: img.url, thumb_url: img.thumb_url || img.url });
        }
      });
    }
    // Also add option value images if not in list
    if (backendProduct?.options?.length) {
      backendProduct.options.forEach((opt) => {
        opt.values.forEach((v) => {
          if (v.image?.url && !images.some((i) => i.url === v.image!.url)) {
            images.push({ id: `opt-${v.id}`, url: v.image.url, thumb_url: v.image.thumb_url || v.image.url });
          }
        });
      });
    }
    if (images.length === 0 && product.image) {
      images.push({ id: "main", url: product.image, thumb_url: product.image });
    }
    return images;
  }, [backendProduct, product.image]);

  return (
    <div className="pb-24">
      {/* Back to shop */}
      <div className="px-5 pt-4 max-w-7xl mx-auto lg:px-12 lg:pt-8">
        <Link
          href="/shop"
          className="glass text-ink-2 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[12.5px] font-bold transition-colors hover:text-white"
        >
          <ArrowRight className="size-4" strokeWidth={2.2} />
          بازگشت به فروشگاه
        </Link>
      </div>

      <div className="max-w-7xl mx-auto lg:flex lg:items-start lg:gap-12 lg:px-12 lg:pt-8">
        {/* ── Left/Top: Product Main Image & Gallery ── */}
        <div className="px-5 pt-6 lg:sticky lg:top-28 lg:w-[48%] lg:shrink-0 lg:px-0 lg:pt-0">
          <motion.div
            key={activeImage}
            initial={{ opacity: 0.8, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="glass relative aspect-square w-full overflow-hidden rounded-[32px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)] bg-[#09090c]"
          >
            <Image
              src={activeImage}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 1024px) 500px, 90vw"
              className="object-cover rounded-[32px] transition-transform duration-500 hover:scale-105"
            />
            {product.badge && (
              <span className="glass-brand absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-bold text-white shadow-lg">
                {product.badge}
              </span>
            )}
          </motion.div>

          {/* Thumbnail Gallery Strip */}
          {allGalleryImages.length > 1 && (
            <div className="no-scrollbar mt-4 flex items-center gap-3 overflow-x-auto pb-2">
              {allGalleryImages.map((img) => {
                const isActive = activeImage === img.url;
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImage(img.url)}
                    className={cn(
                      "relative size-16 sm:size-20 shrink-0 overflow-hidden rounded-2xl border transition-all duration-300",
                      isActive
                        ? "border-brand shadow-[0_0_16px_rgba(255,45,60,0.5)] scale-105"
                        : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/30"
                    )}
                  >
                    <Image
                      src={img.thumb_url || img.url}
                      alt="تصویر محصول"
                      fill
                      className="object-cover rounded-2xl"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Value props badges */}
          <div className="mt-5 flex items-center justify-around rounded-2xl bg-white/[0.03] border border-white/6 p-3.5 text-[11.5px] text-ink-3">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-400" /> رنگ ثابت و ضدحساسیت
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="size-4 text-brand" /> ارسال سریع سراسر ایران
            </span>
            <span className="flex items-center gap-1.5">
              <RotateCcw className="size-4 text-amber-400" /> ۷ روز ضمانت بازگشت
            </span>
          </div>
        </div>

        {/* ── Right/Bottom: Details, Options, & Checkout ── */}
        <div className="px-5 pt-8 lg:flex-1 lg:px-0 lg:pt-0">
          <div className="flex items-center gap-2.5 text-[11.5px]">
            <span className="glass text-ink-2 rounded-full px-3 py-1 font-bold">
              {product.cat}
            </span>
            <span className="glass-brand flex items-center gap-1 rounded-full px-3 py-1 font-bold text-white">
              <Star className="size-3 fill-current" />
              {toFaDigits(product.rating || 4.9)}
            </span>
          </div>

          <h1 className="mt-4 text-[28px] leading-[1.3] font-black text-white lg:text-[36px]">
            {product.name}
          </h1>

          {/* Pricing Box */}
          <div className="mt-5 flex items-baseline gap-3">
            <div className="text-[30px] lg:text-[34px] font-black text-white">
              {formatToman(priceToman)}{" "}
              <span className="text-ink-4 text-[13px] font-normal">تومان</span>
            </div>
            {compareAtToman && compareAtToman > priceToman && (
              <div className="text-ink-5 text-[15px] line-through">
                {formatToman(compareAtToman)}
              </div>
            )}
          </div>

          {/* Dynamic Variant Options (Colors / Flavors / Sizes) */}
          {backendProduct?.options && backendProduct.options.length > 0 && (
            <div className="space-y-6 mt-6 pt-6 border-t border-white/8">
              {backendProduct.options.map((opt) => {
                const selectedValId = selectedOptionValues[opt.id];
                const currentVal = opt.values.find((v) => v.id === selectedValId)?.value;

                return (
                  <div key={opt.id}>
                    <div className="text-ink-3 mb-3 text-[13px]">
                      {opt.name}: <span className="font-bold text-white">{currentVal}</span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {opt.values.map((v) => {
                        const active = v.id === selectedValId;
                        return (
                          <motion.button
                            key={v.id}
                            type="button"
                            onClick={() => handleOptionSelect(opt.id, v.id)}
                            whileTap={{ scale: 0.94 }}
                            className={cn(
                              "relative flex items-center gap-2 rounded-2xl px-4 py-2.5 text-[12.5px] font-bold transition-all",
                              active
                                ? "glass-brand text-white border-brand/50 shadow-[0_0_18px_rgba(255,45,60,0.3)] ring-1 ring-brand"
                                : "glass text-ink-3 hover:text-white hover:border-white/20"
                            )}
                          >
                            {v.image && (
                              <img
                                src={v.image.thumb_url || v.image.url}
                                alt={v.value}
                                className="size-5 rounded-full object-cover ring-1 ring-white/20"
                              />
                            )}
                            <span>{v.value}</span>
                            {active && <Check className="size-3.5 ml-0.5 text-white" />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Stock Notification */}
          <div className="mt-5 text-[12px]">
            {!inStock ? (
              <span className="font-bold text-rose-500">ناموجود در انبار</span>
            ) : stockQty !== null && stockQty <= 3 ? (
              <span className="font-bold text-amber-400">
                تنها {toFaDigits(stockQty)} عدد در انبار باقی مانده است
              </span>
            ) : (
              <span className="text-emerald-400 font-medium">موجود در انبار</span>
            )}
          </div>

          {/* Quantity & Add to Cart */}
          <div className="mt-6 flex items-center gap-3">
            <div className="glass flex items-center rounded-2xl p-1 border border-white/8">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="text-ink-3 hover:text-white grid size-9 place-items-center rounded-xl transition-colors"
                aria-label="کاهش تعداد"
              >
                <Minus className="size-4" />
              </button>
              <span className="text-ink-1 min-w-[32px] text-center font-bold text-sm">
                {toFaDigits(qty)}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => (stockQty ? Math.min(stockQty, q + 1) : q + 1))}
                className="text-ink-3 hover:text-white grid size-9 place-items-center rounded-xl transition-colors"
                aria-label="افزایش تعداد"
              >
                <Plus className="size-4" />
              </button>
            </div>

            <motion.button
              type="button"
              disabled={!inStock}
              onClick={handleAddToCart}
              whileTap={{ scale: 0.96 }}
              className={cn(
                "flex-1 rounded-2xl py-3.5 text-sm font-black transition-all duration-300 shadow-[0_8px_30px_rgba(255,45,60,0.35)]",
                inStock
                  ? "bg-gradient-to-r from-brand to-[#e01627] text-white hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(255,45,60,0.55)]"
                  : "bg-white/10 text-white/40 cursor-not-allowed"
              )}
            >
              {inStock ? "افزودن به سبد خرید" : "ناموجود"}
            </motion.button>
          </div>

          {/* Description */}
          {product.description && (
            <Reveal className="mt-8 pt-6 border-t border-white/8">
              <h3 className="mb-3 text-[16px] font-black text-white">توضیحات محصول</h3>
              <p className="text-ink-3 text-[13.5px] leading-loose whitespace-pre-line">
                {product.description}
              </p>
            </Reveal>
          )}

          {/* Specs */}
          {product.specs && product.specs.length > 0 && (
            <Reveal className="mt-6">
              <div className="glass divide-y divide-white/8 overflow-hidden rounded-3xl border border-white/8">
                {product.specs.map((s) => (
                  <div key={s.k} className="flex justify-between px-5 py-3.5 text-[12.5px]">
                    <span className="text-ink-4">{s.k}</span>
                    <span className="text-ink-1 font-medium">{s.v}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </div>

      {/* ── Related Products (Disabled until backend implementation) ── */}
      {/*
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto pt-16 lg:pt-24 lg:px-12">
          <Reveal className="px-5 pb-4 lg:px-0">
            <h3 className="text-[19px] font-black text-white lg:text-[26px]">
              محصولات مرتبط و پیشنهادی
            </h3>
          </Reveal>
          <div
            className="no-scrollbar flex gap-3.5 overflow-x-auto px-5 pb-3 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {relatedProducts.map((p) => (
              <div key={p.id} className="w-[185px] shrink-0 lg:w-auto" style={{ scrollSnapAlign: "start" }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}
      */}
    </div>
  );
}
