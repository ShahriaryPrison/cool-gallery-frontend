import { IRAN_PROVINCES } from "@/lib/iran";

/** One distinct shipping address from the customer's past orders in this store (GET customer/addresses). */
export interface RecentShippingAddress {
  recipient_name: string | null;
  phone: string | null;
  province: string | null;
  city: string | null;
  address: string;
  postal_code: string | null;
  last_used_at: string | null;
}

export interface CheckoutAddressFields {
  province: string;
  city: string;
  address: string;
  postalCode: string;
}

const norm = (v: string | null | undefined) => (v ?? "").trim().replace(/\s+/g, " ");

/**
 * The form values a saved address fills. Province and city are <select>s here, so a value missing from the
 * theme's list is left empty for the buyer to choose instead of being set to something the select can't show.
 */
export function toCheckoutFields(saved: RecentShippingAddress): CheckoutAddressFields {
  const province = IRAN_PROVINCES.find((p) => p.name === norm(saved.province));
  const city = province?.cities.find((c) => c === norm(saved.city));

  return {
    province: province?.name ?? "",
    city: city ?? "",
    address: norm(saved.address),
    postalCode: norm(saved.postal_code),
  };
}

/** Whether the form holds exactly this saved address (editing any field un-highlights its chip). */
export function isSameAddress(saved: RecentShippingAddress, current: CheckoutAddressFields): boolean {
  const f = toCheckoutFields(saved);
  return f.province === norm(current.province)
    && f.city === norm(current.city)
    && f.address === norm(current.address)
    && f.postalCode === norm(current.postalCode);
}

export function isAddressEmpty(current: CheckoutAddressFields): boolean {
  return !norm(current.province) && !norm(current.city) && !norm(current.address) && !norm(current.postalCode);
}
