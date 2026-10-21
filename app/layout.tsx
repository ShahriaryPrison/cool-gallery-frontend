import type { Metadata } from "next";

import { CartProvider } from "@/components/cart/cart-provider";
import { CustomerAuthProvider } from "@/lib/auth";
import { AuthModal } from "@/components/auth/auth-modal";
import { LookbookProvider } from "@/components/intro/lookbook-provider";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SiteFrame } from "@/components/layout/site-frame";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { Toaster } from "@/components/ui/sonner";
import { getSite } from "@/lib/api";
import { JsonLd, pageMetadata, storeBaseUrl, storeSchema } from "@/lib/seo";

import "./globals.css";

const DEFAULT_TITLE = "COOL Gallery — فروشگاه تخصصی اکسسوری، فیجت و زیورآلات خاص";
const DEFAULT_DESCRIPTION =
  "خرید آنلاین انواع فیجت‌های مفصلی اژدها، گردنبند و دستبند استیل ۳۱۶ رنگ ثابت، انگشتر گوتیک و جاکارتی چرم طبیعی با ارسال سریع به سراسر ایران.";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite().catch(() => null);
  const icons = { icon: "/logo.png", shortcut: "/logo.png", apple: "/logo.png" };
  if (!site) return { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, icons };

  // Same as the old storefront template: inner pages are "<page> | <shop>", the site's
  // verification codes (Search Console, enamad, samandehi) stay in the head.
  const about = typeof site.settings.about === "string" ? site.settings.about.trim() : "";
  const description = about ? about.slice(0, 160) : DEFAULT_DESCRIPTION;
  const gsc = site.settings.google_search_console?.verification_code?.trim();
  const enamad = (
    site.settings.licenses?.enamad?.verification_code ||
    site.settings.enamad?.verification_code ||
    site.organization.enamad?.verification_code
  )?.trim();
  const samandehi = site.settings.licenses?.samandehi?.verification_code?.trim();
  const other: Record<string, string> = {};
  if (enamad) other.enamad = enamad;
  if (samandehi) other.samandehi = samandehi;

  // The canonical is left to each page: inherited from here it would point every page at "/".
  const { alternates: _homeOnly, ...shared } = pageMetadata(site, {
    path: "/",
    title: { default: DEFAULT_TITLE, template: `%s | ${site.name}` },
    shareTitle: site.name,
    description,
  });
  return {
    metadataBase: new URL(storeBaseUrl(site)),
    ...shared,
    icons,
    verification: {
      google: gsc || undefined,
      other: Object.keys(other).length ? other : undefined,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite().catch(() => null);
  return (
    <html
      lang="fa"
      dir="rtl"
      suppressHydrationWarning
      className="dark antialiased"
    >
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="shortcut icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap"
        />
      </head>
      <body className="bg-background text-foreground selection:bg-brand selection:text-white">
        {site && <JsonLd data={storeSchema(site)} />}
        <ScrollToTop />
        <CustomerAuthProvider>
          <CartProvider>
            <LookbookProvider>
              <SiteFrame>
                <Header />
                <main>{children}</main>
                <Footer />
                {/* clearance for the floating nav bar on mobile & desktop */}
                <div className="h-[140px] lg:h-[180px]" aria-hidden />
                <BottomNav />
              </SiteFrame>
              <CartDrawer />
              <AuthModal />
              <Toaster theme="dark" />
            </LookbookProvider>
          </CartProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
