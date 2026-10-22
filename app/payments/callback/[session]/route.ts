import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";

/**
 * Forwards the PSP's callback (GET for Zarinpal/Zibal, POST for Saman/Mellat) to the
 * backend on whichever domain the buyer's checkout started on, then relays the
 * backend's redirect. This is what makes the callback round-trip stay on the
 * merchant's own domain instead of api.avval.app — see the Shaparak
 * domain-matching note on CheckoutController::callbackUrl in the backend repo.
 */
async function forward(req: NextRequest, session: string): Promise<NextResponse> {
  const url = `${API_BASE}/payments/callback/${session}${req.nextUrl.search}`;

  const init: RequestInit = {
    method: req.method,
    redirect: "manual",
    headers: { Accept: "application/json" },
  };

  if (req.method === "POST") {
    init.body = await req.text();
    init.headers = {
      ...init.headers,
      "Content-Type": req.headers.get("content-type") ?? "application/x-www-form-urlencoded",
    };
  }

  const res = await fetch(url, init);
  const location = res.headers.get("location");

  if (location) {
    return NextResponse.redirect(location, 302);
  }

  return new NextResponse("Payment callback did not return a redirect.", { status: 502 });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ session: string }> }) {
  const { session } = await params;
  return forward(req, session);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ session: string }> }) {
  const { session } = await params;
  return forward(req, session);
}
