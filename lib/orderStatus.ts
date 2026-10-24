import type { SaleStatusOption } from './types';

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار پرداخت',
  confirmed: 'تایید سفارش',
  processing: 'در حال آماده‌سازی',
  shipped: 'ارسال شده',
  completed: 'تحویل داده شده',
  cancelled: 'لغو شده',
  refunded: 'مسترد شده',
};

export const ORDER_STATUS_DESCRIPTIONS: Record<string, string> = {
  pending: 'سفارش شما ثبت شده و در انتظار پرداخت یا تایید است.',
  confirmed: 'سفارش شما تایید شد و به زودی وارد مرحله آماده‌سازی می‌شود.',
  processing: 'سفارش شما در حال آماده‌سازی و بسته‌بندی در انبار است.',
  shipped: 'مرسوله شما تحویل شرکت توزیع/پیک گردیده و در راه است.',
  completed: 'سفارش شما با موفقیت تحویل داده شد.',
  cancelled: 'این سفارش لغو گردیده است.',
  refunded: 'مبلغ این سفارش مسترد گردید.',
};

export const DEFAULT_STORE_STEPS: SaleStatusOption[] = [
  { id: 1, system_state: 'pending', label: 'در انتظار پرداخت', sort_order: 1, color: '#f59e0b' },
  { id: 2, system_state: 'confirmed', label: 'تایید سفارش', sort_order: 2, color: '#3b82f6' },
  { id: 3, system_state: 'processing', label: 'در حال آماده‌سازی', sort_order: 3, color: '#6366f1' },
  { id: 4, system_state: 'shipped', label: 'ارسال شده', sort_order: 4, color: '#8b5cf6' },
  { id: 5, system_state: 'completed', label: 'تحویل داده شده', sort_order: 5, color: '#10b981' },
];

export const CANONICAL_SYSTEM_STATE_ORDER: string[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'completed',
];

export function normalizeStatus(status: string): string {
  if (status === 'delivered') return 'completed';
  return status;
}

export function getStatusLabel(status: string, configuredStatuses?: SaleStatusOption[]): string {
  const normalized = normalizeStatus(status);
  if (configuredStatuses && configuredStatuses.length > 0) {
    const match = configuredStatuses.find((s) => s.system_state === normalized);
    if (match?.label) return match.label;
  }
  return ORDER_STATUS_LABELS[normalized] ?? status;
}

export function getStatusDescription(status: string): string {
  return ORDER_STATUS_DESCRIPTIONS[normalizeStatus(status)] ?? '';
}

export interface BuildMilestonesResult {
  milestones: SaleStatusOption[];
  currentIndex: number;
  isCancelled: boolean;
}

export function buildOrderMilestones(
  currentStatus: string,
  configuredStatuses?: SaleStatusOption[]
): BuildMilestonesResult {
  const normalized = normalizeStatus(currentStatus);
  const isCancelled = normalized === 'cancelled';

  let activeSteps: SaleStatusOption[] = [];

  if (configuredStatuses && configuredStatuses.length > 0) {
    activeSteps = configuredStatuses.filter(
      (s) => s.system_state !== 'cancelled' && s.system_state !== 'refunded'
    );
  }

  if (activeSteps.length === 0) {
    activeSteps = DEFAULT_STORE_STEPS;
  }

  const orderWeight = (step: SaleStatusOption) => {
    if (typeof step.sort_order === 'number' && !isNaN(step.sort_order)) {
      return step.sort_order;
    }
    const idx = CANONICAL_SYSTEM_STATE_ORDER.indexOf(step.system_state);
    return idx !== -1 ? (idx + 1) * 10 : 999;
  };

  const sortedSteps = [...activeSteps].sort((a, b) => orderWeight(a) - orderWeight(b));

  if (!isCancelled) {
    const currentIndex = sortedSteps.findIndex((s) => s.system_state === normalized);
    return {
      milestones: sortedSteps,
      currentIndex: currentIndex >= 0 ? currentIndex : 0,
      isCancelled: false,
    };
  }

  const cancelledMilestone: SaleStatusOption = {
    id: 999,
    system_state: 'cancelled',
    label: 'لغو شده',
    color: '#ef4444',
    sort_order: 999,
  };

  const prefixCount = Math.min(2, Math.max(1, sortedSteps.length - 1));
  const prefixSteps = sortedSteps.slice(0, prefixCount);
  const finalMilestones = [...prefixSteps, cancelledMilestone];

  return {
    milestones: finalMilestones,
    currentIndex: finalMilestones.length - 1,
    isCancelled: true,
  };
}
