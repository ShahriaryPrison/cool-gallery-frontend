import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "پیگیری سفارش", robots: { index: false, follow: false } };

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="size-10 border-2 border-white/20 border-t-brand rounded-full animate-spin" />
          <div className="text-ink-4 text-[13px]">در حال دریافت اطلاعات سفارش...</div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
