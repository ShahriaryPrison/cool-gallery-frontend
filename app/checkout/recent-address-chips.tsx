"use client";

import { History, Plus } from "lucide-react";
import {
  isAddressEmpty,
  isSameAddress,
  type CheckoutAddressFields,
  type RecentShippingAddress,
} from "@/lib/checkout/recentAddresses";

interface Props {
  addresses: RecentShippingAddress[];
  current: CheckoutAddressFields;
  onPick: (address: RecentShippingAddress) => void;
  onNew: () => void;
}

/** «آدرس‌های قبلی»: one tap fills the delivery form from a past order. Nothing renders without past addresses. */
export function RecentAddressChips({ addresses, current, onPick, onNew }: Props) {
  if (addresses.length === 0) return null;

  const selected = addresses.findIndex((a) => isSameAddress(a, current));

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-xs font-medium text-white/80">
        <History className="size-3.5" />
        آدرس‌های قبلی شما
      </p>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="آدرس‌های قبلی">
        {addresses.map((a, i) => {
          const active = i === selected;
          return (
            <button
              key={`${a.postal_code ?? ""}-${a.address}-${i}`}
              type="button"
              aria-pressed={active}
              onClick={() => onPick(a)}
              className={`min-h-11 max-w-[15rem] shrink-0 rounded-2xl border px-3.5 py-2.5 text-right transition-all cursor-pointer ${
                active
                  ? "border-brand bg-brand/15 ring-1 ring-brand"
                  : "border-white/10 bg-[#14141c] hover:border-white/30"
              }`}
            >
              <span className="block truncate text-xs font-bold text-white">
                {a.city ?? a.province ?? "آدرس"}
                {a.recipient_name ? ` · ${a.recipient_name}` : ""}
              </span>
              <span className="block truncate text-[11px] text-white/55">{a.address}</span>
            </button>
          );
        })}
        {!isAddressEmpty(current) && (
          <button
            type="button"
            onClick={onNew}
            className="flex min-h-11 shrink-0 items-center gap-1 rounded-2xl border border-dashed border-white/20 px-3.5 py-2.5 text-xs text-white/70 transition-all hover:border-white/40 cursor-pointer"
          >
            <Plus className="size-3.5" />
            آدرس جدید
          </button>
        )}
      </div>
    </div>
  );
}
