import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ProductsListing, productsListingMetadata } from "@/components/shop/products-listing";
import { getCategories, getCategoryRedirect } from "@/lib/api";
import { categoryPath, findCategoryBySlug } from "@/lib/seo";
import type { Category } from "@/lib/types";

/* `/category/{slug}`: a category's products at the old template's clean address. Paging comes
   from the query string, so it renders per request. */
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ page?: string }>;
};

async function resolve({ params, searchParams }: Props): Promise<{ category: Category; page?: string }> {
  const [{ categorySlug }, { page }] = await Promise.all([params, searchParams]);
  const { data: categories } = await getCategories();
  const category = findCategoryBySlug(categories, categorySlug);
  if (category) return { category, page };

  // An earlier slug of a renamed category moves for good to its current address; anything else is a 404.
  let oldSlug = categorySlug;
  try {
    oldSlug = decodeURIComponent(categorySlug);
  } catch {
    // malformed escape: ask with it as-is
  }
  const current = await getCategoryRedirect(undefined, oldSlug).catch(() => null);
  if (!current) notFound();
  permanentRedirect(categoryPath({ slug: current }, { page }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { category, page } = await resolve(props);
  return productsListingMetadata({ category, page });
}

export default async function CategoryPage(props: Props) {
  const { category, page } = await resolve(props);
  return <ProductsListing sp={{ category, page }} />;
}
