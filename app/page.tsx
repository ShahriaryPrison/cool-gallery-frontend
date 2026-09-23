import { ScrollProgress } from "@/components/home-test/scroll-progress";
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

  return (
    <>
      <ScrollProgress />

      <div className="bg-surface-0">
        {/* Section 1: Cinematic Hero */}
        <HeroSection />

        {/* Section 2: Categories with scrubbable scroll animation */}
        <CategoriesParallax categories={categories} />

        {/* Section 3: Theatrical Split-Screen Showcase (Desktop) */}
        <div className="hidden lg:block">
          <DesktopWheelShowcase products={products} />
        </div>

        {/* Section 4: Product Showcase — Cinematic Curtain Wipe (Mobile) */}
        <div className="block lg:hidden">
          <ProductShowcase products={products} />
        </div>

        {/* Section 5: Neon + CRT Scanline Promo & CTA */}
        <PromoSection />

        {/* Section 6: New Arrivals — 3D Horizontal Runway Showcase */}
        <StickyCardsShowcase products={products} />
      </div>
    </>
  );
}
