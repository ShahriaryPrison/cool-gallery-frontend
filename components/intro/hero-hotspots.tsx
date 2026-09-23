"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, ShoppingCart, ArrowLeft, Sparkles } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { useLookbook } from "@/components/intro/lookbook-provider";
import { formatToman, toFaDigits } from "@/lib/format";
import { PRODUCTS, type Product } from "@/lib/data";

interface HotspotItem {
  id: string;
  x: string; // percentage from left
  y: string; // percentage from top
  product: Product;
  label: string;
}

export function HeroHotspots({ introDone }: { introDone: boolean }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const cart = useCart();
  const { isActive } = useLookbook();

  const barbedNecklace = PRODUCTS.find((p) => p.id === "n1") || PRODUCTS[1];
  const dragonFidget = PRODUCTS.find((p) => p.id === "f1") || PRODUCTS[0];

  const hotspots: HotspotItem[] = [
    {
      id: "pin-1",
      x: "36%",
      y: "52%",
      label: "گردنبند اسکلت گوتیک",
      product: barbedNecklace,
    },
    {
      id: "pin-2",
      x: "64%",
      y: "48%",
      label: "گردنبند پنتاگرام دارک",
      product: {
        ...barbedNecklace,
        id: "hero-p2",
        name: "گردنبند پنتاگرام و نشان دارک استیل",
        price: 520000,
      },
    },
  ];

  if (!introDone || !isActive) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-visible select-none">
      {/* Interactive Lookbook Hint Badge on top */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="pointer-events-auto absolute top-4 left-4 lg:top-5 lg:left-5"
      >
        <div className="glass flex items-center gap-1.5 rounded-full border border-white/12 bg-black/40 px-3 py-1 text-[11px] font-bold text-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <span className="relative flex size-2">
            <span className="bg-brand absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
            <span className="bg-brand relative inline-flex size-2 rounded-full" />
          </span>
          <Sparkles className="text-brand size-3" />
          لوک‌بوک زنده · پین‌ها را لمس کنید
        </div>
      </motion.div>

      {/* Hotspot Pins */}
      {hotspots.map((spot, idx) => {
        const isOpen = activeId === spot.id;

        return (
          <div
            key={spot.id}
            className="pointer-events-auto absolute"
            style={{ left: spot.x, top: spot.y }}
          >
            {/* Pulsing Target Pin */}
            <motion.button
              type="button"
              onClick={() => setActiveId(isOpen ? null : spot.id)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.4 + idx * 0.25, type: "spring", stiffness: 400, damping: 25 }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={`relative -translate-x-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full border transition-all duration-300 ${
                isOpen
                  ? "border-brand bg-brand text-white shadow-[0_0_24px_rgba(255,45,60,0.8)]"
                  : "border-white/40 bg-black/60 text-white backdrop-blur-md hover:border-brand hover:bg-black/80 shadow-[0_0_16px_rgba(0,0,0,0.6)]"
              }`}
              aria-label={spot.label}
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

            {/* Expanded Product Popover Card */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 10, filter: "blur(8px)" }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.88, y: 8, filter: "blur(6px)" }}
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  className="absolute z-50 mt-3 -translate-x-1/2 w-[220px] rounded-2xl border border-white/18 bg-[#0a0a12]/88 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_30px_rgba(255,45,60,0.2)] backdrop-blur-2xl"
                  style={{
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 text-right">
                      <span className="text-brand text-[9.5px] font-bold">استیل ۳۱۶ رنگ‌ثابت</span>
                      <h4 className="text-ink-1 truncate text-[12px] font-bold mt-0.5">
                        {spot.product.name}
                      </h4>
                      <p className="text-ink-2 text-[12.5px] font-extrabold mt-1">
                        {formatToman(spot.product.price)}{" "}
                        <span className="text-ink-4 text-[10px] font-normal">تومان</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center gap-1.5">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.94 }}
                      onClick={() => {
                        cart.addToCart(
                          spot.product,
                          spot.product.colors[0]?.label || "",
                          spot.product.sizes[0] || "",
                          1
                        );
                        cart.open();
                        setActiveId(null);
                      }}
                      className="glass-brand flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold text-white shadow-[0_2px_12px_rgba(255,45,60,0.3)]"
                    >
                      <ShoppingCart className="size-3" strokeWidth={2.4} />
                      خرید سریع
                    </motion.button>
                    <Link
                      href={`/product/${spot.product.id}`}
                      className="glass text-ink-2 hover:text-white grid size-8 place-items-center rounded-xl transition-colors"
                      title="مشاهده جزئیات"
                    >
                      <ArrowLeft className="size-3.5" strokeWidth={2.2} />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
