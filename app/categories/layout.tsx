import type { Metadata } from "next";
import { getSite } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite().catch(() => null);
  const title = "دسته‌بندی محصولات";
  if (!site) return { title };
  return pageMetadata(site, {
    path: "/categories",
    title,
    shareTitle: `${title} | ${site.name}`,
    description: `همه دسته‌بندی‌های محصولات فروشگاه اینترنتی ${site.name}`,
  });
}

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
