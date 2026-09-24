import type { Metadata } from "next";

import { CartProvider } from "@/components/cart/cart-provider";
import { CustomerAuthProvider } from "@/lib/auth";
import { AuthModal } from "@/components/auth/auth-modal";
import { LookbookProvider } from "@/components/intro/lookbook-provider";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CinematicIntro } from "@/components/intro/cinematic-intro";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SiteFrame } from "@/components/layout/site-frame";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: "COOL Gallery — فروشگاه تخصصی اکسسوری، فیجت و زیورآلات خاص",
  description:
    "خرید آنلاین انواع فیجت‌های مفصلی اژدها، گردنبند و دستبند استیل ۳۱۶ رنگ ثابت، انگشتر گوتیک و جاکارتی چرم طبیعی با ارسال سریع به سراسر ایران.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fa"
      dir="rtl"
      suppressHydrationWarning
      className="dark antialiased"
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('scrollRestoration' in history){history.scrollRestoration='manual'}window.scrollTo(0,0);`,
          }}
        />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="shortcut icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
        />
      </head>
      <body className="bg-background text-foreground selection:bg-brand selection:text-white">
        <ScrollToTop />
        <CinematicIntro />
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
