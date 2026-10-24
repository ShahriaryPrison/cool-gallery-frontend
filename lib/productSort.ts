/**
 * The product orders the storefront API takes (`GET /sites/storefront/products?sort=`).
 * No sort = the API's default: in stock first, newest. `best_selling` = most real orders in the
 * last 90 days; `discount` = only discounted products, biggest percent first.
 */
export const PRODUCT_SORTS = ["newest", "price", "-price", "best_selling", "discount"] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export const PRODUCT_SORT_LABELS: Record<ProductSort, string> = {
  newest: "جدیدترین",
  price: "ارزان‌ترین",
  "-price": "گران‌ترین",
  best_selling: "پرفروش‌ترین",
  discount: "بیشترین تخفیف",
};

/** A sort from the query string; anything else (or the default `newest`) is no sort. */
export const parseProductSort = (value: string | null | undefined): ProductSort | undefined =>
  value !== "newest" && (PRODUCT_SORTS as readonly string[]).includes(value ?? "")
    ? (value as ProductSort)
    : undefined;

/** `href` with `?sort=` set, or removed for the default order. */
export function withSort(href: string, sort: ProductSort | undefined): string {
  const [path, query = ""] = href.split("?");
  const qs = new URLSearchParams(query);
  if (sort && sort !== "newest") qs.set("sort", sort);
  else qs.delete("sort");
  const q = qs.toString();
  return `${path}${q ? `?${q}` : ""}`;
}
