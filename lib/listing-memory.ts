/**
 * What a listing remembers for the visitor when they come back to it with the browser's back
 * button: the price band, "only discounted" and whether the filter panel was open. Kept per
 * address in sessionStorage; opening the address afresh (a link, a pill) forgets it, so only a
 * real "back" brings the old filters back. `ScrollToTop` does the forgetting.
 */
export type ListingFilters = { band: string; onlyOff: boolean; open: boolean };

const PREFIX = "cg.listing-filters:";

const keyOf = (path: string) => PREFIX + path;

/** `/products?page=2` for the address a visitor is on (or is going to). */
export function listingPath(url?: string | URL | null): string {
  try {
    const u = new URL(String(url ?? window.location.href), window.location.href);
    return u.pathname + u.search;
  } catch {
    return "";
  }
}

export function readFilters(path: string): ListingFilters | null {
  try {
    const raw = sessionStorage.getItem(keyOf(path));
    return raw ? (JSON.parse(raw) as ListingFilters) : null;
  } catch {
    return null;
  }
}

export function writeFilters(path: string, filters: ListingFilters) {
  try {
    if (filters.band === "all" && !filters.onlyOff && !filters.open) sessionStorage.removeItem(keyOf(path));
    else sessionStorage.setItem(keyOf(path), JSON.stringify(filters));
  } catch {
    // storage blocked: filters just start clean
  }
}

export function forgetFilters(path: string) {
  try {
    sessionStorage.removeItem(keyOf(path));
  } catch {
    // ignore
  }
}
