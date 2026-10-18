import type { Metadata } from "next";
import { getSite } from "./api";

export const SITE_NAME = "COOL Gallery";
export const SITE_TITLE = "COOL Gallery — فروشگاه تخصصی اکسسوری، فیجت و زیورآلات خاص";
export const SITE_DESCRIPTION =
  "خرید آنلاین انواع فیجت‌های مفصلی اژدها، گردنبند و دستبند استیل ۳۱۶ رنگ ثابت، انگشتر گوتیک و جاکارتی چرم طبیعی با ارسال سریع به سراسر ایران.";
export const DEFAULT_OG_IMAGE = "/banners/hero-denim-wallet-left.jpg";

/** Next merges `openGraph` shallowly, so pages spread this to keep the shared fields. */
export const BASE_OPEN_GRAPH = {
  type: "website",
  locale: "fa_IR",
  siteName: SITE_NAME,
  images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }],
} satisfies NonNullable<Metadata["openGraph"]>;

/**
 * The public origin used for canonical URLs, the sitemap and Open Graph.
 * NEXT_PUBLIC_SITE_URL wins; otherwise the custom domain set in Avval.
 */
export async function getSiteUrl(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  const domain = (await getSite().catch(() => null))?.custom_domain;
  if (domain) return /^https?:\/\//.test(domain) ? domain.replace(/\/+$/, "") : `https://${domain}`;

  return `http://localhost:${process.env.PORT || 3000}`;
}

/** Strips HTML and squashes whitespace so backend descriptions fit a meta description. */
export function toMetaDescription(html: string | null | undefined, max = 160): string {
  const text = (html ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** JSON.stringify for a <script type="application/ld+json">, with `<` escaped against XSS. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
