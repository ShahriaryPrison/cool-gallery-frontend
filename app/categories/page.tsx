"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

import { CategoryIcon } from "@/components/product/category-icon";
import { CATEGORIES, PRODUCTS } from "@/lib/data";
import { toFaDigits } from "@/lib/format";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.94, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function CategoriesPage() {
  return (
    <div className="px-5 pt-6 lg:px-12 lg:pt-10">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[30px] leading-tight font-black text-white lg:text-[42px]"
      >
        دسته‌بندی محصولات
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="text-ink-4 mt-1.5 text-[13px]"
      >
        مجموعه کامل اکسسوری‌ها، فیجت‌ها و زیورآلات خاص گالری COOL ({toFaDigits(PRODUCTS.length)} کالا)
      </motion.p>

      <motion.div variants={container} initial="hidden" animate="show" className="mt-6 space-y-3">
        <motion.div variants={item}>
          <Link href="/shop">
            <motion.div
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 460, damping: 30 }}
              className="glass-brand relative flex items-center justify-between overflow-hidden rounded-3xl px-5 py-5 lg:px-8 lg:py-7"
            >
              <div className="relative">
                <div className="text-[19px] font-black text-white">مشاهده همه محصولات</div>
                <div className="mt-1 text-[12.5px] text-white/80">مشاهده کل کالکشن اکسسوری‌ها و فیجت‌ها</div>
              </div>
              <ArrowLeft className="relative size-5 text-white" strokeWidth={2.2} />
            </motion.div>
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {CATEGORIES.map((cat) => {
            const count = PRODUCTS.filter((p) => p.cat === cat).length;
            return (
              <motion.div key={cat} variants={item}>
                <Link href={`/shop?cat=${encodeURIComponent(cat)}`}>
                  <motion.div
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 460, damping: 30 }}
                    className="glass group relative h-[132px] overflow-hidden rounded-3xl p-4 lg:h-[168px] lg:p-5"
                  >
                    <CategoryIcon
                      category={cat}
                      className="absolute -bottom-4 -left-3 size-24 text-white/[0.07] transition-transform duration-500 group-hover:scale-110"
                      strokeWidth={1}
                    />
                    <div className="relative flex h-full flex-col justify-between">
                      <span className="glass-brand grid size-9 place-items-center rounded-xl">
                        <CategoryIcon category={cat} className="size-[18px] text-white" strokeWidth={2} />
                      </span>
                      <div>
                        <div className="text-[14.5px] font-bold text-white">{cat}</div>
                        <div className="text-ink-4 mt-0.5 text-[11px]">{toFaDigits(count)} محصول</div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
