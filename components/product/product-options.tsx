"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/components/cart/cart-provider";
import type { Product } from "@/lib/data";
import type { ProductDetail, ProductVariant } from "@/lib/types";
import { formatIrrAsToman, irrToToman } from "@/lib/api";
import { formatToman, toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ProductOptionsProps {
  product: Product | any;
  backendProduct?: ProductDetail;
  onVariantChange?: (variant: ProductVariant) => void;
}

export function ProductOptions({
  product,
  backendProduct,
  onVariantChange,
}: ProductOptionsProps) {
  const cart = useCart();
  const [qty, setQty] = useState(1);

  // If backendProduct options are present
  const hasBackendOptions = Boolean(backendProduct?.options?.length);

  // Selected option values map: optionId -> valueId
  const [selectedOptionValues, setSelectedOptionValues] = useState<Record<number, number>>(() => {
    if (!backendProduct?.options) return {};
    const initial: Record<number, number> = {};
    backendProduct.options.forEach((opt) => {
      if (opt.values?.length) {
        initial[opt.id] = opt.values[0].id;
      }
    });
    return initial;
  });

  // Static colors & sizes fallback
  const [selColor, setSelColor] = useState(0);
  const [selSize, setSelSize] = useState(0);

  // Calculate active backend variant
  const activeVariant = useMemo<ProductVariant | null>(() => {
    if (!backendProduct?.variants?.length) return null;

    const selectedIds = Object.values(selectedOptionValues);
    const found = backendProduct.variants.find((v) =>
      selectedIds.every((id) => v.option_value_ids.includes(id))
    );

    return found || backendProduct.variants.find((v) => v.is_default) || backendProduct.variants[0];
  }, [backendProduct, selectedOptionValues]);

  const handleOptionSelect = (optionId: number, valueId: number) => {
    const next = { ...selectedOptionValues, [optionId]: valueId };
    setSelectedOptionValues(next);

    if (backendProduct?.variants) {
      const selectedIds = Object.values(next);
      const match = backendProduct.variants.find((v) =>
        selectedIds.every((id) => v.option_value_ids.includes(id))
      );
      if (match && onVariantChange) {
        onVariantChange(match);
      }
    }
  };

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

      const priceToman = irrToToman(activeVariant.base_price);
      const mainImage =
        activeVariant.images?.[0]?.url ||
        backendProduct.images?.[0]?.url ||
        product.image;

      cart.addItem(
        {
          variant_id: activeVariant.id,
          product_id: backendProduct.id,
          product_slug: backendProduct.slug,
          name: backendProduct.name,
          variant_label: variantOptionLabels || "پیش‌فرض",
          unit_price: priceToman,
          unit_price_irr: activeVariant.base_price,
          image: mainImage,
          stock_quantity: activeVariant.stock_quantity,
          in_stock: activeVariant.in_stock,
        },
        qty
      );
    } else {
      const colorLabel = product.colors?.[selColor]?.label ?? "";
      const sizeLabel = product.sizes?.[selSize] ?? "";
      cart.addToCart(product, colorLabel, sizeLabel, qty);
    }

    toast.success("محصول با موفقیت به سبد خرید اضافه شد");
  };

  return (
    <div>
      {/* Backend Dynamic Options */}
      {hasBackendOptions && backendProduct ? (
        <div className="space-y-6 mt-6">
          {backendProduct.options.map((opt) => {
            const selectedValId = selectedOptionValues[opt.id];
            const currentVal = opt.values.find((v) => v.id === selectedValId)?.value;

            return (
              <div key={opt.id}>
                <div className="text-ink-3 mb-2.5 text-[12.5px]">
                  {opt.name}: <span className="font-bold text-white">{currentVal}</span>
                </div>
                <div className="flex flex-wrap gap-2">
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
                            ? "glass-brand text-white border-brand/40 shadow-[0_0_16px_rgba(255,45,60,0.2)]"
                            : "glass text-ink-3 hover:text-white"
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
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Static Mock Options */
        <>
          {product.colors && product.colors.length > 0 && (
            <div className="mt-7">
              <div className="text-ink-3 mb-3 text-[12px]">
                رنگ: <span className="font-bold text-white">{product.colors[selColor]?.label}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c: any, i: number) => {
                  const active = i === selColor;
                  return (
                    <motion.button
                      key={c.label}
                      type="button"
                      onClick={() => setSelColor(i)}
                      whileTap={{ scale: 0.94 }}
                      className={cn(
                        "relative flex items-center gap-2.5 rounded-2xl px-4 py-3 text-[12.5px]",
                        active ? "text-white font-bold" : "glass text-ink-3"
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="color-pill"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          className="glass-brand absolute inset-0 rounded-2xl"
                        />
                      )}
                      <span
                        className="relative block size-4 rounded-full ring-1 ring-white/25"
                        style={{ background: c.swatch }}
                      />
                      <span className="relative">{c.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-6">
              <div className="text-ink-3 mb-3 text-[12px]">
                سایز: <span className="font-bold text-white">{product.sizes[selSize]}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s: string, i: number) => {
                  const active = i === selSize;
                  return (
                    <motion.button
                      key={s}
                      type="button"
                      onClick={() => setSelSize(i)}
                      whileTap={{ scale: 0.94 }}
                      className={cn(
                        "relative min-w-[64px] rounded-2xl px-4 py-3 text-[12.5px] font-bold",
                        active ? "text-white" : "glass text-ink-3"
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="size-pill"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          className="glass-brand absolute inset-0 rounded-2xl"
                        />
                      )}
                      <span className="relative">{s}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Stock warning if tracked and low */}
      {activeVariant?.stock_quantity !== null &&
        activeVariant?.stock_quantity !== undefined &&
        activeVariant.stock_quantity > 0 &&
        activeVariant.stock_quantity < 5 && (
          <div className="mt-4 text-[11.5px] text-amber-400 font-medium">
            تنها {toFaDigits(activeVariant.stock_quantity)} عدد در انبار باقی مانده است.
          </div>
        )}

      {/* Quantity & Add to Cart Action */}
      <div className="mt-7 flex items-stretch gap-2.5">
        <div className="glass flex items-center gap-1 rounded-2xl p-1.5">
          <motion.button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            whileTap={{ scale: 0.85 }}
            className="text-ink-2 hover:text-ink-1 grid size-9 place-items-center rounded-xl"
            aria-label="کم کردن تعداد"
          >
            <Minus className="size-4" strokeWidth={2.4} />
          </motion.button>
          <motion.span
            key={qty}
            initial={{ scale: 0.7, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            className="min-w-[28px] text-center text-[15px] font-bold text-white"
          >
            {toFaDigits(qty)}
          </motion.span>
          <motion.button
            type="button"
            onClick={() => setQty((q) => Math.min(activeVariant?.stock_quantity ?? 99, q + 1))}
            whileTap={{ scale: 0.85 }}
            className="text-ink-2 hover:text-ink-1 grid size-9 place-items-center rounded-xl"
            aria-label="زیاد کردن تعداد"
          >
            <Plus className="size-4" strokeWidth={2.4} />
          </motion.button>
        </div>

        <motion.button
          type="button"
          disabled={activeVariant?.in_stock === false}
          onClick={handleAddToCart}
          whileTap={{ scale: 0.97 }}
          className="glass-brand flex-1 rounded-2xl py-3.5 text-[15px] font-bold text-white shadow-[0_4px_20px_rgba(255,45,60,0.25)] disabled:opacity-40"
        >
          {activeVariant?.in_stock === false ? "ناموجود در انبار" : "افزودن به سبد خرید"}
        </motion.button>
      </div>
    </div>
  );
}
