"use client";

import Image from "next/image";
import Link from "next/link";
import { AtSign, ShieldCheck, Truck, MapPin, Send } from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { useRef } from "react";

const LINKS = [
  { label: "همه محصولات", href: "/shop" },
  { label: "دسته‌بندی‌ها", href: "/categories" },
  { label: "ست‌های هدیه", href: "/shop?cat=%D8%B3%D8%AA%20%D9%87%D8%AF%DB%8C%D9%87" },
  { label: "حساب کاربری", href: "/account" },
];

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  
  // رهگیری اسکرول
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"]
  });

  // استفاده از اسپرینگ برای اینکه پارالکس خیلی نرم و فیزیکی باشه
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 15,
    restDelta: 0.001
  });

  // تغییرات دراماتیک‌تر برای ایجاد حس پارالکس (محتوا از ۲۰۰ پیکسل پایین‌تر میاد بالا)
  const y = useTransform(smoothProgress, [0, 1], [200, 0]);
  const opacity = useTransform(smoothProgress, [0, 0.3, 1], [0, 1, 1]);
  const scale = useTransform(smoothProgress, [0, 1], [0.9, 1]);

  return (
    <footer ref={footerRef} className="mt-10 px-5 lg:mt-16 lg:px-12 pb-24 overflow-hidden relative">
      <motion.div 
        style={{ y, opacity, scale }}
        className="glass rounded-[28px] p-6 lg:p-10 origin-bottom"
      >
        <div className="lg:flex lg:items-start lg:justify-between lg:gap-10">
          <div className="max-w-[440px]">
            <Image
              src="/logo.png"
              alt="COOL Gallery"
              width={868}
              height={336}
              className="h-7 w-auto drop-shadow-[0_0_16px_rgba(255,45,60,0.4)]"
            />
            <p className="text-ink-2 mt-4 text-[14px] font-bold">
              همیشه COOL باش
            </p>
            <p className="text-ink-3 mt-1.5 mb-5 text-[13px] leading-relaxed lg:mb-0">
              فروشگاه اکسسوری کول — عرضه تخصصی فیجت‌های مفصلی اژدها، زیورآلات استیل ۳۱۶ و دست‌سازه‌های چرمی (خرید آنلاین و حضوری).
            </p>
            <div className="text-ink-4 mt-3 flex items-start gap-2 text-[12px] leading-relaxed">
              <MapPin className="size-4 shrink-0 text-brand mt-0.5" />
              <span>قم، زنبیل‌آباد، میدان مفتح، روبه‌روی فست‌فود کیپو، پلاک ۷، مجموعه کول</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-3 text-[13px] lg:grid-cols-2 lg:gap-x-12 mt-6 lg:mt-0">
            {LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="text-ink-2 hover:text-brand font-medium transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="glass text-ink-3 flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px]">
              <AtSign className="size-3.5 text-brand" />
              cool_glry@
            </span>
            <span className="glass text-ink-3 flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px]">
              <Send className="size-3.5 text-brand" />
              تلگرام: ۰۹۳۶۶۸۰۹۰۹۴
            </span>
          </div>

          <div className="flex items-center gap-4 text-ink-4 text-[11.5px]">
            <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-emerald-400" /> ۷ روز ضمانت بازگشت</span>
            <span className="flex items-center gap-1.5"><Truck className="size-3.5 text-brand" /> ارسال سریع سراسر کشور</span>
          </div>
        </div>

        <div className="text-ink-6 mt-5 text-[11px]">© ۱۴۰۵ COOL Gallery — تمامی حقوق محفوظ است.</div>
      </motion.div>
    </footer>
  );
}
