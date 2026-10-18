import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/api";
import { getSiteUrl } from "@/lib/seo";
import type { ProductSummary } from "@/lib/types";

export const revalidate = 3600;

// Hard cap so a misbehaving `last_page` can't turn the sitemap into a crawl of the API.
const MAX_PAGES = 50;

async function allProducts(): Promise<ProductSummary[]> {
  const first = await getProducts(undefined, { page: 1 }).catch(() => null);
  if (!first) return [];
  const lastPage = Math.min(first.meta?.last_page ?? 1, MAX_PAGES);
  const rest = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, i) =>
      getProducts(undefined, { page: i + 2 }).catch(() => null)
    )
  );
  return [first, ...rest].flatMap((res) => res?.data ?? []);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = await getSiteUrl();
  const [products, categoriesRes] = await Promise.all([
    allProducts(),
    getCategories().catch(() => null),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/categories`, changeFrequency: "weekly", priority: 0.7 },
  ];

  const categoryPages: MetadataRoute.Sitemap = (categoriesRes?.data ?? []).map((c) => ({
    url: `${siteUrl}/shop?cat=${encodeURIComponent(c.name)}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteUrl}/product/${encodeURIComponent(p.slug || String(p.id))}`,
    changeFrequency: "weekly",
    priority: 0.8,
    images: p.images?.[0]?.url ? [new URL(p.images[0].url, siteUrl).href] : undefined,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
