import { permanentRedirect } from "next/navigation";
import { getCategories } from "@/lib/api";
import { categoryPath, flatCategories } from "@/lib/seo";

/**
 * `/shop` was this design's own listing address for a while; the shop's real addresses are
 * the old template's (`/products`, `/category/{slug}`), so it moves there for good:
 *   /shop             → /products
 *   /shop?q=…         → /products?search=…
 *   /shop?cat=<name>  → /category/{slug}
 */
export default async function ShopRedirect({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string }>;
}) {
  const { cat, q } = await searchParams;

  if (cat && cat !== "همه") {
    const categories = await getCategories().then((r) => r.data).catch(() => []);
    const category = flatCategories(categories).find((c) => c.name === cat || c.slug === cat);
    if (category) permanentRedirect(categoryPath(category));
  }

  permanentRedirect(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
}
