import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/product/product-detail-view";
import { getProduct, getProducts, irrToToman, DEFAULT_CATEGORY_MAP } from "@/lib/api";
import type { Product } from "@/lib/data";
import type { ProductDetail } from "@/lib/types";

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

  return (
    <ProductDetailView
      product={displayProduct}
      backendProduct={backendProduct}
    />
  );
}
