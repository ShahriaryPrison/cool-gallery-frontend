import { HeroSection } from "@/components/home-test/hero-section";
import { ProductShowcase } from "@/components/home-test/product-showcase";
import { CategoriesParallax } from "@/components/home-test/categories-parallax";
import { PromoSection } from "@/components/home-test/promo-section";
import { StickyCardsShowcase } from "@/components/home-test/sticky-cards-showcase";
import { DesktopWheelShowcase } from "@/components/home-test/desktop-wheel-showcase";
import { getCategories, getProducts, getSite, transformProductSummary } from "@/lib/api";
import { customContent, slotProducts } from "@/lib/avval-content";
import { heroSlidesFrom } from "@/lib/hero-content";
import type { Product } from "@/lib/data";

export const revalidate = 60;

export default async function HomePage() {
  let products: Product[] = [];
  let categories: { id: number; name: string; slug: string }[] = [];
  const catMap: Record<number, string> = {};

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      getProducts(undefined, { page: 1 }).catch(() => null),
      getCategories().catch(() => null),
    ]);

    if (categoriesRes?.data && categoriesRes.data.length > 0) {
      categoriesRes.data.forEach((c) => {
        catMap[c.id] = c.name;
        if (c.children) {
          c.children.forEach((sub) => {
            catMap[sub.id] = sub.name;
          });
        }
      });
      categories = categoriesRes.data.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      }));
    }

    if (productsRes?.data && productsRes.data.length > 0) {
      products = productsRes.data.map((p) => transformProductSummary(p, catMap));
    }
  } catch (err) {
    console.error("Failed to fetch homepage products/categories:", err);
  }

  // What the merchant set in the Avval site editor («محتوای قالب»); every slot falls back to the
  // template's own choice when left empty. getSite() shares the 60s cache with the rest of the store.
  const content = customContent(await getSite().catch(() => null));
  const hero = heroSlidesFrom(content["home.hero"], catMap);
  const toProducts = (list: ReturnType<typeof slotProducts>) =>
    list ? list.map((p) => transformProductSummary(p, catMap)) : null;

  // Only real backend discounts; otherwise show the latest products as-is
  const actualDiscounted = products.filter(
    (p) => p.oldPrice && p.oldPrice > p.price
  );
  const discountedProducts: Product[] =
    toProducts(slotProducts(content, "home.offers")) ??
    (actualDiscounted.length > 0 ? actualDiscounted : products.slice(0, 4));
  const galleryProducts: Product[] =
    toProducts(slotProducts(content, "home.gallery")) ?? products.slice(0, 10);

  return (
    <div className="bg-surface-0">
        {/* Section 1: Cinematic Hero */}
        <HeroSection products={[...products, ...hero.products]} slides={hero.slides} />

        {/* Section 2: Categories with scrubbable scroll animation */}
        <CategoriesParallax categories={categories} />

        {discountedProducts.length > 0 && (
          <>
            {/* Section 3: Special Offers / Discounted Products (Desktop) */}
            <div className="hidden lg:block">
              <DesktopWheelShowcase products={discountedProducts} />
            </div>

            {/* Section 4: Special Offers / Discounted Products (Mobile) */}
            <div className="block lg:hidden">
              <ProductShowcase products={discountedProducts} />
            </div>
          </>
        )}

        {/* Section 5: Neon + CRT Scanline Promo & CTA */}
        <PromoSection />

        {/* Section 6: All Products Gallery Showcase (Top 10 Products) */}
        {galleryProducts.length > 0 && (
          <StickyCardsShowcase products={galleryProducts} />
        )}
      </div>
  );
}
