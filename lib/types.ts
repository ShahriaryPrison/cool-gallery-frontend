// Shapes mirroring the Avval Storefront API (/scalar, Sites Storefront)

export interface Block {
  id?: string;
  type: string;
  settings: Record<string, unknown>;
}

export interface SitePage {
  slug: string;
  title: string;
  blocks?: Block[];
}

export interface SiteFeatures {
  coupons: boolean;
  loyalty: boolean;
  checkout: boolean;
  online_payment: boolean;
  [key: string]: boolean;
}

export interface PaymentGatewayOption {
  key: string;
  label: string;
  is_default: boolean;
}

export interface SaleStatusOption {
  id: number;
  system_state: string;
  label: string;
  color?: string;
  description?: string;
  sort_order: number;
}

export interface SiteConfig {
  name: string;
  theme: string;
  custom_domain: string | null;
  settings: {
    primary_color?: string;
    about?: string;
    contact?: {
      show_phone?: boolean;
      show_address?: boolean;
      show_socials?: boolean;
      phone?: string | null;
      address?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      socials?: { platform: string; url: string; handle?: string }[];
    };
    enamad?: { code?: string; link?: string; verification_code?: string } | null;
    shipping?: { flat_fee?: number; free_over?: number } | null;
    notify_phone?: string;
    [key: string]: unknown;
  };
  pages: SitePage[];
  organization: {
    name: string;
    slug: string;
    enamad?: { code?: string; link?: string } | null;
    logo?: string | null;
  };
  features: SiteFeatures;
  payment_gateways?: PaymentGatewayOption[];
  sale_statuses?: SaleStatusOption[];
  published_at: string;
  updated_at: string;
}

export interface MediaImage {
  id: number;
  order: number;
  url: string;
  thumb_url: string;
  medium_url: string;
}

export interface ProductOptionValue {
  id: number;
  value: string;
  image?: {
    id: number;
    url: string;
    thumb_url: string;
    medium_url: string;
  } | null;
}

export interface ProductOption {
  id: number;
  name: string;
  values: ProductOptionValue[];
}

export interface ProductVariant {
  id: number;
  sku: string;
  base_price: number; // in IRR (Rials) — display in Toman (floor(price / 10))
  compare_at_price?: number | null;
  stock_quantity: number | null;
  in_stock: boolean;
  is_default: boolean;
  option_value_ids: number[];
  images?: MediaImage[];
}

export interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  status: string;
  description: string | null;
  product_category_id?: number | null;
  default_variant: ProductVariant | null;
  images: MediaImage[];
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  product_category_id?: number | null;
  images: MediaImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  children?: Category[];
  media?: MediaImage[];
}

export interface Paginated<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface Customer {
  id: string;
  display_name: string;
  phone: string;
  email: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

export interface CustomerOrder {
  reference_number: string;
  status: string;
  status_label?: string;
  payment_status: string;
  subtotal_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  items_count: number;
  created_at: string;
}

export interface OrderDetail {
  reference_number: string;
  status: string;
  status_label?: string;
  store_statuses?: SaleStatusOption[];
  payment_status: string;
  original_subtotal?: number;
  product_discount_amount?: number;
  coupon_discount_amount?: number;
  subtotal_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  created_at: string;
  note?: string | null;
  customer: {
    name: string;
    phone: string;
  };
  shipping: {
    recipient_name?: string;
    phone?: string;
    province: string | null;
    city: string | null;
    address: string;
    postal_code: string | null;
  };
  items: {
    name: string;
    sku?: string | null;
    quantity: number;
    unit_price: number;
    compare_at_price?: number | null;
    has_discount?: boolean;
    discount_percent?: number | null;
    discount_amount?: number;
    total_price: number;
    option_values?: { option: string; value: string }[] | Record<string, string> | null;
    image?: MediaImage | null;
  }[];
  fees: {
    type: string;
    label: string;
    amount: number;
  }[];
}

// ─── Club Loyalty Types ────────────────────────────────────────────────────────

export interface ClubTier {
  id: number;
  name: string;
  display_name: string;
  point_multiplier: number;
  icon?: string | null;
}

export interface ClubNextTier {
  id: number;
  name: string;
  display_name: string;
  min_points: number;
  points_needed: number;
  progress_percent: number;
}

export interface ClubReferralStats {
  code: string;
  total_referred: number;
  completed_referrals: number;
  points_earned: number;
}

export interface ClubDashboard {
  is_enabled: boolean;
  points_balance: number;
  points_lifetime_earned: number;
  points_lifetime_redeemed: number;
  current_tier: ClubTier | null;
  next_tier: ClubNextTier | null;
  referral: ClubReferralStats;
}

export interface ClubReward {
  id: number;
  name: string;
  description: string | null;
  reward_type: 'discount_percentage' | 'discount_fixed' | 'gift' | 'free_shipping' | 'custom';
  points_cost: number;
  value_amount: number | null;
  icon?: string | null;
  image_url?: string | null;
  required_tiers?: string[];
  is_unlocked: boolean;
  can_afford: boolean;
  is_redeemable: boolean;
}

export interface CustomerCoupon {
  id: number;
  code: string;
  description?: string | null;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  max_discount_amount?: number | null;
  min_order_amount?: number | null;
  expires_at?: string | null;
}
