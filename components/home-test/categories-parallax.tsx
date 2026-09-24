"use client";

import { motion, type Variants } from "motion/react";
import {
  Gem,
  Link as LinkIcon,
  Target,
  Sparkles,
  Star,
  Aperture,
  KeyRound,
  Gift,
  ChevronLeft,
  Crown,
  ShoppingBag,
  Bot,
  Flame,
  Zap,
  Droplets,
  Cpu,
  Watch,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

// داده‌های پیش‌فرض
const DEFAULT_CATEGORY_DATA = [
  { title: "گردنبند", subtitle: "استیل ۳۱۶ و گوتیک", icon: Gem, slug: "necklaces" },
  { title: "دستبند", subtitle: "کارتیر و کوبایی", icon: LinkIcon, slug: "bracelets" },
  { title: "انگشتر", subtitle: "اسکلت و نگین‌دار", icon: Target, slug: "rings" },
  { title: "گوشواره", subtitle: "طرح‌های خاص و دارک", icon: Sparkles, slug: "earrings" },
  { title: "پیرسینگ", subtitle: "ضدحساسیت و مینیمال", icon: Star, slug: "piercings" },
  { title: "فیجت", subtitle: "مفصلی و ضد استرس", icon: Aperture, slug: "fidgets" },
  { title: "جاکلیدی", subtitle: "فلزی و چرم طبیعی", icon: KeyRound, slug: "keychains" },
  { title: "ست هدیه", subtitle: "بسته‌بندی اختصاصی", icon: Gift, slug: "gift-sets" },
];

const ICON_MAP: Record<string, LucideIcon> = {
  گردنبند: Gem,
  دستبند: LinkIcon,
  انگشتر: Target,
  گوشواره: Sparkles,
  پیرسینگ: Star,
  فیجت: Aperture,
  جاکلیدی: KeyRound,
  جاکارتی: CreditCard,
  "ست هدیه": Gift,
  کلاه: Crown,
  کیف: ShoppingBag,
  فیگور: Bot,
  پاد: Flame,
  "پاد دائمی": Zap,
  "پاد یکبار مصرف": Flame,
  سالت: Droplets,
  "کویل و کارتریج": Cpu,
  ساعت: Watch,
};

const SUBTITLE_MAP: Record<string, string> = {
  کلاه: "اسپرت، بیسبالی و بافت",
  کیف: "دوشی، کمری و چرم",
  فیگور: "اکشن فیگور و ماکت خاص",
  پاد: "پاد سیستم و ویپ اورجینال",
  "پاد دائمی": "پاد ماد و ویپ شارژی",
  "پاد یکبار مصرف": "پاف و طعم‌های جذاب",
  سالت: "سالت نیکوتین و ایجوس",
  "کویل و کارتریج": "لوازم یدکی و مصرفی",
  گردنبند: "استیل ۳۱۶ و گوتیک",
  دستبند: "کارتیر، چرم و کوبایی",
  انگشتر: "اسکلت، نگین و دارک",
  گوشواره: "طرح‌های خاص و دارک",
  پیرسینگ: "ضدحساسیت و مینیمال",
  فیجت: "مفصلی و ضد استرس",
  جاکلیدی: "فلزی و چرم طبیعی",
  جاکارتی: "چرم طبیعی و فلزی",
  "ست هدیه": "بسته‌بندی اختصاصی کادو",
  ساعت: "اسپرت و وینتیج",
};

// تنظیمات انیمیشن کانتینر
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

// تنظیمات انیمیشن هر کارت با ترنزیشن نرم
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

export function CategoriesParallax({
  categories,
}: {
  categories?: { id: number; name: string; slug: string }[];
}) {
  const displayCategories = categories && categories.length > 0
    ? categories.map((c) => {
        const found = DEFAULT_CATEGORY_DATA.find((d) => d.title === c.name || d.slug === c.slug);
        return {
          title: c.name,
          subtitle: SUBTITLE_MAP[c.name] || found?.subtitle || "کالکشن دست‌چین و خاص",
          icon: ICON_MAP[c.name] || found?.icon || Gem,
          slug: c.slug,
        };
      })
    : DEFAULT_CATEGORY_DATA;

  return (
    <section className="relative py-24 lg:py-32 px-6 lg:px-12 bg-surface-0 z-20">
      <div dir="rtl" className="max-w-[1200px] mx-auto">
        
        {/* هدر بخش (راست: عنوان، چپ: مشاهده همه) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.2 }}
          className="flex items-center justify-between mb-10 lg:mb-16 pb-4"
        >
          <div className="text-right">
            <span className="text-brand text-[11px] font-bold tracking-[0.25em] uppercase block mb-1">
              CATEGORIES
            </span>
            <h2 className="text-2xl lg:text-4xl font-extrabold text-white">
              دسته‌بندی محصولات
            </h2>
          </div>

          <a 
            href="/categories" 
            className="group inline-flex items-center gap-1.5 text-brand text-xs lg:text-sm font-bold bg-brand/10 hover:bg-brand/20 border border-brand/30 px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(255,45,60,0.15)]"
          >
            <span>مشاهده همه</span>
            <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          </a>
        </motion.div>

        {/* گرید دسته‌بندی‌ها — دو ستونه در موبایل و چهار ستونه در دسکتاپ */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4 lg:gap-5"
        >
          {displayCategories.map((cat, i) => {
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
