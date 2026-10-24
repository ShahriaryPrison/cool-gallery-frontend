import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { ProductsListing, productsListingMetadata } from "@/components/shop/products-listing";
import { getCategories } from "@/lib/api";
import { parseProductSort, withSort } from "@/lib/productSort";
import { categoryPath, flatCategories } from "@/lib/seo";

/* Search and paging come from the query string, so this page renders per request. */
export const dynamic = "force-dynamic";

type SearchParams = { page?: string; search?: string; category_id?: string; sort?: string };
type Props = { searchParams: Promise<SearchParams> };

/** The old category address `/products?category_id=N` moves for good to `/category/{slug}`. */
async function redirectToCleanCategory(sp: SearchParams): Promise<void> {
  if (!sp.category_id || sp.search) return;
  const categories = await getCategories().then((r) => r.data).catch(() => null);
  const category = categories && flatCategories(categories).find((c) => c.id === Number(sp.category_id));
  if (category) permanentRedirect(withSort(categoryPath(category, { page: sp.page }), parseProductSort(sp.sort)));
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  await redirectToCleanCategory(sp);
  return productsListingMetadata({ page: sp.page, search: sp.search });
}

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  await redirectToCleanCategory(sp);
  return <ProductsListing sp={{ page: sp.page, search: sp.search, sort: parseProductSort(sp.sort) }} />;
}
