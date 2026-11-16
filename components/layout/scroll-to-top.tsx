"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { forgetFilters, listingPath } from "@/lib/listing-memory";

const STORAGE_KEY = "cg.scroll-positions";
const MAX_ENTRIES = 60;

type Saved = { y: number; h: number };

function readAll(): Record<string, Saved> {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function save(key: string, value: Saved) {
  try {
    const all = readAll();
    delete all[key];
    all[key] = value;
    const keys = Object.keys(all);
    for (const k of keys.slice(0, Math.max(0, keys.length - MAX_ENTRIES))) delete all[k];
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // storage blocked: the page just opens at the top
  }
}

/**
 * Opens every new page at the top, but brings back / forward to where the visitor was:
 * the same scroll position on the category or product list they came from. The window's
 * own restoration can't do it — the pages are rendered per request, so the page is still
 * short when the browser tries — so positions are kept per address and re-applied once
 * the page is tall enough.
 */
function ScrollManager() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const key = search ? `${pathname}?${search}` : pathname;

  const keyRef = useRef(key);
  // True from the moment we leave a page until the next one is in: the scrolling Next itself
  // does to the top of the new page must not overwrite the spot we're keeping for the old one.
  const leavingRef = useRef(false);
  const lastRef = useRef<Saved>({ y: 0, h: 0 });
  const cancelRestore = useRef<(() => void) | null>(null);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    let timeout: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      if (timeout) return;
      timeout = setTimeout(() => {
        timeout = undefined;
        if (leavingRef.current) return;
        const y = window.scrollY;
        const h = document.documentElement.scrollHeight;
        const prev = lastRef.current;
        // A page swap that makes the document shorter clamps the scroll to its end; that
        // isn't the visitor scrolling, so it must not overwrite the spot they left.
        const clamped = h < prev.h && y + window.innerHeight >= h - 1;
        if (clamped) return;
        lastRef.current = { y, h };
        save(keyRef.current, { y, h });
      }, 80);
    };
    // A new page (a link, router.push): keep the last spot we saw scrolling on this one.
    const pushState = history.pushState.bind(history);
    history.pushState = (...args: Parameters<History["pushState"]>) => {
      // Opening an address afresh starts it clean: no filters left over from an earlier visit.
      forgetFilters(listingPath(args[2]));
      if (!leavingRef.current) {
        save(keyRef.current, lastRef.current);
        leave();
      }
      return pushState(...args);
    };
    let timer: ReturnType<typeof setTimeout> | undefined;
    function leave() {
      leavingRef.current = true;
      // Safety net for a navigation that ends up on the same address.
      clearTimeout(timer);
      timer = setTimeout(() => (leavingRef.current = false), 1500);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      history.pushState = pushState;
      clearTimeout(timer);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    cancelRestore.current?.();
    cancelRestore.current = null;

    // A page that came in without a push (nothing called history.pushState) is back / forward.
    // The router swaps the page before any popstate listener of ours runs, so the spot of the
    // page we left is the last one the scroll listener saw.
    const prevKey = keyRef.current;
    const popped = prevKey !== key && !leavingRef.current;
    if (popped) save(prevKey, lastRef.current);
    leavingRef.current = false;
    keyRef.current = key;

    const target = popped ? readAll()[key]?.y : undefined;
    if (!target) {
      window.scrollTo(0, 0);
      lastRef.current = { y: 0, h: document.documentElement.scrollHeight };
      return;
    }

    // Wait for the page to grow tall enough, then stop at once if the visitor takes over.
    const startedAt = performance.now();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const stop = () => {
      clearTimeout(timer);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
      cancelRestore.current = null;
    };
    const step = () => {
      const reachable = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.min(target, Math.max(0, reachable)));
      lastRef.current = { y: window.scrollY, h: document.documentElement.scrollHeight };
      if (Math.abs(window.scrollY - target) < 2 || performance.now() - startedAt > 2500) {
        stop();
        return;
      }
      timer = setTimeout(step, 40);
    };
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);
    cancelRestore.current = stop;
    step();

    return stop;
  }, [key]);

  return null;
}

export function ScrollToTop() {
  return (
    <Suspense fallback={null}>
      <ScrollManager />
    </Suspense>
  );
}
