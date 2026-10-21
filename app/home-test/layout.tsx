import type { Metadata } from "next";

// A design playground, not a page of the shop.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function HomeTestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
