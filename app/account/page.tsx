"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ChevronLeft,
  Heart,
  Headset,
  MapPin,
  Package,
  Settings,
  UserRound,
  type LucideIcon,
} from "lucide-react";

const MENU: { label: string; hint: string; icon: LucideIcon }[] = [
  { label: "سفارش‌های من", hint: "پیگیری وضعیت مرسوله و سابقه خرید", icon: Package },
  { label: "لیست علاقه‌مندی‌ها", hint: "کالاهای نشان‌شده و ذخیره‌شده", icon: Heart },
  { label: "آدرس‌های من", hint: "مدیریت و ویرایش آدرس‌های ارسال", icon: MapPin },
  { label: "پشتیبانی و ارتباط با ما", hint: "پاسخگویی همه‌روزه ۱۰ تا ۲۲", icon: Headset },
  { label: "تنظیمات حساب", hint: "اطلاعات کاربری و اعلان‌ها", icon: Settings },
];

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-[640px] px-5 pt-6 lg:pt-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="glass relative overflow-hidden rounded-3xl p-5"
      >
        <div className="flex items-center gap-4">
          <span className="glass-brand grid size-16 place-items-center rounded-2xl">
            <UserRound className="size-7 text-white" strokeWidth={1.8} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[18px] font-black text-white">حساب کاربری</div>
            <div className="text-ink-4 mt-1 text-[12.5px]">برای پیگیری مرسوله‌ها و ثبت سفارش وارد شوید</div>
          </div>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 460, damping: 30 }}
          className="glass-brand mt-4 w-full rounded-2xl py-3.5 text-[14px] font-bold text-white shadow-[0_4px_16px_rgba(255,45,60,0.2)]"
        >
          ورود / ثبت‌نام با شماره موبایل
        </motion.button>
      </motion.div>

      <div className="mt-4 space-y-2.5">
        {MENU.map((entry, i) => {
          const Icon = entry.icon;
          return (
            <motion.button
              key={entry.label}
              type="button"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07 + i * 0.05, type: "spring", stiffness: 320, damping: 28 }}
              whileTap={{ scale: 0.98 }}
              className="glass flex w-full items-center gap-3.5 rounded-2xl px-4 py-3.5 text-right transition-colors hover:bg-white/5"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/6">
                <Icon className="text-brand size-[18px]" strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-bold text-white">{entry.label}</span>
                <span className="text-ink-4 mt-0.5 block text-[11.5px]">{entry.hint}</span>
              </span>
              <ChevronLeft className="text-ink-5 size-4 shrink-0" />
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-center"
      >
        <Link href="/shop" className="text-brand text-[13px] font-bold">
          مشاهده فروشگاه و محصولات
        </Link>
      </motion.div>
    </div>
  );
}
