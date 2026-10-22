"use client";

import { useEffect, useRef } from "react";

/**
 * Saman/SEP's REST token flow hands back a token that must be POSTed (not
 * GET-navigated) to its payment page. This auto-submits that form on mount —
 * served from the merchant's own domain so the Referer Saman sees matches the
 * terminal's registered domain.
 */
export default function SamanAutoSubmitForm({ token }: { token: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.submit();
  }, []);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5 py-24 text-center" dir="rtl">
      <div className="size-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      <p className="text-sm text-white/70">در حال انتقال امن به درگاه پرداخت سامان...</p>
      <form ref={formRef} method="POST" action="https://sep.shaparak.ir/OnlinePG/OnlinePG" className="hidden">
        <input type="hidden" name="Token" value={token} />
        <noscript>
          <button type="submit" className="mt-4 px-4 py-2 bg-white text-black rounded font-medium">
            کلیک کنید برای انتقال به درگاه پرداخت
          </button>
        </noscript>
      </form>
    </div>
  );
}
