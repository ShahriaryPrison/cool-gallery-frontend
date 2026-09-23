import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { SuccessAnimation } from "@/components/checkout/success-animation";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const orderCode = code ?? "۱۴۰۵-۸۲۳۹";

  return (
    <div className="mx-auto max-w-[520px] px-6 pt-16 text-center lg:pt-24">
      <SuccessAnimation />

      <h1 className="mt-7 text-[28px] font-black text-white">سفارش شما با موفقیت ثبت شد!</h1>
      <p className="text-ink-3 mt-3 text-[13.5px] leading-relaxed">
        سفارش شما در اسرع وقت بسته‌بندی و ارسال خواهد شد. کد رهگیری پستی به شماره موبایل شما پیامک می‌شود.
      </p>

      <div className="glass mx-auto mt-6 inline-flex items-center gap-3 rounded-2xl px-6 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <CheckCircle2 className="size-5 text-emerald-400" />
        <span className="text-ink-4 text-[12.5px]">کد پیگیری سفارش:</span>
        <span className="text-[16px] font-black text-white">{orderCode}</span>
      </div>

      <div className="mt-8 flex flex-col gap-2.5">
        <Link href="/shop" className="glass-brand rounded-2xl py-4 text-[14px] font-bold text-white shadow-[0_4px_18px_rgba(255,45,60,0.25)]">
          مشاهده سایر محصولات فروشگاه
        </Link>
        <Link href="/" className="glass text-ink-2 rounded-2xl py-4 text-[14px] font-medium transition-colors hover:text-white">
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}
