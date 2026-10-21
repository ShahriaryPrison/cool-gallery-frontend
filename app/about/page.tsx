import type { Metadata } from "next";
import { findSitePage, sitePageMetadata, SitePageView } from "@/components/content/site-page";
import { getSite } from "@/lib/api";

export const revalidate = 60;

const TITLE = "درباره ما";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return sitePageMetadata(site, findSitePage(site, "about"), "/about", TITLE);
}

export default async function AboutPage() {
  const site = await getSite();
  return <SitePageView site={site} page={findSitePage(site, "about")} path="/about" title={TITLE} />;
}
