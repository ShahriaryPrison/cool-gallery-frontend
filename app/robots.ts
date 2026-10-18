import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = await getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/account", "/checkout", "/order/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
