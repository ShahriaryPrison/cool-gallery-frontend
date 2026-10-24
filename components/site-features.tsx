"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteFeatures, StorefrontShippingMethod } from "@/lib/types";

/** What the store has switched on in the Avval admin; the same defaults `getSite` fills in. */
const DEFAULT_FEATURES: SiteFeatures = {
  coupons: false,
  loyalty: false,
  checkout: true,
  online_payment: true,
};

const SiteFeaturesContext = createContext<SiteFeatures>(DEFAULT_FEATURES);
const ShippingMethodsContext = createContext<StorefrontShippingMethod[]>([]);

export function SiteFeaturesProvider({
  features,
  shippingMethods,
  children,
}: {
  features?: SiteFeatures | null;
  shippingMethods?: StorefrontShippingMethod[] | null;
  children: ReactNode;
}) {
  return (
    <SiteFeaturesContext.Provider value={features ?? DEFAULT_FEATURES}>
      <ShippingMethodsContext.Provider value={shippingMethods ?? []}>{children}</ShippingMethodsContext.Provider>
    </SiteFeaturesContext.Provider>
  );
}

/** The store's feature flags (`site.features`): coupons, checkout, online payment… */
export const useSiteFeatures = () => useContext(SiteFeaturesContext);

/** The store's delivery methods (`site.shipping_methods`), for the cart's free-shipping bar. */
export const useShippingMethods = () => useContext(ShippingMethodsContext);

/** Shown in place of buying when the store takes orders by contact only (`features.checkout` off). */
export const CATALOG_ONLY_MESSAGE = "خرید آنلاین در این فروشگاه فعال نیست؛ برای سفارش با فروشنده تماس بگیرید.";
