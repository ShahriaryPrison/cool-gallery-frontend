import { notFound } from "next/navigation";
import type {
  Category,
  Customer,
  CustomerOrder,
  OrderDetail,
  Paginated,
  ProductDetail,
  ProductSummary,
  SiteConfig,
} from "./types";
import type { Product } from "./data";

export const API_BASE =
  process.env.AVVAL_API_URL ||
  process.env.NEXT_PUBLIC_AVVAL_API_URL ||
  "http://127.0.0.1:8080/api/v1";

export const DEFAULT_STORE_SLUG =
  process.env.NEXT_PUBLIC_STORE_SLUG || "cool-gallery";

export const API_KEY =
  process.env.AVVAL_API_KEY ||
  process.env.NEXT_PUBLIC_AVVAL_API_KEY ||
  "";

/**
 * All server-side storefront reads go through here.
 * ISR: URLs are cached 60s and tagged `site:{slug}` for instant revalidation.
 */
async function get<T>(slug: string, path: string, revalidate = 60): Promise<T> {
  const storeSlug = slug || DEFAULT_STORE_SLUG;
  const url = `${API_BASE}/${storeSlug}${path}`;

  const headers: Record<string, string> = {
    "Accept": "application/json",
  };
  if (API_KEY) {
    headers["X-API-Key"] = API_KEY;
  }

  try {
    const res = await fetch(url, {
      headers,
      next: { revalidate, tags: [`site:${storeSlug}`] },
    });

    if (res.status === 404) {
      // Try alternate OpenAPI endpoint shape if the primary returns 404
      if (path.startsWith("/sites/storefront/products")) {
        const altPath = path.replace("/sites/storefront/products", "/products/storefront");
        const altRes = await fetch(`${API_BASE}/${storeSlug}${altPath}`, {
          headers,
          next: { revalidate, tags: [`site:${storeSlug}`] },
        });
        if (altRes.ok) {
          return (await altRes.json()) as T;
        }
      } else if (path.startsWith("/sites/storefront/categories")) {
        const altPath = path.replace("/sites/storefront/categories", "/products/storefront/categories");
        const altRes = await fetch(`${API_BASE}/${storeSlug}${altPath}`, {
          headers,
          next: { revalidate, tags: [`site:${storeSlug}`] },
        });
        if (altRes.ok) {
          return (await altRes.json()) as T;
        }
      }
      notFound();
    }
    if (!res.ok) {
      throw new Error(`Avval API ${res.status} for ${storeSlug}${path}`);
    }

    return (await res.json()) as T;
  } catch (err) {
    console.error(`Fetch error for ${url}:`, err);
    throw err;
  }
}

export async function getSite(slug = DEFAULT_STORE_SLUG): Promise<SiteConfig> {
  const res = await get<{ data: SiteConfig }>(slug, "/sites/storefront");
  const site = res.data;
  site.features = {
    coupons: false,
    loyalty: false,
    checkout: true,
    online_payment: true,
    ...((site.features as Partial<SiteConfig["features"]>) ?? {}),
  };
  return site;
}

export async function getProducts(
  slug = DEFAULT_STORE_SLUG,
  opts: {
    page?: number;
    category_id?: number;
    search?: string;
    sort?: "price" | "-price" | "newest";
  } = {}
): Promise<Paginated<ProductSummary>> {
  const qs = new URLSearchParams();
  if (opts.page) qs.set("page", String(opts.page));
  if (opts.category_id) qs.set("category_id", String(opts.category_id));
  if (opts.search) qs.set("search", opts.search);
  if (opts.sort) qs.set("sort", opts.sort);
  const q = qs.size ? `?${qs.toString()}` : "";
  return get<Paginated<ProductSummary>>(slug, `/sites/storefront/products${q}`);
}

export async function getProduct(
  slug = DEFAULT_STORE_SLUG,
  productSlug: string
): Promise<ProductDetail> {
  const res = await get<{ data: ProductDetail }>(
    slug,
    `/sites/storefront/products/${productSlug}`
  );
  return res.data;
}

export async function getCategories(
  slug = DEFAULT_STORE_SLUG
): Promise<Paginated<Category>> {
  return get<Paginated<Category>>(slug, "/sites/storefront/categories");
}

export async function getOrder(
  slug = DEFAULT_STORE_SLUG,
  reference: string,
  token?: string
): Promise<OrderDetail> {
  const storeSlug = slug || DEFAULT_STORE_SLUG;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(
    `${API_BASE}/${storeSlug}/sites/storefront/customer/orders/${reference}`,
    {
      headers,
      cache: "no-store",
    }
  );

  if (res.status === 404) notFound();
  if (!res.ok) {
    throw new Error(`Avval API ${res.status} for order ${reference}`);
  }

  const json = (await res.json()) as { data: OrderDetail };
  return json.data;
}

// ─── Customer Auth Helpers ──────────────────────────────────────────────────

export async function requestOtp(
  slug = DEFAULT_STORE_SLUG,
  phone: string
): Promise<{ message: string; data: { expires_in: number } }> {
  const res = await fetch(
    `${API_BASE}/${slug}/sites/storefront/customer/auth/request-otp`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error(errorBody.message ?? `requestOtp failed: ${res.status}`),
      { status: res.status, body: errorBody }
    );
  }

  return res.json();
}

export interface VerifyOtpResult {
  token: string;
  token_type: "Bearer";
  customer: Customer;
}

export async function verifyOtp(
  slug = DEFAULT_STORE_SLUG,
  phone: string,
  otp: string
): Promise<VerifyOtpResult> {
  const res = await fetch(
    `${API_BASE}/${slug}/sites/storefront/customer/auth/verify-otp`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error(errorBody.message ?? `verifyOtp failed: ${res.status}`),
      { status: res.status, body: errorBody }
    );
  }

  const json = (await res.json()) as { data: VerifyOtpResult };
  return json.data;
}

export async function logout(
  slug = DEFAULT_STORE_SLUG,
  token: string
): Promise<void> {
  await fetch(`${API_BASE}/${slug}/sites/storefront/customer/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  }).catch(() => {});
}

/** Converts IRR (stored in DB) to Toman integer (IRR ÷ 10) */
export function irrToToman(irr: number): number {
  return Math.floor(irr / 10);
}

/** Formats IRR amount as formatted Toman string with Persian numerals */
export function formatIrrAsToman(irr: number): string {
  const toman = irrToToman(irr);
  return new Intl.NumberFormat("fa-IR").format(toman) + " تومان";
}

/** Transforms backend ProductSummary into frontend Product structure */
export function transformProductSummary(p: ProductSummary): Product {
  const defaultVar = p.default_variant;
  const priceToman = defaultVar ? irrToToman(defaultVar.base_price) : 500000;
  const oldPriceToman = defaultVar?.compare_at_price
    ? irrToToman(defaultVar.compare_at_price)
    : undefined;
  const image = p.images?.[0]?.url || "/products/fidget-dragon-black.png";

  return {
    id: p.slug || String(p.id),
    name: p.name,
    cat: (p.category?.name || "سایر") as any,
    price: priceToman,
    oldPrice: oldPriceToman,
    badge: oldPriceToman ? "تخفیف" : "جدید",
    image: image,
    popularity: 95,
    rating: 4.9,
    colors: [],
    sizes: [],
    description: p.description || "",
    specs: [
      { k: "اصالت کالا", v: "تضمین ۱۰۰٪ اورجینال" },
      { k: "شناسه کالا", v: defaultVar?.sku || String(p.id) },
      { k: "ارسال سریع", v: "تحویل فوری در سراسر کشور" },
    ],
  };
}

