import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/product/product-detail-view";
import { getProduct, getProducts, getSite, irrToToman, DEFAULT_CATEGORY_MAP } from "@/lib/api";
import type { Product } from "@/lib/data";
import { applySeo, breadcrumbSchema, JsonLd, pageMetadata, productSchema, storeBaseUrl } from "@/lib/seo";
import type { ProductDetail } from "@/lib/types";

/** The product, or null when the API has none by that slug. */
const loadProduct = cache(async (productSlug: string): Promise<ProductDetail | null> => {
  try {
    return await getProduct(undefined, productSlug);
  } catch {
    return null;
  }
});

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const res = await getProducts();
    if (res?.data?.length) {
      return res.data.map((p) => ({ productSlug: p.slug || String(p.id) }));
    }
  } catch {
    // Backend unavailable at build time; pages render on demand
  }
  return [];
}

type Props = { params: Promise<{ productSlug: string }> };

/* Same title, description and share fields as the old storefront template's product page. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productSlug } = await params;
  const [product, site] = await Promise.all([loadProduct(productSlug), getSite().catch(() => null)]);
  if (!product || !site) return {};

  const defaultVariant = product.variants?.find((v) => v.is_default) || product.variants?.[0];
  const priceText = defaultVariant
    ? ` | قیمت: ${new Intl.NumberFormat("fa-IR").format(irrToToman(defaultVariant.base_price))} تومان`
    : "";
  const autoDescription =
    (product.description?.trim().slice(0, 130) || `خرید آنلاین ${product.name} از فروشگاه ${site.name}`) + priceText;
  const seo = applySeo(product.seo, { title: product.name, description: autoDescription });

  return {
    ...pageMetadata(site, {
      path: `/products/${product.slug}`,
      title: seo.title,
      shareTitle: product.seo?.title?.trim() ? seo.titleText : `${product.name} | ${site.name}`,
      description: seo.description,
      images: (product.images ?? []).filter((img) => img.url).map((img) => ({ url: img.url, alt: product.name })),
    }),
    ...(seo.keywords ? { keywords: seo.keywords } : {}),
    ...(seo.robots ? { robots: seo.robots } : {}),
  };
}

export default async function ProductPage({ params }: Props) {
  const { productSlug } = await params;

  const [backendProduct, site] = await Promise.all([loadProduct(productSlug), getSite().catch(() => null)]);
  if (!backendProduct) {
    notFound();
  }

  // Formulate unified view product
  const defaultVariant =
    backendProduct.variants.find((v) => v.is_default) ||
    backendProduct.variants[0];

  const priceToman = defaultVariant ? irrToToman(defaultVariant.base_price) : 0;

  const compareAtToman = defaultVariant?.compare_at_price
    ? irrToToman(defaultVariant.compare_at_price)
    : undefined;

  const productName = backendProduct.name;

  const categoryName = (
    backendProduct.category?.name ||
    (backendProduct.product_category_id ? DEFAULT_CATEGORY_MAP[backendProduct.product_category_id] : undefined) ||
    "اکسسوری"
  ) as any;

  const mainImage =
    backendProduct.images?.[0]?.url ||
    "/products/fidget-dragon-black.png";

  const description = backendProduct.description;

  const displayProduct: Product = {
    id: backendProduct.slug || String(backendProduct.id),
    variantId: defaultVariant?.id,
    name: productName,
    cat: categoryName,
    price: priceToman,
    oldPrice: compareAtToman,
    badge: compareAtToman && compareAtToman > priceToman ? "تخفیف" : "",
    image: mainImage,
    popularity: 95,
    rating: 4.9,
    colors: [],
    sizes: [],
    description: description || "",
    specs: [
      { k: "اصالت کالا", v: "تضمین ۱۰۰٪ اورجینال" },
      { k: "شناسه محصول", v: defaultVariant?.sku || String(backendProduct.id) },
      { k: "ارسال", v: "ارسال سریع به سراسر کشور" },
    ],
  };

  const baseUrl = storeBaseUrl(site);
  const canonicalUrl = `${baseUrl}/products/${backendProduct.slug}`;

  return (
    <>
      {site && <JsonLd data={productSchema(backendProduct, site, canonicalUrl)} />}
      {site && (
        <JsonLd
          data={breadcrumbSchema([
            { name: site.name, url: `${baseUrl}/` },
            { name: "محصولات", url: `${baseUrl}/products` },
            { name: backendProduct.name, url: canonicalUrl },
          ])}
        />
      )}
      <ProductDetailView
        product={displayProduct}
        backendProduct={backendProduct}
      />
    </>
  );
}
