import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";

type Ctx = { params: Promise<{ slug: string }> };

/** Relays a page-view beacon to the API, keeping the visitor's IP and user-agent. */
export async function POST(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;

  const headers = new Headers({ "Content-Type": "application/json", Accept: "application/json" });
  const ua = req.headers.get("user-agent");
  if (ua) headers.set("User-Agent", ua);
  const ip = req.headers.get("x-forwarded-for");
  if (ip) headers.set("X-Forwarded-For", ip);

  try {
    await fetch(`${API_BASE}/${encodeURIComponent(slug)}/sites/storefront/views`, {
      method: "POST",
      headers,
      body: await req.text(),
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    // Best effort: a lost view is not worth failing the shopper's page.
  }
  return new NextResponse(null, { status: 204 });
}
