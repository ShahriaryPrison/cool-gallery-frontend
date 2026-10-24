'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink, Package } from 'lucide-react';

interface TrackingCodeProps {
  carrier: string | null;
  number: string;
  url?: string | null;
}

export function TrackingCode({ carrier, number, url }: TrackingCodeProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the code stays visible to copy by hand.
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/20 bg-brand/5 p-4 text-xs sm:text-sm">
      <div className="flex items-center gap-2 text-white/80 min-w-0">
        <Package className="size-4 text-brand shrink-0" />
        <span>کد رهگیری مرسوله{carrier ? ` (${carrier})` : ''}:</span>
        <span dir="ltr" className="font-mono font-bold tracking-wider text-white break-all bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">
          {number}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 active:scale-95"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-400" />
              <span>کپی شد</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>کپی کد</span>
            </>
          )}
        </button>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand hover:bg-brand/90 px-3 py-1.5 text-xs font-bold text-white transition active:scale-95"
          >
            <span>پیگیری مرسوله</span>
            <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
