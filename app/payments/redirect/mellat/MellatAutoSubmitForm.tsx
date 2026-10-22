"use client";

import { useEffect, useRef } from "react";

/**
 * Behpardakht Mellat (BPM) startpay requires an HTTP POST form with RefId
 * submitted from the merchant's verified domain to match Shaparak terminal records.
 */
export default function MellatAutoSubmitForm({ refId }: { refId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.submit();
  }, []);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5 py-24 text-center" dir="rtl">
      <div className="size-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      <p className="text-sm text-white/70">در حال اتصال به درگاه پرداخت به‌پرداخت ملت...</p>
      <form ref={formRef} method="POST" action="https://bpm.shaparak.ir/pgwchannel/startpay.mellat" className="hidden">
        <input type="hidden" name="RefId" value={refId} />
        <noscript>
          <button type="submit" className="mt-4 px-4 py-2 bg-white text-black rounded font-medium">
            کلیک کنید برای انتقال به درگاه پرداخت
          </button>
        </noscript>
      </form>
    </div>
  );
}
