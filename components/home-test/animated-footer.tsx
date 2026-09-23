"use client";

import { motion } from "motion/react";
// replaced icons with inline SVGs
import Image from "next/image";

export function AnimatedFooter() {
  return (
    // از افکت Reveal (نمایان شدن از پایین با اسکرول) استفاده شده
    <motion.footer
      initial={{ opacity: 0, y: 150, filter: "blur(20px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} // افکت سینمایی و کند
      viewport={{ once: true, amount: 0.1 }}
      className="relative w-full bg-[#030304] border-t border-white/5 pt-20 pb-10 px-6 lg:px-12 z-10"
    >
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 text-right">
        
        {/* برند و توضیحات */}
        <div className="flex flex-col gap-6">
          <div className="relative w-32 h-12 grayscale brightness-200">
            <Image 
              src="/images/logo.png" 
              alt="Cool Gallery Logo" 
              fill 
              className="object-contain object-right"
            />
          </div>
          <p className="text-white/50 text-sm leading-relaxed max-w-sm">
            گالری کول، ارائه دهنده خاص‌ترین و جذاب‌ترین اکسسوری‌های استیل، پیرسینگ، و فندک با بالاترین کیفیت. متفاوت بودن را با ما تجربه کنید.
          </p>
        </div>

        {/* لینک‌های سریع */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold text-lg mb-2">لینک‌های سریع</h4>
          <a href="#" className="text-white/50 hover:text-white transition-colors text-sm">محصولات استیل</a>
          <a href="#" className="text-white/50 hover:text-white transition-colors text-sm">پیرسینگ‌ها</a>
          <a href="#" className="text-white/50 hover:text-white transition-colors text-sm">درباره ما</a>
          <a href="#" className="text-white/50 hover:text-white transition-colors text-sm">تماس با ما</a>
        </div>

        {/* اطلاعات تماس */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold text-lg mb-2">ارتباط با ما</h4>
          <div className="flex items-center gap-3 text-white/50 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white/40"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>تهران، خیابان ولیعصر، مجتمع تجاری</span>
          </div>
          <div className="flex items-center gap-3 text-white/50 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white/40"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span dir="ltr">۰۲۱ - ۱۲۳۴۵۶۷۸</span>
          </div>
          <div className="flex items-center gap-3 text-white/50 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white/40"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <span dir="ltr">info@coolgallery.com</span>
          </div>
        </div>

        {/* شبکه‌های اجتماعی */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold text-lg mb-2">شبکه‌های اجتماعی</h4>
          <p className="text-white/50 text-sm mb-2">ما را در شبکه‌های اجتماعی دنبال کنید تا از جدیدترین محصولات باخبر شوید.</p>
          <div className="flex items-center gap-4 justify-end lg:justify-start">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all text-white/70">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all text-white/70">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </a>
          </div>
        </div>

      </div>

      {/* کپی رایت */}
      <div className="mt-20 pt-8 border-t border-white/5 text-center flex flex-col md:flex-row items-center justify-between gap-4 max-w-[1400px] mx-auto">
        <p className="text-white/30 text-xs">
          تمامی حقوق برای گالری کول محفوظ است. © ۲۰۲۴
        </p>
        <div className="flex gap-4 text-white/30 text-xs">
          <a href="#" className="hover:text-white">قوانین و مقررات</a>
          <a href="#" className="hover:text-white">حریم خصوصی</a>
        </div>
      </div>
    </motion.footer>
  );
}
