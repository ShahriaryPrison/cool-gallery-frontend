import type { MetadataRoute } from "next";
import { getSite } from "@/lib/api";
import { storeBaseUrl } from "@/lib/seo";

export const revalidate = 86400;

/** /robots.txt, the same rules as the old storefront template's. */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSite().catch(() => null);
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart", "/checkout", "/profile", "/login", "/order", "/api/", "/home-test"],
    },
    sitemap: `${storeBaseUrl(site)}/sitemap.xml`,
  };
}
