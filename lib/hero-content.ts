/**
 * Turns the merchant's hero slides (Avval editor → `custom_content["home.hero"]`) into the hero's
 * own slide shape. Runs on the server; the hero falls back to its built-in slides when this is empty.
 */
import type { HeroCategorySlide } from "@/components/home-test/hero-section";
import type { Product } from "./data";
import type { ContentSlide } from "./avval-content";
import { transformProductSummary } from "./api";

const pct = (n: number) => `${n}%`;

/** A link the merchant saved with one of this design's earlier addresses, at the shop's current one. */
function currentPath(link: string): string {
  return link.replace(/^\/product\//, "/products/").replace(/^\/shop(?=$|[?#])/, "/products");
}

export function heroSlidesFrom(
  slides: ContentSlide[] | undefined,
  categoryMap?: Record<number, string>,
): { slides: HeroCategorySlide[]; products: Product[] } {
  const products: Product[] = [];

  const mapped = (slides ?? [])
    // A slide needs a picture; one without would leave an empty banner.
    .filter((s) => s.image?.url || s.mobile_image?.url)
    .map((s, i): HeroCategorySlide => {
      const spot = s.hotspot;
      const product = spot ? transformProductSummary(spot.product, categoryMap) : null;
      if (product) products.push(product);

      const image = (s.image?.url ?? s.mobile_image?.url)!;
      const title = [s.title_prefix, s.title_highlight, s.title_suffix].filter(Boolean).join(" ");

      return {
        id: `merchant-slide-${i}`,
        category: "",
        badge: "",
        badgeHighlight: "",
        badgeIcon: "sparkles",
        titlePrefix: s.title_prefix ?? "",
        titleHighlight: s.title_highlight ?? "",
        titleSuffix: s.title_suffix,
        description: s.description ?? "",
        ctaText: s.cta_label ?? (product ? `مشاهده و خرید ${product.name}` : "مشاهده محصولات"),
        href: s.cta_link ? currentPath(s.cta_link) : product ? `/products/${product.id}` : "/products",
        statsTag: s.chip ?? "",
        image,
        mobileImage: s.mobile_image?.url ?? image,
        alt: s.alt ?? (title || product?.name || "بنر فروشگاه"),
        hotspots: spot && product
          ? [{
              id: `merchant-spot-${i}`,
              productId: product.id,
              tag: spot.tag ?? product.name,
              desktop: { x: pct(spot.desktop.x), y: pct(spot.desktop.y) },
              mobile: { x: pct(spot.mobile.x), y: pct(spot.mobile.y) },
            }]
          : [],
      };
    });

  return { slides: mapped, products };
}
