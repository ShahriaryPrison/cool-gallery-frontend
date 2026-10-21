import type { Metadata } from "next";
import { DEFAULT_STORE_SLUG } from "./api";
import type { Category, ProductDetail, SeoMeta, SiteConfig } from "./types";

/**
 * Addresses and SEO kept identical to the Avval storefront template this shop ran on
 * before (avval-storefront), so pages Google already indexed keep their URL:
 *
 *   /products                 all products (?search=, ?page=)
 *   /products/{slug}          a product
 *   /category/{slug}          a category's products (?page=)
 *   /about, /contact, /p/{slug}
 *   /sitemap.xml, /robots.txt
 */

/** The shop's public origin: its custom domain, else NEXT_PUBLIC_SITE_URL, else the platform subdomain. */
export function storeBaseUrl(site?: Pick<SiteConfig, "custom_domain"> | null): string {
  const domain = site?.custom_domain?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!domain) return `https://${DEFAULT_STORE_SLUG}.avval.shop`;
  const host = domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return `https://${host}`;
}

const filled = (value: string | null | undefined): string | null => {
  const v = value?.trim();
  return v ? v : null;
};

/**
 * Title/description/keywords/robots for a page, preferring the merchant's SEO over the
 * automatic values. A custom title is used as-is (`absolute`); the automatic one gets the
 * layout's "| shop name" template.
 */
export function applySeo(
  seo: SeoMeta | null | undefined,
  auto: { title: string; description: string }
): { title: Metadata["title"]; titleText: string; description: string; keywords?: string[]; robots?: Metadata["robots"] } {
  const customTitle = filled(seo?.title);
  const keywords = (seo?.keywords ?? []).map((k) => k.trim()).filter(Boolean);

  return {
    title: customTitle ? { absolute: customTitle } : auto.title,
    titleText: customTitle ?? auto.title,
    description: filled(seo?.description) ?? auto.description,
    ...(keywords.length ? { keywords } : {}),
    ...(seo?.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Canonical, Open Graph and Twitter fields shared by every page. */
export function pageMetadata(
  site: SiteConfig,
  opts: { path: string; title: Metadata["title"]; shareTitle: string; description: string; images?: { url: string; alt?: string }[] }
): Metadata {
  const url = `${storeBaseUrl(site)}${opts.path}`;
  const logo = site.organization.logo || "/logo.png";
  const images = opts.images?.length ? opts.images : [{ url: logo, alt: site.name }];
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: site.name,
      title: opts.shareTitle,
      description: opts.description,
      locale: "fa_IR",
      images,
    },
    twitter: {
      card: opts.images?.length ? "summary_large_image" : "summary",
      title: opts.shareTitle,
      description: opts.description,
      images: images.map((i) => i.url),
    },
  };
}

// ─── Category URLs ─────────────────────────────────────────────────────────

/** `/category/{slug}`, with `?page=N` past page 1. */
export function categoryPath(category: Pick<Category, "slug">, opts: { page?: number | string } = {}): string {
  const page = Number(opts.page);
  return `/category/${encodeURIComponent(category.slug)}${page > 1 ? `?page=${page}` : ""}`;
}

/** Every category, subcategories included (the API nests them under their parent). */
export function flatCategories(list: Category[]): Category[] {
  return list.flatMap((c) => [c, ...flatCategories(c.children ?? [])]);
}

/** The path from a top-level category down to the one with `match`, or [] when none matches. */
export function findCategoryTrail(list: Category[], match: (c: Category) => boolean): Category[] {
  for (const category of list) {
    if (match(category)) return [category];
    const below = findCategoryTrail(category.children ?? [], match);
    if (below.length) return [category, ...below];
  }
  return [];
}

/** A category by slug anywhere in the tree; the slug may arrive percent-encoded. */
export function findCategoryBySlug(list: Category[], slug: string): Category | null {
  let wanted = slug;
  try {
    wanted = decodeURIComponent(slug);
  } catch {
    // a malformed escape: compare as-is
  }
  return flatCategories(list).find((c) => c.slug === wanted) ?? null;
}

// ─── JSON-LD ───────────────────────────────────────────────────────────────

/** JSON for a <script type="application/ld+json">, safe against `</script>` in the data. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function productSchema(product: ProductDetail, site: SiteConfig, canonicalUrl: string) {
  const variants = product.variants ?? [];
  const defaultVariant = variants.find((v) => v.is_default) || variants[0];
  const images = (product.images ?? []).map((img) => img.url).filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description?.trim() || `${product.name} - ${site.name}`,
    image: images.length ? images : undefined,
    sku: defaultVariant?.sku || undefined,
    brand: { "@type": "Brand", name: site.name },
    ...(defaultVariant
      ? {
          offers: {
            "@type": "Offer",
            url: canonicalUrl,
            priceCurrency: "IRR",
            price: defaultVariant.base_price.toString(),
            availability: variants.some((v) => v.in_stock)
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: site.name },
          },
        }
      : {}),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function storeSchema(site: SiteConfig) {
  const about = typeof site.settings.about === "string" ? site.settings.about.trim() : "";
  const contact = site.settings.contact;
  const sameAs = (contact?.socials ?? []).map((s) => s.url).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: site.name,
    url: storeBaseUrl(site),
    logo: site.organization.logo || undefined,
    description: about || `فروشگاه آنلاین ${site.name}`,
    telephone: contact?.phone || site.settings.notify_phone || undefined,
    address: contact?.address
      ? { "@type": "PostalAddress", streetAddress: contact.address, addressCountry: "IR" }
      : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

/** The merchant's key pages as SiteNavigationElements, a hint for Google's sitelinks. */
export function siteNavigationSchema(site: SiteConfig) {
  const links = site.seo_sitelinks ?? [];
  if (!links.length) return null;
  const base = storeBaseUrl(site);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: links.map((link, index) => ({
      "@type": "SiteNavigationElement",
      position: index + 1,
      name: link.label,
      ...(link.description ? { description: link.description } : {}),
      url: `${base}${link.path}`,
    })),
  };
}

export function JsonLd({ data }: { data: unknown }) {
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />;
}
