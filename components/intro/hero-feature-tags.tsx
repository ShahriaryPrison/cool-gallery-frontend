"use client";

import { motion } from "motion/react";
import { ShieldCheck, Package, Zap, Sparkles } from "lucide-react";

export function HeroFeatureTags() {
  const badges = [
    {
      icon: ShieldCheck,
      text: "استیل ۳۱۶ عیار بالا",
      subtext: "ضدحساسیت و رنگ ثابت",
    },
    {
      icon: Package,
      text: "بسته‌بندی اختصاصی",
      subtext: "باکس دارک هدیه",
    },
    {
      icon: Zap,
      text: "ارسال سریع به سراسر کشور",
      subtext: "تحویل فوری",
    },
  ];

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2 lg:mt-8">
      {badges.map((b, i) => {
        const Icon = b.icon;
        return (
          <motion.div
            key={b.text}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 backdrop-blur-md transition-all hover:border-brand/40 hover:bg-white/[0.06] hover:shadow-[0_0_20px_rgba(255,45,60,0.15)]"
          >
            <span className="grid size-6 place-items-center rounded-lg bg-brand/15 text-brand">
              <Icon className="size-3.5" strokeWidth={2.2} />
            </span>
            <div className="flex flex-col text-right">
              <span className="text-ink-1 text-[11px] font-bold leading-tight">{b.text}</span>
              <span className="text-ink-4 text-[9.5px] leading-tight mt-0.5">{b.subtext}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
