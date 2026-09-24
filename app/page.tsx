import { HeroSection } from "@/components/home-test/hero-section";
import { ProductShowcase } from "@/components/home-test/product-showcase";
import { CategoriesParallax } from "@/components/home-test/categories-parallax";
import { PromoSection } from "@/components/home-test/promo-section";
import { StickyCardsShowcase } from "@/components/home-test/sticky-cards-showcase";
import { DesktopWheelShowcase } from "@/components/home-test/desktop-wheel-showcase";
import { getCategories, getProducts, transformProductSummary } from "@/lib/api";
import { PRODUCTS, type Product } from "@/lib/data";

export const revalidate = 60;

export default async function HomePage() {
  let products: Product[] = PRODUCTS;
  let categories: { id: number; name: string; slug: string }[] = [];

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      getProducts(undefined, { page: 1 }).catch(() => null),
      getCategories().catch(() => null),
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

  // Filter actual discounted products (or supply realistic discounts if not configured on backend)
  const actualDiscounted = products.filter(
    (p) => p.oldPrice && p.oldPrice > p.price
  );
  const discountedProducts: Product[] =
    actualDiscounted.length >= 2
      ? actualDiscounted
      : products.slice(0, 4).map((p, idx) => {
          if (p.oldPrice && p.oldPrice > p.price) return p;
          const pcts = [18, 9, 17, 15];
          const pct = pcts[idx % pcts.length];
          const oldPrice = Math.round((p.price / (1 - pct / 100)) / 10000) * 10000;
          return {
            ...p,
            oldPrice,
            badge: `${pct}%`,
          };
        });

  return (
    <div className="bg-surface-0">
        {/* Section 1: Cinematic Hero */}
        <HeroSection />

        {/* Section 2: Categories with scrubbable scroll animation */}
        <CategoriesParallax categories={categories} />

        {/* Section 3: Special Offers / Discounted Products (Desktop) */}
        <div className="hidden lg:block">
          <DesktopWheelShowcase products={discountedProducts} />
        </div>

        {/* Section 4: Special Offers / Discounted Products (Mobile) */}
        <div className="block lg:hidden">
          <ProductShowcase products={discountedProducts} />
        </div>

        {/* Section 5: Neon + CRT Scanline Promo & CTA */}
        <PromoSection />

        {/* Section 6: All Products Gallery Showcase (Top 10 Products) */}
        <StickyCardsShowcase products={products.slice(0, 10)} />
      </div>
  );
}
