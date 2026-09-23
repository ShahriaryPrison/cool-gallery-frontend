import Link from "next/link";
import { CheckCircle2, Package, ArrowLeft } from "lucide-react";

import { SuccessAnimation } from "@/components/checkout/success-animation";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const orderCode = code ?? "۱۴۰۵-۸۲۳۹";

  return (
    <div className="mx-auto max-w-[520px] px-6 pt-16 pb-20 text-center lg:pt-24">
      <SuccessAnimation />

      <h1 className="mt-7 text-[28px] font-black text-white">سفارش شما با موفقیت ثبت شد!</h1>
      <p className="text-ink-3 mt-3 text-[13.5px] leading-relaxed">
        سفارش شما در اسرع وقت بسته‌بندی و ارسال خواهد شد. وضعیت سفارش به شماره موبایل شما پیامک می‌شود.
      </p>

      <div className="glass mx-auto mt-6 inline-flex items-center gap-3 rounded-2xl px-6 py-4 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <CheckCircle2 className="size-5 text-emerald-400" />
        <span className="text-ink-4 text-[12.5px]">کد پیگیری سفارش:</span>
        <span className="text-[16px] font-mono font-black text-white">{orderCode}</span>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {code && (
          <Link
            href={`/order/${code}`}
            className="glass-brand rounded-2xl py-4 text-[14.5px] font-bold text-white shadow-[0_4px_18px_rgba(255,45,60,0.3)] inline-flex items-center justify-center gap-2"
          >
            <Package className="size-4.5" />
            <span>مشاهده و پیگیری جزئیات سفارش</span>
          </Link>
        )}
        <Link
          href="/shop"
          className="glass rounded-2xl py-3.5 text-[14px] font-medium text-ink-2 transition-colors hover:text-white"
        >
          مشاهده سایر محصولات فروشگاه
        </Link>
        <Link
          href="/"
          className="text-ink-4 hover:text-white text-[13px] py-2 transition-colors"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}
