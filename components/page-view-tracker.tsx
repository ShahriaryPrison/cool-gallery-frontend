"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_STORE_SLUG } from "@/lib/api";
import { viewTarget, visitorId } from "@/lib/pageView";

/**
 * Records one page view per navigation for the merchant's Avval analytics. Renders nothing.
 * Goes through our own /api/views route so a slow API never touches the page.
 */
export function PageViewTracker({ slug = DEFAULT_STORE_SLUG }: { slug?: string }) {
  const pathname = usePathname();

  useEffect(() => {
    // Embedded previews (the editor) are not visitors.
    if (window.self !== window.top) return;

    const target = viewTarget(pathname);
    if (!target) return;

    fetch(`/api/views/${encodeURIComponent(slug)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...target, visitor_id: visitorId() }),
      keepalive: true,
    }).catch(() => {
      // Analytics must never surface an error to the shopper.
    });
  }, [pathname, slug]);

  return null;
}
