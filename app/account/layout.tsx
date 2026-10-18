import type { Metadata } from "next";

// Private, per-customer pages: keep them out of search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
