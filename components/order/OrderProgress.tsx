'use client';

import React from 'react';
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  Check,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import type { SaleStatusOption } from '@/lib/types';
import {
  buildOrderMilestones,
  getStatusLabel,
  getStatusDescription,
} from '@/lib/orderStatus';

interface OrderProgressProps {
  status: string;
  statusLabel?: string;
  storeStatuses?: SaleStatusOption[];
}

const STEP_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="size-4" />,
  confirmed: <CheckCircle2 className="size-4" />,
  processing: <Package className="size-4" />,
  shipped: <Truck className="size-4" />,
  completed: <Check className="size-4" />,
  cancelled: <XCircle className="size-4" />,
};

export function OrderProgress({ status, statusLabel, storeStatuses }: OrderProgressProps) {
  const { milestones, currentIndex, isCancelled } = buildOrderMilestones(status, storeStatuses);
  const activeTitle = statusLabel || getStatusLabel(status, storeStatuses);
  const activeDesc = getStatusDescription(status);

  return (
    <div className="rounded-[28px] border border-white/10 bg-[#0d0d12] p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <div className="mb-6 space-y-1">
        <h3
          className={`text-base sm:text-lg font-black ${
            isCancelled ? 'text-rose-400' : 'text-brand'
          }`}
        >
          وضعیت سفارش: {activeTitle}
        </h3>
        {activeDesc && (
          <p className="text-xs text-white/50">{activeDesc}</p>
        )}
      </div>

      {/* Stepper Milestones */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {milestones.map((milestone, idx) => {
            const isDone = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const icon = STEP_ICONS[milestone.system_state] || <Package className="size-4" />;

            return (
              <div key={milestone.id || milestone.system_state} className="flex flex-1 flex-col items-center relative z-10">
                {/* Node circle */}
                <div
                  className={`size-9 sm:size-10 rounded-2xl flex items-center justify-center transition-all ${
                    isCurrent
                      ? isCancelled
                        ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                        : 'bg-brand text-white shadow-[0_0_25px_rgba(255,45,60,0.5)] scale-110'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-[#14141c] text-white/30 border border-white/10'
                  }`}
                >
                  {isDone ? <Check className="size-4.5 stroke-[2.5]" /> : icon}
                </div>

                {/* Step Label */}
                <span
                  className={`mt-2.5 text-[11px] sm:text-xs text-center font-bold px-1 line-clamp-1 ${
                    isCurrent
                      ? isCancelled
                        ? 'text-rose-400'
                        : 'text-white'
                      : isDone
                      ? 'text-white/80'
                      : 'text-white/40'
                  }`}
                >
                  {milestone.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Connecting Line behind nodes */}
        <div className="absolute top-4 sm:top-5 right-6 left-6 -translate-y-1/2 h-[2px] bg-white/10 z-0">
          <div
            className={`h-full transition-all duration-500 ${
              isCancelled ? 'bg-rose-500' : 'bg-brand'
            }`}
            style={{
              width: `${(currentIndex / Math.max(1, milestones.length - 1)) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
