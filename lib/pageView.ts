export type PageViewType = "page" | "product" | "category";

export interface PageViewTarget {
  type: PageViewType;
  key: string;
}

/**
 * Maps a storefront URL to what the Avval API counts: the home page, a builder page, a product
 * or a category, each by slug. Anything else (cart, checkout, profile, listings…) is not counted.
 */
export function viewTarget(pathname: string): PageViewTarget | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return { type: "page", key: "home" };

  const match = path.match(/^\/(products|category|p)\/([^/]+)$/);
  if (!match) return null;

  let key = match[2];
  try {
    key = decodeURIComponent(key);
  } catch {
    // malformed escape: count it as-is
  }
  const type: PageViewType = match[1] === "products" ? "product" : match[1] === "category" ? "category" : "page";
  return { type, key };
}

const VISITOR_KEY = "avval_visitor_id";

/** Anonymous random id, kept in localStorage; the API hashes it per day and never stores it. */
export function visitorId(): string | undefined {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return undefined; // storage blocked: the API falls back to ip + user-agent
  }
}
