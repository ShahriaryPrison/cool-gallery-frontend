"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "motion/react";
import { Search, UserRound, X, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useIntroDone } from "@/components/intro/use-intro-done";
import { PRODUCTS } from "@/lib/data";
import { formatToman } from "@/lib/format";
import { ProductImage } from "@/components/product/product-image";
import { cn } from "@/lib/utils";

/** Mounted only while open, so the query resets on close without an effect. */
function SearchPanel({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const q = query.trim();
  const results = q
    ? PRODUCTS.filter((p) => p.name.includes(q) || p.cat.includes(q)).slice(0, 6)
    : [];

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="absolute inset-0 bg-[#050507]/95 backdrop-blur-2xl"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        className="relative w-full max-w-[468px] px-4 pt-4 lg:max-w-[640px] lg:pt-6"
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -16, opacity: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
      >
        <div className="glass-panel flex items-center gap-2 rounded-2xl px-3 py-2.5">
          <Search className="text-ink-3 size-[18px] shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter" && q) {
                onClose();
                router.push(`/shop?q=${encodeURIComponent(q)}`);
              }
            }}
            placeholder="دنبال چی می‌گردی؟"
            className="text-ink-1 placeholder:text-ink-4 h-8 flex-1 bg-transparent text-[14.5px] outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="text-ink-3 hover:text-ink-1 grid size-7 shrink-0 place-items-center rounded-full bg-white/5 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <AnimatePresence mode="popLayout">
          {q && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-panel mt-2.5 overflow-hidden rounded-2xl p-1.5"
            >
              {results.length === 0 && (
                <div className="text-ink-4 px-3 py-6 text-center text-[13px]">
                  چیزی پیدا نشد.
                </div>
              )}
              {results.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.035 }}
                >
                  <Link
                    href={`/product/${p.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/6"
                  >
                    <ProductImage
                      image={p.image}
                      alt={p.name}
                      category={p.cat}
                      className="size-11 shrink-0 rounded-lg"
                      iconClassName="size-5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-ink-1 truncate text-[13px] font-bold">
                        {p.name}
                      </div>
                      <div className="text-ink-4 text-[11px]">{p.cat}</div>
                    </div>
                    <div className="text-ink-2 shrink-0 text-[12px] font-bold">
                      {formatToman(p.price)}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && <SearchPanel onClose={onClose} />}
    </AnimatePresence>
  );
}

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const cart = useCart();
  const introDone = useIntroDone();
  const isHome = pathname === "/" || pathname === "/home-test";
  const { scrollY } = useScroll();

  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setScrolledPastHero(true);
    } else {
      const threshold = window.innerHeight * 0.45;
      setScrolledPastHero(window.scrollY > threshold);
    }
  }, [isHome]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (isHome) {
      const threshold = window.innerHeight * 0.45;
      setScrolledPastHero(latest > threshold);
    } else {
      setScrolledPastHero(true);
    }
  });

  const showHeaderContent = !isHome || introDone;
  const showHeaderLogo = !searchOpen && (!isHome || scrolledPastHero);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 flex items-center justify-between px-4 py-3 transition-all duration-500 lg:px-8 lg:py-4",
          isHome ? "-mb-[64px] lg:-mb-[76px]" : "",
          showHeaderLogo
            ? "glass-bar border-b border-white/8 shadow-[0_8px_28px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent shadow-none backdrop-blur-none"
        )}
      >
        {/* Right Area: Logo (Start in RTL) */}
        <div
          className={cn(
            "flex items-center justify-start transition-all duration-500",
            showHeaderLogo ? "min-w-[100px] lg:min-w-[130px]" : "w-0 min-w-0 overflow-hidden"
          )}
        >
          <AnimatePresence mode="wait">
            {showHeaderContent && showHeaderLogo && (
              <motion.div
                key="header-logo"
                initial={{ opacity: 0, x: 24, scale: 0.85 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 350, damping: 26 }}
              >
                <Link
                  href="/"
                  aria-label="COOL Gallery"
                  className="shrink-0 flex items-center justify-center"
                >
                  <Image
                    src="/logo.png"
                    alt="COOL"
                    width={868}
                    height={336}
                    priority
                    className="h-9 w-auto drop-shadow-[0_0_18px_rgba(255,45,60,0.45)] sm:h-10 lg:h-11"
                  />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Center Area: Navigation Links (Desktop Only, animates smoothly between Right and Center) */}
        <div
          className={cn(
            "hidden lg:flex flex-1 items-center transition-all duration-700 ease-out",
            !showHeaderLogo ? "justify-start" : "justify-center"
          )}
        >
          <AnimatePresence>
            {showHeaderContent && (
              <motion.nav
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  layout: { type: "spring", stiffness: 260, damping: 28, mass: 0.7 },
                  opacity: { duration: 0.3 },
                }}
                className="flex items-center gap-8 py-1"
              >
                <Link
                  href="/"
                  className="text-[13.5px] font-bold text-white transition-colors hover:text-brand"
                >
                  صفحه اصلی
                </Link>
                <Link
                  href="/categories"
                  className="text-[13.5px] font-bold text-white transition-colors hover:text-brand"
                >
                  دسته‌بندی
                </Link>
                <Link
                  href="/shop"
                  className="text-[13.5px] font-bold text-white transition-colors hover:text-brand"
                >
                  محصولات
                </Link>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>

        {/* Left Area: Action Icons (End in RTL) */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 min-w-[100px] lg:min-w-[130px]">
          <AnimatePresence>
            {showHeaderContent && (
              <motion.div
                className="flex items-center gap-2 sm:gap-3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                {/* Search */}
                <motion.button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="جست‌وجو"
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  className="glass text-ink-1 grid size-10 place-items-center rounded-full lg:size-11 hover:text-white transition-colors"
                >
                  <Search className="size-[18px]" strokeWidth={2.1} />
                </motion.button>

                {/* Cart (Desktop Only - Mobile uses BottomNav) */}
                <motion.button
                  type="button"
                  onClick={() => cart.open()}
                  aria-label="سبد خرید"
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  className="hidden lg:grid glass text-ink-1 size-11 place-items-center rounded-full hover:text-white transition-colors relative"
                >
                  <ShoppingCart className="size-[18px]" strokeWidth={2.1} />
                  {cart.count > 0 && (
                    <span className="bg-brand absolute -top-1 -right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[11px] leading-none font-bold text-white shadow-[0_0_12px_rgba(255,45,60,0.7)]">
                      {cart.count}
                    </span>
                  )}
                </motion.button>

                {/* Profile */}
                <Link href="/account" aria-label="حساب کاربری">
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 500, damping: 28 }}
                    className="glass text-ink-1 grid size-10 place-items-center rounded-full lg:size-11 hover:text-white transition-colors"
                  >
                    <UserRound className="size-[18px]" strokeWidth={2.1} />
                  </motion.div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
