import { NextRequest, NextResponse } from "next/server";
import { API_BASE, DEFAULT_STORE_SLUG } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Torob sends the version header as `X-Torob-Token-Version`, sometimes misspelled `C-Torob-Token-Version`. */
const FORWARDED_HEADERS = ["x-torob-token", "x-torob-token-version", "c-torob-token-version"];

/**
 * Torob's product feed, answered on the shop's own domain as under the old storefront
 * template: the request goes to the Avval backend and its status and body come back unchanged.
 */
export async function POST(req: NextRequest) {
  const headers: Record<string, string> = {
    "Content-Type": req.headers.get("content-type") ?? "application/json",
    Accept: "application/json",
  };
  for (const name of FORWARDED_HEADERS) {
    const value = req.headers.get(name);
    if (value !== null) headers[name] = value;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/${DEFAULT_STORE_SLUG}/integrations/torob/v3/products`, {
      method: "POST",
      headers,
      body: await req.text(),
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return NextResponse.json({ error: "upstream unavailable" }, { status: 502 });
  }
  return new NextResponse(await res.text(), {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}

const notAllowed = () => new NextResponse(null, { status: 405, headers: { Allow: "POST" } });
export const GET = notAllowed;
export const PUT = notAllowed;
export const PATCH = notAllowed;
export const DELETE = notAllowed;
