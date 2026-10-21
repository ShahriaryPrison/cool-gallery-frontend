import type { Metadata } from "next";
import { ShopView } from "@/components/shop/shop-view";
import { getCategories, getProducts, getSite, transformProductSummary } from "@/lib/api";
import type { Product } from "@/lib/data";
import {
  applySeo,
  breadcrumbSchema,
  categoryPath,
  findCategoryTrail,
  JsonLd,
  pageMetadata,
  storeBaseUrl,
} from "@/lib/seo";
import type { Category } from "@/lib/types";

/**
 * The products listing behind `/products` (all products, ?search=) and the clean category
 * address `/category/{slug}` — the same two addresses, titles and canonicals as the old
 * storefront template. Paging is `?page=N` on both; page 1 is the bare address.
 */
export type ListingParams = { page?: string; search?: string; category?: Category | null };

const pageOf = (sp: ListingParams) => (sp.search ? 1 : Math.max(1, Number(sp.page) || 1));

/** `/products` or `/category/{slug}` at `page`, keeping a search. */
function listingHref(sp: ListingParams, page: number): string {
  if (sp.category) return categoryPath(sp.category, { page });
  const qs = new URLSearchParams();
  if (sp.search) qs.set("search", sp.search);
  if (page > 1) qs.set("page", String(page));
  const query = qs.toString();
  return `/products${query ? `?${query}` : ""}`;
}

export async function productsListingMetadata(sp: ListingParams): Promise<Metadata> {
  const site = await getSite().catch(() => null);
  if (!site) return {};
  const category = sp.category ?? null;

  // No "| shop" suffix: the layout's title template adds it.
  const autoTitle = category ? `محصولات دسته‌بندی ${category.name}` : "محصولات";
  const autoDescription = category
    ? `خرید آنلاین انواع محصولات ${category.name} از فروشگاه اینترنتی ${site.name}`
    : `لیست تمامی محصولات و کالاهای موجود در فروشگاه اینترنتی ${site.name}`;
  const seo = applySeo(category?.seo, { title: autoTitle, description: autoDescription });

  // Each page of a listing is its own canonical, so search engines follow the products on
  // later pages too; a text search points at the listing it searched in.
  const page = pageOf(sp);
  const path = category
    ? categoryPath(category, { page })
    : `/products${page > 1 ? `?page=${page}` : ""}`;

  return {
    ...pageMetadata(site, {
      path,
      title: seo.title,
      shareTitle: category?.seo?.title?.trim() ? seo.titleText : `${autoTitle} | ${site.name}`,
      description: seo.description,
    }),
    ...(seo.keywords ? { keywords: seo.keywords } : {}),
    ...(seo.robots ? { robots: seo.robots } : {}),
  };
}

export async function ProductsListing({ sp }: { sp: ListingParams }) {
  const page = pageOf(sp);
  const [productsRes, categoriesRes, site] = await Promise.all([
    getProducts(undefined, { page, category_id: sp.category?.id, search: sp.search }).catch(() => null),
    getCategories().catch(() => null),
    getSite().catch(() => null),
  ]);
  const categories = categoriesRes?.data ?? [];

  const catMap: Record<number, string> = {};
  for (const c of categories) {
    catMap[c.id] = c.name;
    for (const sub of c.children ?? []) catMap[sub.id] = sub.name;
  }
  const products: Product[] = (productsRes?.data ?? []).map((p) => transformProductSummary(p, catMap));
  const lastPage = productsRes?.meta?.last_page ?? 1;

  const trail = sp.category ? findCategoryTrail(categories, (c) => c.id === sp.category!.id) : [];
  const activeTopId = trail[0]?.id;
  const baseUrl = storeBaseUrl(site);

  return (
    <>
      {site && (
        <JsonLd
          data={breadcrumbSchema([
            { name: site.name, url: `${baseUrl}/` },
            { name: "محصولات", url: `${baseUrl}/products` },
            ...trail.map((c) => ({ name: c.name, url: `${baseUrl}${categoryPath(c)}` })),
          ])}
        />
      )}
      <ShopView
        key={`${sp.category?.slug ?? "all"}-${sp.search ?? ""}-${page}`}
        title={sp.category ? sp.category.name : sp.search ? `نتایج «${sp.search}»` : "همه محصولات"}
        intro={sp.category && !sp.search ? sp.category.seo?.intro ?? null : null}
        initialQuery={sp.search ?? ""}
        products={products}
        total={productsRes?.meta?.total ?? products.length}
        categoryLinks={[
          { label: "همه", href: "/products", active: !sp.category },
          ...categories.map((c) => ({ label: c.name, href: categoryPath(c), active: c.id === activeTopId })),
          // A subcategory being viewed gets its own pill next to its parent.
          ...(sp.category && sp.category.id !== activeTopId
            ? [{ label: sp.category.name, href: categoryPath(sp.category), active: true }]
            : []),
        ]}
        pagination={
          lastPage > 1
            ? {
                page,
                lastPage,
                prevHref: page > 1 ? listingHref(sp, page - 1) : null,
                nextHref: page < lastPage ? listingHref(sp, page + 1) : null,
              }
            : null
        }
      />
    </>
  );
}
