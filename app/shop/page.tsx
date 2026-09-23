import { ShopView } from "@/components/shop/shop-view";
import { CATEGORIES, type Category } from "@/lib/data";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string }>;
}) {
  const params = await searchParams;
  const requested = params.cat;
  const initialCategory: Category | "همه" =
    requested && (CATEGORIES as string[]).includes(requested) ? (requested as Category) : "همه";

  return (
    <ShopView
      key={`${initialCategory}-${params.q ?? ""}`}
      initialCategory={initialCategory}
      initialQuery={params.q ?? ""}
    />
  );
}
