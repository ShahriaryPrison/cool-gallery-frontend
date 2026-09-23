"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/components/cart/cart-provider";
import { ProductImage } from "@/components/product/product-image";
import type { Product } from "@/lib/data";
import { formatToman } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();

  return (
    <Link href={`/product/${product.id}`} className="block h-full">
      <motion.div
        whileTap={{ scale: 0.97 }}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="glass group flex h-full flex-col overflow-hidden rounded-[26px] p-2 hover:border-brand/40 transition-colors"
      >
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#09090c]">
          <ProductImage
            image={product.image}
            alt={product.name}
            category={product.cat}
            className="absolute inset-0 transition-transform duration-700 group-hover:scale-105 rounded-2xl"
            iconClassName="size-14"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          {product.badge && (
            <span className="glass-brand absolute top-2.5 right-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
              {product.badge}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-3.5">
          <div className="text-ink-4 text-[10.5px]">{product.cat}</div>
          <div className="text-ink-1 flex-1 text-[13px] leading-normal font-bold">{product.name}</div>
          <div className="flex items-end justify-between gap-1.5">
            <div>
              {product.oldPrice && (
                <div className="text-ink-5 text-[10.5px] line-through">{formatToman(product.oldPrice)}</div>
              )}
              <div className="text-[14.5px] font-black text-white">
                {formatToman(product.price)}{" "}
                <span className="text-ink-4 text-[9.5px] font-normal">تومان</span>
              </div>
            </div>
            <motion.button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                cart.addToCart(product, product.colors[0]?.label ?? "", product.sizes[0] ?? "", 1);
                toast.success("به سبد اضافه شد");
              }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 500, damping: 24 }}
              aria-label="افزودن به سبد"
              className="glass-brand grid size-9 shrink-0 place-items-center rounded-2xl text-white"
            >
              <Plus className="size-[18px]" strokeWidth={2.6} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
