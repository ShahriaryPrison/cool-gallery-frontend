import { NextRequest, NextResponse } from "next/server";
import { englishDigitsInUrl, toEnglishDigits } from "@/lib/digits";

const API =
  process.env.AVVAL_API_URL ||
  process.env.NEXT_PUBLIC_AVVAL_API_URL ||
  "https://api.avval.app/api/v1";

type Ctx = { params: Promise<{ slug: string; path: string[] }> };

async function handler(req: NextRequest, { params }: Ctx) {
  const { slug, path } = await params;
  const pathStr = path.join("/");
  const search = englishDigitsInUrl(req.nextUrl.search);
  
  // Route to customer endpoint or general storefront endpoint if requested
  const isDirectStorefront = pathStr.startsWith("categories") || pathStr.startsWith("products");
  const endpoint = isDirectStorefront
    ? `${API}/${slug}/sites/storefront/${pathStr}${search}`
    : `${API}/${slug}/sites/storefront/customer/${pathStr}${search}`;

  const backendUrl = endpoint;

  const headers = new Headers({ "Content-Type": "application/json" });

  const clientAuth = req.headers.get("authorization");
  if (clientAuth) headers.set("Authorization", clientAuth);

  const idempotencyKey = req.headers.get("idempotency-key");
  if (idempotencyKey) headers.set("Idempotency-Key", idempotencyKey);

  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : toEnglishDigits(await req.text());

  let res: Response;
  try {
    res = await fetch(backendUrl, {
      method: req.method,
      headers,
      body,
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return NextResponse.json({ message: "upstream_unavailable" }, { status: 504 });
  }

  // A 204/205/304 must not carry a body — the Response constructor throws if it does.
  if (res.status === 204 || res.status === 205 || res.status === 304) {
    return new NextResponse(null, { status: res.status });
  }

  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/json",
    },
  });
}

export { handler as GET, handler as POST, handler as PATCH, handler as PUT, handler as DELETE };
