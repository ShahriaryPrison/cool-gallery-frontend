import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findSitePage, sitePageMetadata, SitePageView } from "@/components/content/site-page";
import { getSite } from "@/lib/api";

export const revalidate = 60;

const TITLE = "تماس با ما";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return sitePageMetadata(site, findSitePage(site, "contact"), "/contact", TITLE);
}

export default async function ContactPage() {
  const site = await getSite();
  const page = findSitePage(site, "contact");
  if (!page) notFound();
  return <SitePageView site={site} page={page} path="/contact" title={TITLE} />;
}
