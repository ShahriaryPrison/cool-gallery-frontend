import type { PaymentGatewayOption } from '@/lib/types';

/** Default's key, else the first gateway's key, else null when none are available. */
export function resolveInitialGateway(gateways: PaymentGatewayOption[] = []): string | null {
  return gateways.find((g) => g.is_default)?.key ?? gateways[0]?.key ?? null;
}
