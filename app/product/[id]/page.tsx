import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/product/product-detail-view";
import { getProduct, getProducts, irrToToman, DEFAULT_CATEGORY_MAP } from "@/lib/api";
import type { Product } from "@/lib/data";
import type { ProductDetail } from "@/lib/types";
import { BASE_OPEN_GRAPH, getSiteUrl, jsonLd, toMetaDescription } from "@/lib/seo";

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const res = await getProducts();
    if (res?.data?.length) {
      return res.data.map((p) => ({ id: p.slug || String(p.id) }));
    }
  } catch {
    // Backend unavailable at build time; pages render on demand
  }
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(undefined, id).catch(() => null);
  if (!product) return { title: "محصول پیدا نشد", robots: { index: false } };

  const category = product.category?.name;
  const title = category ? `${product.name} | خرید ${category}` : product.name;
  const description =
    toMetaDescription(product.description) ||
    `خرید ${product.name} با ارسال سریع به سراسر ایران از فروشگاه COOL Gallery.`;
  const url = `/product/${encodeURIComponent(product.slug || String(product.id))}`;
  const images = product.images.slice(0, 4).map((img) => ({ url: img.url, alt: product.name }));

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { ...BASE_OPEN_GRAPH, title, description, url, ...(images.length ? { images } : {}) },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images.length ? { images: images.map((i) => i.url) } : {}),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let backendProduct: ProductDetail | null = null;
  try {
    backendProduct = await getProduct(undefined, id);
  } catch {
    // Treated as not found below
  }

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

  const siteUrl = await getSiteUrl();
  const productUrl = `${siteUrl}/product/${encodeURIComponent(displayProduct.id)}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: productName,
        description: toMetaDescription(description, 5000) || undefined,
        image: backendProduct.images.map((img) => new URL(img.url, siteUrl).href),
        sku: defaultVariant?.sku || undefined,
        category: categoryName,
        brand: { "@type": "Brand", name: "COOL Gallery" },
        url: productUrl,
        offers: defaultVariant
          ? {
              "@type": "Offer",
              url: productUrl,
              priceCurrency: "IRR",
              price: defaultVariant.base_price,
              availability: defaultVariant.in_stock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              itemCondition: "https://schema.org/NewCondition",
              seller: { "@id": `${siteUrl}/#store` },
            }
          : undefined,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "خانه", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: categoryName,
            item: `${siteUrl}/shop?cat=${encodeURIComponent(categoryName)}`,
          },
          { "@type": "ListItem", position: 3, name: productName, item: productUrl },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
      <ProductDetailView
        product={displayProduct}
        backendProduct={backendProduct}
      />
    </>
  );
}
