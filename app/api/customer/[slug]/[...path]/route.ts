import { NextRequest, NextResponse } from "next/server";

const API =
  process.env.AVVAL_API_URL ||
  process.env.NEXT_PUBLIC_AVVAL_API_URL ||
  "http://127.0.0.1:8080/api/v1";

type Ctx = { params: Promise<{ slug: string; path: string[] }> };

async function handler(req: NextRequest, { params }: Ctx) {
  const { slug, path } = await params;
  const pathStr = path.join("/");
  
  // Route to customer endpoint or general storefront endpoint if requested
  const isDirectStorefront = pathStr.startsWith("categories") || pathStr.startsWith("products");
  const endpoint = isDirectStorefront
    ? `${API}/${slug}/sites/storefront/${pathStr}${req.nextUrl.search}`
    : `${API}/${slug}/sites/storefront/customer/${pathStr}${req.nextUrl.search}`;

  const backendUrl = endpoint;

  const headers = new Headers({ "Content-Type": "application/json" });

  const clientAuth = req.headers.get("authorization");
  if (clientAuth) headers.set("Authorization", clientAuth);

  const idempotencyKey = req.headers.get("idempotency-key");
  if (idempotencyKey) headers.set("Idempotency-Key", idempotencyKey);

  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await req.text();

  try {
    const res = await fetch(backendUrl, { method: req.method, headers, body });
    const text = await res.text();

    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch (error) {
    console.error("Proxy route error:", error);
    return NextResponse.json(
      { message: "خطا در برقراری ارتباط با سرور." },
      { status: 502 }
    );
  }
}

export { handler as GET, handler as POST, handler as PATCH, handler as PUT, handler as DELETE };
