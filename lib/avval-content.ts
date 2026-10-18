/**
 * Content the merchant edits for this template in the Avval site editor («محتوای قالب»).
 * The editable slots are declared in `avval.template.json` at the repo root; Avval serves what was
 * filled in as `custom_content` on the storefront site payload, products already resolved.
 * A slot that is missing means «show the template's own content» — always pass a fallback.
 */
import type { ProductSummary, SiteConfig } from "./types";

export interface ContentImage {
  media_id: number;
  url?: string;
}

export interface ContentPoint {
  x: number;
  y: number;
}

export interface ContentHotspot {
  product_id: number;
  tag?: string;
  desktop: ContentPoint;
  mobile: ContentPoint;
  /** The product, in the storefront list shape; a hotspot whose product is gone never arrives. */
  product: ProductSummary;
}

export interface ContentSlide {
  title_prefix?: string;
  title_highlight?: string;
  title_suffix?: string;
  description?: string;
  cta_label?: string;
  cta_link?: string;
  chip?: string;
  alt?: string;
  image?: ContentImage;
  mobile_image?: ContentImage;
  hotspot?: ContentHotspot;
}

/** The slots of `avval.template.json` and what each one holds. */
export interface CustomContent {
  "home.hero"?: ContentSlide[];
  "home.offers"?: { products: ProductSummary[] };
  "home.gallery"?: { products: ProductSummary[] };
}

/** The merchant's content from a site payload (`getSite()`); `{}` when there is none. */
export function customContent(site: SiteConfig | null | undefined): CustomContent {
  const raw = site?.custom_content;
  return raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as CustomContent) : {};
}

/** The products of a product slot, or `null` when the merchant left it empty (use the fallback). */
export function slotProducts(content: CustomContent, key: "home.offers" | "home.gallery"): ProductSummary[] | null {
  const products = content[key]?.products;
  return Array.isArray(products) && products.length > 0 ? products : null;
}
