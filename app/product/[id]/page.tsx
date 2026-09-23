import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Star, ShieldCheck, Truck, RotateCcw } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { ProductCard } from "@/components/product/product-card";
import { ProductImage } from "@/components/product/product-image";
import { ProductOptions } from "@/components/product/product-options";
import { getProduct, getProducts, irrToToman } from "@/lib/api";
import { getProductById, getRelatedProducts, PRODUCTS, type Product } from "@/lib/data";
import { formatToman, toFaDigits } from "@/lib/format";
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

  // Formulate a unified view product
  const defaultVariant = backendProduct?.variants.find((v) => v.is_default) || backendProduct?.variants[0];
  const priceToman = defaultVariant ? irrToToman(defaultVariant.base_price) : fallbackProduct!.price;
  const compareAtToman = defaultVariant?.compare_at_price ? irrToToman(defaultVariant.compare_at_price) : fallbackProduct?.oldPrice;

  const productName = backendProduct?.name || fallbackProduct!.name;
  const categoryName = (backendProduct?.category?.name || fallbackProduct?.cat || "محصول") as any;
  const mainImage = backendProduct?.images?.[0]?.url || fallbackProduct?.image || "/products/fidget-dragon-black.png";
  const description = backendProduct?.description || fallbackProduct?.description;

  const displayProduct: Product = fallbackProduct || {
    id: String(backendProduct!.id),
    name: productName,
    cat: categoryName,
    price: priceToman,
    oldPrice: compareAtToman,
    badge: "جدید",
    image: mainImage,
    popularity: 95,
    rating: 4.9,
    colors: [],
    sizes: [],
    description: description || "",
    specs: [
      { k: "اصالت کالا", v: "تضمین ۱۰۰٪ اورجینال" },
      { k: "شناسه محصول", v: defaultVariant?.sku || String(backendProduct!.id) },
      { k: "گارانتی", v: "ضمانت ۷ روز بازگشت وجه" },
    ],
  };

  // Related products
  let relatedProducts = getRelatedProducts(displayProduct, 4);

  return (
    <div>
      <div className="px-5 pt-4 lg:px-12 lg:pt-8">
        <Link
          href="/shop"
          className="glass text-ink-2 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[12.5px] font-bold transition-colors hover:text-white"
        >
          <ArrowRight className="size-4" strokeWidth={2.2} />
          بازگشت به فروشگاه
        </Link>
      </div>

      <div className="lg:flex lg:items-start lg:gap-12 lg:px-12 lg:pt-6">
        {/* Product Image Section */}
        <div className="px-5 pt-4 lg:sticky lg:top-28 lg:w-[46%] lg:shrink-0 lg:px-0 lg:pt-0">
          <div className="glass overflow-hidden rounded-[28px] border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
            <ProductImage
              image={mainImage}
              alt={productName}
              category={categoryName}
              className="aspect-square"
              iconClassName="size-24 lg:size-32"
            />
          </div>

          <div className="mt-4 flex items-center justify-around rounded-2xl bg-white/[0.03] border border-white/6 p-3 text-[11.5px] text-ink-3">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-400" /> رنگ ثابت و ضدحساسیت
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="size-4 text-brand" /> ارسال سریع
            </span>
            <span className="flex items-center gap-1.5">
              <RotateCcw className="size-4 text-amber-400" /> ۷ روز بازگشت
            </span>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="px-5 pt-6 lg:flex-1 lg:px-0 lg:pt-0">
          <div className="flex items-center gap-2.5 text-[11.5px]">
            <span className="glass text-ink-2 rounded-full px-3 py-1 font-bold">
              {categoryName}
            </span>
            <span className="glass-brand flex items-center gap-1 rounded-full px-3 py-1 font-bold text-white">
              <Star className="size-3 fill-current" />
              {toFaDigits(displayProduct.rating || 4.9)}
            </span>
          </div>

          <h1 className="mt-3.5 text-[27px] leading-[1.28] font-black text-white">
            {productName}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <div className="text-[28px] font-black text-white">
              {formatToman(priceToman)}{" "}
              <span className="text-ink-4 text-[12px] font-normal">تومان</span>
            </div>
            {compareAtToman && compareAtToman > priceToman && (
              <div className="text-ink-5 text-[14px] line-through">
                {formatToman(compareAtToman)}
              </div>
            )}
          </div>

          <ProductOptions
            product={displayProduct}
            backendProduct={backendProduct || undefined}
          />

          {description && (
            <Reveal className="mt-8">
              <h3 className="mb-3 text-[16px] font-black text-white">توضیحات محصول</h3>
              <p className="text-ink-3 text-[13.5px] leading-loose whitespace-pre-line">
                {description}
              </p>
            </Reveal>
          )}

          {displayProduct.specs && displayProduct.specs.length > 0 && (
            <Reveal className="mt-6">
              <div className="glass divide-y divide-white/8 overflow-hidden rounded-3xl border border-white/8">
                {displayProduct.specs.map((s) => (
                  <div
                    key={s.k}
                    className="flex justify-between px-4 py-3.5 text-[12.5px]"
                  >
                    <span className="text-ink-4">{s.k}</span>
                    <span className="text-ink-1 font-medium">{s.v}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      <section className="pt-12 pb-8 lg:pt-16 lg:pb-12">
        <Reveal className="px-5 pb-4 lg:px-12">
          <h3 className="text-[18px] font-black text-white lg:text-[24px]">
            محصولات مرتبط و پیشنهادی
          </h3>
        </Reveal>
        <div
          className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-2 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-12"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {relatedProducts.map((p) => (
            <div
              key={p.id}
              className="w-[182px] shrink-0 lg:w-auto"
              style={{ scrollSnapAlign: "start" }}
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
