import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/product/product-detail-view";
import { getProduct, getProducts, irrToToman, DEFAULT_CATEGORY_MAP } from "@/lib/api";
import { getProductById, getRelatedProducts, PRODUCTS, type Product } from "@/lib/data";
import type { ProductDetail } from "@/lib/types";

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const res = await getProducts();
    if (res?.data?.length) {
      return res.data.map((p) => ({ id: p.slug || String(p.id) }));
    }
  } catch {
    // fallback
  }
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let backendProduct: ProductDetail | null = null;
  let fallbackProduct: Product | undefined = getProductById(id);

  // Try fetching from backend API
  try {
    backendProduct = await getProduct(undefined, id);
  } catch {
    // If not found by slug on backend, try fallback
  }

  // If not found on backend and not in static data by ID, try matching static data by slug
  if (!backendProduct && !fallbackProduct) {
    fallbackProduct = PRODUCTS.find((p) => p.name.includes(id) || p.id === id);
  }

  if (!backendProduct && !fallbackProduct) {
    notFound();
  }

  // Formulate unified view product
  const defaultVariant =
    backendProduct?.variants.find((v) => v.is_default) ||
    backendProduct?.variants[0];

  const priceToman = defaultVariant
    ? irrToToman(defaultVariant.base_price)
    : fallbackProduct!.price;

  const compareAtToman = defaultVariant?.compare_at_price
    ? irrToToman(defaultVariant.compare_at_price)
    : fallbackProduct?.oldPrice;

  const productName = backendProduct?.name || fallbackProduct!.name;

  const categoryName = (
    backendProduct?.category?.name ||
    (backendProduct?.product_category_id ? DEFAULT_CATEGORY_MAP[backendProduct.product_category_id] : undefined) ||
    fallbackProduct?.cat ||
    "اکسسوری"
  ) as any;

  const mainImage =
    backendProduct?.images?.[0]?.url ||
    fallbackProduct?.image ||
    "/products/fidget-dragon-black.png";

  const description = backendProduct?.description || fallbackProduct?.description;

  const displayProduct: Product = {
    id: backendProduct?.slug || String(backendProduct?.id || fallbackProduct?.id),
    name: productName,
    cat: categoryName,
    price: priceToman,
    oldPrice: compareAtToman,
    badge: compareAtToman && compareAtToman > priceToman ? "تخفیف" : "جدید",
    image: mainImage,
    popularity: 95,
    rating: 4.9,
    colors: [],
    sizes: [],
    description: description || "",
    specs: [
      { k: "اصالت کالا", v: "تضمین ۱۰۰٪ اورجینال" },
      { k: "شناسه محصول", v: defaultVariant?.sku || String(backendProduct?.id || "COOL") },
      { k: "گارانتی", v: "ضمانت ۷ روز بازگشت وجه" },
    ],
  };

  return (
    <ProductDetailView
      product={displayProduct}
      backendProduct={backendProduct}
    />
  );
}
