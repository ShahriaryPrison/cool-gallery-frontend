import { ShopView } from "@/components/shop/shop-view";
import { getCategories, getProducts, irrToToman, transformProductSummary } from "@/lib/api";
import { CATEGORIES, PRODUCTS, type Product } from "@/lib/data";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string }>;
}) {
  const params = await searchParams;
  const requested = params.cat;

  let loadedProducts: Product[] = PRODUCTS;
  let loadedCategories: string[] = CATEGORIES as unknown as string[];

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      getProducts(undefined, {
        search: params.q,
      }),
      getCategories(),
    ]);

    if (productsRes.data && productsRes.data.length > 0) {
      loadedProducts = productsRes.data.map(transformProductSummary);
    }

    if (categoriesRes.data && categoriesRes.data.length > 0) {
      loadedCategories = categoriesRes.data.map((c) => c.name);
    }
  } catch (err) {
    // Graceful fallback to static data if backend is offline or empty
  }

  const initialCategory = requested || "همه";

  return (
    <ShopView
      key={`${initialCategory}-${params.q ?? ""}`}
      initialCategory={initialCategory}
      initialQuery={params.q ?? ""}
      products={loadedProducts}
      categoriesList={loadedCategories}
    />
  );
}
