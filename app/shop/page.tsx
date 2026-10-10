import { ShopView } from "@/components/shop/shop-view";
import { getCategories, getProducts, irrToToman, transformProductSummary } from "@/lib/api";
import { CATEGORIES, type Product } from "@/lib/data";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string }>;
}) {
  const params = await searchParams;
  const requested = params.cat;

  let loadedProducts: Product[] = [];
  let loadedCategories: string[] = CATEGORIES as unknown as string[];

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      getProducts(undefined, {
        search: params.q,
      }),
      getCategories(),
    ]);

    const catMap: Record<number, string> = {};
    if (categoriesRes?.data && categoriesRes.data.length > 0) {
      categoriesRes.data.forEach((c) => {
        catMap[c.id] = c.name;
        if (c.children) {
          c.children.forEach((sub) => {
            catMap[sub.id] = sub.name;
          });
        }
      });
      loadedCategories = categoriesRes.data.map((c) => c.name);
    }

    if (productsRes?.data && productsRes.data.length > 0) {
      loadedProducts = productsRes.data.map((p) => transformProductSummary(p, catMap));
      // Add any product categories not present in top-level list
      const productCats = Array.from(new Set(loadedProducts.map((p) => p.cat).filter(Boolean)));
      if (productCats.length > 0) {
        loadedCategories = Array.from(new Set([...loadedCategories, ...productCats]));
      }
    }
  } catch (err) {
    console.error("Failed to fetch shop products/categories:", err);
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
