'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tag, X, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/components/cart/cart-provider';
import { toEnglishDigits } from '@/lib/digits';

interface CouponBoxProps {
  className?: string;
}

export function CouponBox({ className = '' }: CouponBoxProps) {
  const { coupon, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  if (coupon) {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-[#14141c] px-3.5 py-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2 min-w-0 text-xs">
            <Tag className="size-3.5 text-brand shrink-0" />
            <span className="text-white/70">کد</span>
            <span dir="ltr" className="font-bold text-white tracking-wider">
              {coupon.code}
            </span>
            {coupon.valid ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="size-3" />
                اعمال شد
              </span>
            ) : null}
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await removeCoupon();
              setBusy(false);
            }}
            className="text-xs font-medium text-rose-400 hover:text-rose-300 disabled:opacity-50 transition-colors"
          >
            {busy ? '…' : 'حذف'}
          </button>
        </div>
        {!coupon.valid && (
          <p className="text-[11px] text-rose-400">
            {coupon.message ?? 'این کد دیگر برای سبد شما معتبر نیست.'}
          </p>
        )}
      </div>
    );
  }

  if (!open) {
    return (
      <div className={className}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs sm:text-sm font-semibold text-brand hover:underline flex items-center gap-1.5 transition-all"
        >
          <Tag className="size-3.5" />
          <span>کد تخفیف دارید؟</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor="checkout-coupon-input" className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
          <Tag className="size-3.5 text-brand" />
          <span>کد تخفیف</span>
        </label>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="text-white/40 hover:text-white/80 p-0.5 rounded transition"
          aria-label="بستن"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const clean = toEnglishDigits(code.trim());
          if (!clean || busy) return;
          setBusy(true);
          setError(null);
          const res = await applyCoupon(clean);
          setBusy(false);
          if (res.ok) {
            setCode('');
          } else {
            setError(res.message ?? 'کد تخفیف معتبر نیست.');
          }
        }}
        className="flex gap-2"
      >
        <input
          id="checkout-coupon-input"
          autoFocus
          dir="ltr"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="مثال: OFF10"
          className="min-w-0 flex-1 rounded-xl bg-[#14141c] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand"
        />
        <motion.button
          type="submit"
          disabled={busy || !code.trim()}
          whileTap={{ scale: 0.96 }}
          className="shrink-0 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 px-4 text-xs sm:text-sm font-bold text-white transition-all disabled:opacity-50"
        >
          {busy ? '…' : 'اعمال'}
        </motion.button>
      </form>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[11px] text-rose-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
