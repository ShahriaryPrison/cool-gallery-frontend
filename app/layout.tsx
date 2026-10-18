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
import {
  BASE_OPEN_GRAPH,
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  getSiteUrl,
  jsonLd,
} from "@/lib/seo";

import "@fontsource-variable/vazirmatn";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(await getSiteUrl()),
    title: {
      default: SITE_TITLE,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    openGraph: {
      ...BASE_OPEN_GRAPH,
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE],
    },
    icons: {
      icon: "/logo.png",
      shortcut: "/logo.png",
      apple: "/logo.png",
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const siteUrl = await getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Store",
        "@id": `${siteUrl}/#store`,
        name: SITE_NAME,
        alternateName: "کول گالری",
        description: SITE_DESCRIPTION,
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        image: `${siteUrl}${DEFAULT_OG_IMAGE}`,
        address: {
          "@type": "PostalAddress",
          streetAddress: "زنبیل‌آباد، میدان مفتح، روبه‌روی فست‌فود کیپو، پلاک ۷، مجموعه کول",
          addressLocality: "قم",
          addressRegion: "قم",
          addressCountry: "IR",
        },
        sameAs: ["https://www.instagram.com/cool_glry/"],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: SITE_NAME,
        url: siteUrl,
        inLanguage: "fa-IR",
        publisher: { "@id": `${siteUrl}/#store` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/shop?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html
      lang="fa"
      dir="rtl"
      suppressHydrationWarning
      className="dark antialiased"
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
        />
      </head>
      <body className="bg-background text-foreground selection:bg-brand selection:text-white">
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
