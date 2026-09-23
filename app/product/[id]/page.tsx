import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Star, ShieldCheck, Truck, RotateCcw } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { ProductCard } from "@/components/product/product-card";
import { ProductImage } from "@/components/product/product-image";
import { ProductOptions } from "@/components/product/product-options";
import { getProductById, getRelatedProducts, PRODUCTS } from "@/lib/data";
import { formatToman, toFaDigits } from "@/lib/format";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const related = getRelatedProducts(product, 4);

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

      {/* image and detail sit side by side once there is room */}
      <div className="lg:flex lg:items-start lg:gap-12 lg:px-12 lg:pt-6">
        <div className="px-5 pt-4 lg:sticky lg:top-28 lg:w-[46%] lg:shrink-0 lg:px-0 lg:pt-0">
          <div className="glass overflow-hidden rounded-[28px]">
            <ProductImage
              image={product.image}
              alt={product.name}
              category={product.cat}
              className="aspect-square"
              iconClassName="size-24 lg:size-32"
            />
          </div>

          <div className="mt-4 flex items-center justify-around rounded-2xl bg-white/[0.03] p-3 text-[11.5px] text-ink-3">
            <span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-emerald-400" /> رنگ ثابت و ضدحساسیت</span>
            <span className="flex items-center gap-1.5"><Truck className="size-4 text-brand" /> ارسال سریع</span>
            <span className="flex items-center gap-1.5"><RotateCcw className="size-4 text-amber-400" /> ۷ روز بازگشت</span>
          </div>
        </div>

        <div className="px-5 pt-6 lg:flex-1 lg:px-0 lg:pt-0">
          <div className="flex items-center gap-2.5 text-[11.5px]">
            <span className="glass text-ink-2 rounded-full px-3 py-1 font-bold">
              {product.cat}
            </span>
            <span className="glass-brand flex items-center gap-1 rounded-full px-3 py-1 font-bold text-white">
              <Star className="size-3 fill-current" />
              {toFaDigits(product.rating)}
            </span>
          </div>

          <h1 className="mt-3.5 text-[27px] leading-[1.28] font-black text-white">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <div className="text-[28px] font-black text-white">
              {formatToman(product.price)}{" "}
              <span className="text-ink-4 text-[12px] font-normal">تومان</span>
            </div>
            {product.oldPrice && (
              <div className="text-ink-5 text-[14px] line-through">
                {formatToman(product.oldPrice)}
              </div>
            )}
          </div>

          <ProductOptions product={product} />

          <Reveal className="mt-8">
            <h3 className="mb-3 text-[16px] font-black text-white">توضیحات محصول</h3>
            <p className="text-ink-3 text-[13.5px] leading-loose">
              {product.description}
            </p>
          </Reveal>

          <Reveal className="mt-5">
            <div className="glass divide-y divide-white/8 overflow-hidden rounded-3xl">
              {product.specs.map((s) => (
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
        </div>
      </div>

      <section className="pt-9 pb-8 lg:pt-16 lg:pb-12">
        <Reveal className="px-5 pb-4 lg:px-12">
          <h3 className="text-[18px] font-black text-white lg:text-[26px]">
            محصولات مرتبط و پیشنهادی
          </h3>
        </Reveal>
        <div
          className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-2 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-12"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {related.map((p) => (
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
