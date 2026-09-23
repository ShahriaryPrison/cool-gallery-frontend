"use client";

import { ScrollProgress } from "@/components/home-test/scroll-progress";
import { HeroSection } from "@/components/home-test/hero-section";
import { ProductShowcase } from "@/components/home-test/product-showcase";
import { CategoriesParallax } from "@/components/home-test/categories-parallax";
import { PromoSection } from "@/components/home-test/promo-section";
import { StickyCardsShowcase } from "@/components/home-test/sticky-cards-showcase";

import { DesktopWheelShowcase } from "@/components/home-test/desktop-wheel-showcase";

export default function HomeTestPage() {
  return (
    <>
      <ScrollProgress />

      <div className="bg-surface-0">
        {/* Section 1: Cinematic Hero */}
        <HeroSection />

        {/* Section 2: Categories with scrubbable scroll animation */}
        <CategoriesParallax />

        {/* Section 3: Desktop Wheel Showcase (Only on Desktop) */}
        <DesktopWheelShowcase />

        {/* Section 4: Product Showcase — Cinematic Z-Space Fly-Through (Only on Mobile) */}
        <div className="block lg:hidden">
          <ProductShowcase />
        </div>

        {/* Section 4: Promo & CTA */}
        <PromoSection />

        {/* Section 5: New Arrivals - Stacking Sticky Cards */}
        <StickyCardsShowcase />
      </div>
    </>
  );
}
