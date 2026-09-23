"use client";

import { motion, type Variants } from "motion/react";
import { Gem, Link as LinkIcon, Target, Sparkles, Star, Aperture, KeyRound, Gift, ChevronLeft } from "lucide-react";

// داده‌های دقیقاً مشابه تصویر ارسالی
const CATEGORY_DATA = [
  { title: "گردنبند", subtitle: "استیل ۳۱۶ و گوتیک", icon: Gem },
  { title: "دستبند", subtitle: "کارتیر و کوبایی", icon: LinkIcon },
  { title: "انگشتر", subtitle: "اسکلت و نگین‌دار", icon: Target },
  { title: "گوشواره", subtitle: "طرح‌های خاص و دا...", icon: Sparkles },
  { title: "پیرسینگ", subtitle: "ضدحساسیت و مین...", icon: Star },
  { title: "فیجت", subtitle: "مفصلی و ضد استر...", icon: Aperture },
  { title: "جاکلیدی", subtitle: "فلزی و چرم طبیعی", icon: KeyRound },
  { title: "ست هدیه", subtitle: "بسته‌بندی اختصاصی", icon: Gift },
];

// تنظیمات انیمیشن کانتینر (برای ایجاد تاخیر زنجیره‌ای)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // فاصله زمانی بین ظاهر شدن هر کارت
    },
  },
};

// تنظیمات انیمیشن هر کارت
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 60, damping: 12 },
  },
};

export function CategoriesParallax() {
  return (
    <section className="relative py-24 lg:py-32 px-6 lg:px-12 bg-surface-0 z-20">
      <div className="max-w-[1200px] mx-auto">
        
        {/* هدر بخش */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.2 }}
          className="flex items-center justify-between mb-10 lg:mb-16 pb-4"
        >
          <a 
            href="/categories" 
            className="text-[#ff2d3c] text-xs lg:text-sm font-bold hover:text-white transition-colors"
          >
            مشاهده همه
          </a>
          <h2 className="text-2xl lg:text-4xl font-extrabold text-white">
            دسته‌بندی محصولات
          </h2>
        </motion.div>

        {/* گرید دسته‌بندی‌ها — دو ستونه در موبایل و چهار ستونه در دسکتاپ */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4 lg:gap-5"
        >
          {CATEGORY_DATA.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.a
                key={i}
                variants={itemVariants}
                href={`/shop?cat=${encodeURIComponent(cat.title)}`}
                className="relative overflow-hidden flex items-center justify-between bg-[#08080a] border border-white/[0.08] rounded-2xl sm:rounded-3xl p-3 sm:p-4 lg:p-5 group hover:border-[#ff2d3c]/40 hover:bg-[#0c0c0f] hover:shadow-[0_8px_24px_rgba(255,45,60,0.15)] transition-all duration-300"
              >
                {/* واترمارک بزرگ آیکون در پس‌زمینه (سمت چپ) */}
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-[0.03] text-white group-hover:text-[#ff2d3c] group-hover:opacity-[0.06] transition-all duration-500 pointer-events-none">
                  <Icon className="size-20 sm:size-24 lg:size-32" strokeWidth={1} />
                </div>

                {/* محتوای سمت راست (آیکون و متن) */}
                <div className="flex items-center gap-2.5 sm:gap-3.5 z-10 min-w-0">
                  <div className="size-9 sm:size-11 lg:size-12 rounded-xl sm:rounded-2xl border border-[#ff2d3c]/25 bg-[#ff2d3c]/10 flex items-center justify-center group-hover:bg-[#ff2d3c]/20 group-hover:border-[#ff2d3c]/50 transition-all duration-300 shadow-[0_0_12px_rgba(255,45,60,0.1)] shrink-0">
                    <Icon className="size-4 sm:size-5 lg:size-6 text-[#ff2d3c]" strokeWidth={1.75} />
                  </div>
                  <div className="flex flex-col text-right min-w-0">
                    <h3 className="text-white font-black text-[13px] sm:text-[14.5px] lg:text-[15.5px] truncate group-hover:text-white transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-white/40 text-[10px] sm:text-[11px] lg:text-[12px] font-medium truncate mt-0.5">
                      {cat.subtitle}
                    </p>
                  </div>
                </div>

                {/* فلش سمت چپ */}
                <div className="z-10 pl-1 shrink-0">
                  <ChevronLeft className="size-3.5 sm:size-4 text-white/20 group-hover:text-[#ff2d3c] group-hover:-translate-x-0.5 transition-all duration-300" />
                </div>
              </motion.a>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
