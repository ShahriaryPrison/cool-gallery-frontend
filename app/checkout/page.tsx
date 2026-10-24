import type { Metadata } from "next";
import { getSite } from "@/lib/api";
import { CheckoutView } from "./checkout-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ثبت سفارش و پرداخت",
  description: "تکمیل خرید و پرداخت آنلاین در کول گالری",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CheckoutPage() {
  const site = await getSite().catch(() => null);
  return <CheckoutView site={site} />;
}
