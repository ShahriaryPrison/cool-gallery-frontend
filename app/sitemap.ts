import type { MetadataRoute } from "next";
import { sitePagePath } from "@/components/content/site-page";
import { getCategories, getProducts, getSite } from "@/lib/api";
import { categoryPath, flatCategories, storeBaseUrl } from "@/lib/seo";
import type { ProductSummary } from "@/lib/types";

export const revalidate = 3600;

/** /sitemap.xml with the same addresses, priorities and product images as the old storefront template's. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSite();
  const base = storeBaseUrl(site);

  // Every page of products, capped at 20 pages as before.
  const products: ProductSummary[] = [];
  const first = await getProducts(undefined, { page: 1 }).catch(() => null);
  if (first) {
    products.push(...first.data);
    const lastPage = Math.min(first.meta?.last_page ?? 1, 20);
    const rest = await Promise.all(
      Array.from({ length: lastPage - 1 }, (_, i) => getProducts(undefined, { page: i + 2 }).catch(() => null))
    );
    for (const page of rest) products.push(...(page?.data ?? []));
  }
  const categories = await getCategories().then((r) => r.data).catch(() => []);

  const pages = (site.pages ?? []).map(sitePagePath).filter((p): p is string => Boolean(p));

  return [
    { url: `${base}/`, lastModified: site.updated_at || site.published_at, changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, changeFrequency: "daily", priority: 0.9 },
    ...flatCategories(categories).map((c) => ({
      url: `${base}${categoryPath(c)}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...pages.map((path) => ({
      url: `${base}${path}`,
      changeFrequency: "monthly" as const,
      priority: path.startsWith("/p/") ? 0.6 : 0.5,
    })),
    ...products
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${base}/products/${encodeURIComponent(p.slug)}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        images: (p.images ?? []).map((img) => img.url).filter(Boolean),
      })),
  ];
}
