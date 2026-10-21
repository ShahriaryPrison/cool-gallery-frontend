import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { findSitePage, sitePageMetadata, sitePagePath, SitePageView } from "@/components/content/site-page";
import { getSite } from "@/lib/api";

export const revalidate = 60;

type Props = { params: Promise<{ pageSlug: string }> };

async function resolve({ params }: Props) {
  const { pageSlug } = await params;
  const site = await getSite();
  const page = findSitePage(site, { slug: decodeURIComponent(pageSlug) });
  if (!page) notFound();
  // About, contact and home have their own addresses, as in the old template.
  const path = sitePagePath(page);
  if (path !== `/p/${encodeURIComponent(page.slug)}`) permanentRedirect(path ?? "/");
  return { site, page, path };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { site, page, path } = await resolve(props);
  return sitePageMetadata(site, page, path, page.title);
}

export default async function SitePage(props: Props) {
  const { site, page, path } = await resolve(props);
  return <SitePageView site={site} page={page} path={path} title={page.title} />;
}
