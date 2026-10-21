import type { Metadata } from "next";
import { MapPin, Phone, ShieldCheck, Truck, CreditCard, Clock } from "lucide-react";
import { breadcrumbSchema, JsonLd, pageMetadata, storeBaseUrl } from "@/lib/seo";
import type { Block, SiteConfig, SitePage } from "@/lib/types";

/**
 * The shop's own pages from the Avval site editor (about, contact and any custom page),
 * at the old storefront template's addresses: /about, /contact, /p/{slug}. Only the block
 * types those pages are built from are drawn; anything else is skipped.
 */

const isAbout = (p: SitePage) => p.slug === "about" || p.slug === "about-us" || p.title === "درباره ما";
const isContact = (p: SitePage) => p.slug === "contact" || p.slug === "contact-us" || p.title === "تماس با ما";

export function findSitePage(site: SiteConfig, kind: "about" | "contact" | { slug: string }): SitePage | null {
  const pages = site.pages ?? [];
  if (kind === "about") return pages.find(isAbout) ?? null;
  if (kind === "contact") return pages.find(isContact) ?? null;
  return pages.find((p) => p.slug === kind.slug) ?? null;
}

/** Where a page lives: about and contact have their own top-level address, the rest /p/{slug}. */
export function sitePagePath(page: SitePage): string | null {
  if (page.slug === "home") return null;
  if (isAbout(page)) return "/about";
  if (isContact(page)) return "/contact";
  return `/p/${encodeURIComponent(page.slug)}`;
}

export function sitePageMetadata(site: SiteConfig, page: SitePage | null, path: string, title: string): Metadata {
  const about = typeof site.settings.about === "string" ? site.settings.about.trim() : "";
  const description = about
    ? about.slice(0, 160)
    : path === "/about"
      ? `درباره فروشگاه ${site.name}`
      : `صفحه ${page?.title || title} در فروشگاه آنلاین ${site.name}`;
  return pageMetadata(site, { path, title, shareTitle: `${title} | ${site.name}`, description });
}

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

const BADGE_ICONS = { truck: Truck, card: CreditCard, clock: Clock, shield: ShieldCheck } as const;

function BlockView({ block, site, isTitle }: { block: Block; site: SiteConfig; isTitle?: boolean }) {
  const s = block.settings ?? {};
  switch (block.type) {
    case "banner":
    case "hero": {
      const Heading = isTitle ? "h1" : "h2";
      return (
        <header className="glass rounded-[28px] px-6 py-10 text-center lg:py-14">
          <Heading className="text-[26px] font-black text-white lg:text-[36px]">{str(s.heading)}</Heading>
          {str(s.subheading) && <p className="text-ink-3 mt-2 text-[13.5px]">{str(s.subheading)}</p>}
        </header>
      );
    }
    case "rich_text":
      if (!str(s.body) && !str(s.heading)) return null;
      return (
        <section className="glass rounded-[28px] p-6 lg:p-8">
          {str(s.heading) && <h2 className="text-[19px] font-black text-white">{str(s.heading)}</h2>}
          {str(s.body) && <p className="text-ink-2 mt-3 text-[13.5px] leading-8 whitespace-pre-line">{str(s.body)}</p>}
        </section>
      );
    case "trust_badges": {
      const items = Array.isArray(s.items) ? (s.items as Record<string, unknown>[]) : [];
      if (!items.length) return null;
      return (
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = BADGE_ICONS[str(item.icon) as keyof typeof BADGE_ICONS] ?? ShieldCheck;
            return (
              <div key={i} className="glass rounded-3xl p-4">
                <Icon className="text-brand size-5" />
                <div className="mt-3 text-[13.5px] font-bold text-white">{str(item.title)}</div>
                <div className="text-ink-4 mt-1 text-[12px] leading-relaxed">{str(item.desc)}</div>
              </div>
            );
          })}
        </section>
      );
    }
    case "contact": {
      // The block's own values, else the shop's contact settings.
      const contact = site.settings.contact ?? {};
      const phone = str(s.phone) || str(contact.phone);
      const address = str(s.address) || str(contact.address);
      if (!phone && !address) return null;
      return (
        <section className="glass space-y-3 rounded-[28px] p-6 text-[13.5px] lg:p-8">
          {phone && s.show_phone !== false && (
            <a href={`tel:${phone}`} className="text-ink-2 flex items-center gap-2">
              <Phone className="text-brand size-4" />
              <span dir="ltr">{phone}</span>
            </a>
          )}
          {address && s.show_address !== false && (
            <div className="text-ink-2 flex items-start gap-2">
              <MapPin className="text-brand mt-0.5 size-4 shrink-0" />
              <span>{address}</span>
            </div>
          )}
        </section>
      );
    }
    default:
      return null;
  }
}

export function SitePageView({ site, page, path, title }: { site: SiteConfig; page: SitePage | null; path: string; title: string }) {
  const baseUrl = storeBaseUrl(site);
  const blocks = page?.blocks ?? [];
  // A page that opens with a banner gets its heading as the page's <h1>.
  const bannerTitle = ["banner", "hero"].includes(blocks[0]?.type ?? "") && str(blocks[0].settings?.heading);
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-5 pt-6 pb-16 lg:px-12 lg:pt-10">
      <JsonLd
        data={breadcrumbSchema([
          { name: site.name, url: `${baseUrl}/` },
          { name: title, url: `${baseUrl}${path}` },
        ])}
      />
      {!bannerTitle && <h1 className="text-[30px] leading-tight font-black text-white lg:text-[42px]">{title}</h1>}
      {blocks.map((block, i) => (
        <BlockView key={block.id ?? i} block={block} site={site} isTitle={Boolean(bannerTitle) && i === 0} />
      ))}
    </div>
  );
}
