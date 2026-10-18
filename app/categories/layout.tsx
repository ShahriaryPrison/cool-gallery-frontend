import type { Metadata } from "next";
import { BASE_OPEN_GRAPH } from "@/lib/seo";

export const metadata: Metadata = {
  title: "دسته‌بندی محصولات",
  description:
    "مرور دسته‌بندی‌های COOL Gallery: گردنبند، دستبند، انگشتر، گوشواره، پیرسینگ، فیجت، جاکلیدی و ست‌های هدیه.",
  alternates: { canonical: "/categories" },
  openGraph: {
    ...BASE_OPEN_GRAPH,
    title: "دسته‌بندی محصولات | COOL Gallery",
    url: "/categories",
  },
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
