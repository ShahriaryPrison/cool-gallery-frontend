"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useSpring, useMotionValueEvent } from "motion/react";
import { Grid2x2, House, ShoppingBag, ShoppingCart, type LucideIcon } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  isActive: (pathname: string) => boolean;
}

const ITEMS: NavItem[] = [
  { key: "home", label: "صفحه اصلی", icon: House, href: "/", isActive: (p) => p === "/" },
  {
    key: "categories",
    label: "دسته‌بندی",
    icon: Grid2x2,
    href: "/categories",
    isActive: (p) => p.startsWith("/categories"),
  },
  {
    key: "products",
    label: "محصولات",
    icon: ShoppingBag,
    href: "/shop",
    isActive: (p) => p.startsWith("/shop") || p.startsWith("/product"),
  },
  { key: "cart", label: "سبد", icon: ShoppingCart, isActive: () => false },
];

/** Page-scroll indicator that fills right to left (RTL) flush along the bottom of the nav. */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] w-full overflow-hidden bg-white/10">
      <motion.div
        className="bg-brand h-full w-full shadow-[0_0_12px_rgba(255,45,60,0.95)]"
        style={{ scaleX: scrollYProgress, transformOrigin: "right center" }}
      />
    </div>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const cart = useCart();
  const [visible, setVisible] = useState(() => !pathname.startsWith("/product") && pathname !== "/");

  useEffect(() => {
    const checkVisibility = () => {
      if (pathname.startsWith("/product")) {
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollPos = window.scrollY + window.innerHeight;
        // Show only when user scrolls near the end of the page (within 420px)
        setVisible(scrollHeight > 0 && scrollPos >= scrollHeight - 420);
      } else if (pathname === "/") {
        setVisible(window.scrollY > 50);
      } else {
        setVisible(true);
      }
    };

    checkVisibility();
    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility, { passive: true });
    return () => {
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
    };
  }, [pathname]);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-[468px] flex-col px-4 pb-[max(18px,env(safe-area-inset-bottom))] lg:hidden",
        visible ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      <motion.nav
        initial={false}
        animate={{
          y: visible ? 0 : 90,
          opacity: visible ? 1 : 0,
          scale: visible ? 1 : 0.94,
        }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="glass-nav relative flex w-full items-center gap-1 overflow-hidden rounded-[26px] p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
      >
        {ITEMS.map((item) => {
          const active = item.isActive(pathname);
          const Icon = item.icon;

          const content = (
            <>
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="glass-brand absolute inset-0 rounded-[20px]"
                />
              )}
              <span className="relative flex flex-col items-center gap-1">
                <span className="relative">
                  <Icon
                    className={cn("size-[19px] transition-colors", active ? "text-white" : "text-ink-4")}
                    strokeWidth={active ? 2.4 : 1.9}
                  />
                  {item.key === "cart" && cart.count > 0 && (
                    <motion.span
                      key={cart.count}
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 600, damping: 20 }}
                      className="bg-brand absolute -top-1.5 -left-2 grid h-[17px] min-w-[17px] place-items-center rounded-full px-1 text-[10px] leading-none font-bold text-white shadow-[0_0_12px_rgba(255,45,60,0.7)]"
                    >
                      {toFaDigits(cart.count)}
                    </motion.span>
                  )}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-bold transition-colors",
                    active ? "text-white" : "text-ink-4",
                  )}
                >
                  {item.label}
                </span>
              </span>
            </>
          );

          const inner = "relative flex items-center justify-center rounded-[20px] py-2.5";
          const tap = { scale: 0.9 };
          const spring = { type: "spring", stiffness: 500, damping: 28 } as const;

          return item.href ? (
            <Link key={item.key} href={item.href} className="flex-1">
              <motion.span whileTap={tap} transition={spring} className={cn("flex", inner)}>
                {content}
              </motion.span>
            </Link>
          ) : (
            <motion.button
              key={item.key}
              type="button"
              onClick={() => cart.open()}
              whileTap={tap}
              transition={spring}
              className={cn("flex-1", inner)}
            >
              {content}
            </motion.button>
          );
        })}
        <ScrollProgress />
      </motion.nav>
    </div>
  );
}
