"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";

import { ProductCard } from "@/components/product/product-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PRICE_BANDS, type Product } from "@/lib/data";
import { toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

const SORTS = [
  { key: "new", label: "جدیدترین" },
  { key: "cheap", label: "ارزان‌ترین" },
  { key: "exp", label: "گران‌ترین" },
  { key: "pop", label: "محبوب‌ترین" },
] as const;

type SortKey = (typeof SORTS)[number]["key"];

interface ShopViewProps {
  title: string;
  /** The category's intro text from its SEO settings, shown under the title. */
  intro?: string | null;
  initialQuery?: string;
  products?: Product[];
  /** Products in the whole listing, across its pages. */
  total: number;
  /** Category pills: each is a real address (/products, /category/{slug}) search engines can follow. */
  categoryLinks: { label: string; href: string; active: boolean }[];
  pagination?: { page: number; lastPage: number; prevHref: string | null; nextHref: string | null } | null;
}

export function ShopView({
  title,
  intro,
  initialQuery = "",
  products = [],
  total,
  categoryLinks,
  pagination,
}: ShopViewProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortKey>("new");
  const [band, setBand] = useState("all");
  const [onlyOff, setOnlyOff] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const items = useMemo(() => {
    const bandDef = PRICE_BANDS.find((b) => b.key === band) || PRICE_BANDS[0];
    const q = query.trim().toLowerCase();

    const filtered = products.filter((p) => {
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.cat && p.cat.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));
      const matchPrice = p.price >= bandDef.lo && p.price < bandDef.hi;
      const matchDiscount = !onlyOff || Boolean(p.oldPrice && p.oldPrice > p.price);

      return matchQuery && matchPrice && matchDiscount;
    });

    const sorters: Record<SortKey, (a: Product, b: Product) => number> = {
      new: (a, b) => products.indexOf(a) - products.indexOf(b),
      cheap: (a, b) => a.price - b.price,
      exp: (a, b) => b.price - a.price,
      pop: (a, b) => (b.popularity || 0) - (a.popularity || 0),
    };

    return [...filtered].sort(sorters[sort]);
  }, [products, query, sort, band, onlyOff]);

  const activeFilters = band !== "all" || onlyOff;
  // Narrowed on this page only: until then the count is the whole listing's.
  const narrowed = activeFilters || query.trim() !== initialQuery.trim();

  return (
    <div className="pt-6 pb-16 lg:pt-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pb-4 lg:px-12"
      >
        <h1 className="text-[30px] leading-tight font-black text-white lg:text-[42px]">
          {title}
        </h1>
        <div className="text-ink-4 mt-1.5 text-[12.5px]">
          {toFaDigits(narrowed ? items.length : total)} محصول یافت شد
        </div>
        {intro && <p className="text-ink-3 mt-3 max-w-3xl text-[13px] leading-7 whitespace-pre-line">{intro}</p>}
      </motion.div>

      {/* Live Search Input */}
      <div className="px-5 pb-4 max-w-5xl mx-auto">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const q = query.trim();
            router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
          }}
          className="glass flex items-center gap-2.5 rounded-2xl px-4 py-3 border border-white/8 focus-within:border-brand/40 transition-colors"
        >
          <Search className="text-ink-4 size-[17px] shrink-0" />
          <input
            type="search"
            name="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جست‌وجوی محصول (مثلاً انگشتر، کلاه، دستبند، پاد...)"
            className="text-ink-1 placeholder:text-ink-4 flex-1 bg-transparent text-[13.5px] outline-none font-[family-name:var(--font-sans)]"
          />
        </form>
      </div>

      {/* Category Pills Slider */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-4 max-w-5xl mx-auto lg:flex-wrap lg:justify-center">
        {categoryLinks.map((c) => (
          <motion.div
            key={c.href}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            className="shrink-0"
          >
            <Link
              href={c.href}
              aria-current={c.active ? "page" : undefined}
              className={cn(
                "relative block rounded-full px-4 py-2 text-[12.5px] font-bold whitespace-nowrap transition-colors",
                c.active ? "text-white" : "glass text-ink-3 hover:text-white"
              )}
            >
              {c.active && (
                <motion.span
                  layoutId="cat-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="glass-brand absolute inset-0 rounded-full"
                />
              )}
              <span className="relative">{c.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Sort & Filter Controls */}
      <div className="flex items-center justify-between gap-3 px-5 pb-5 max-w-5xl mx-auto">
        <motion.button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-[12.5px] font-bold text-white transition-all",
            activeFilters ? "glass-brand shadow-[0_0_16px_rgba(255,45,60,0.25)]" : "glass"
          )}
        >
          <SlidersHorizontal className="size-[15px]" strokeWidth={2.2} />
          <span>فیلترها</span>
          {activeFilters && <span className="bg-brand size-1.5 rounded-full" />}
        </motion.button>

        <div className="w-[150px] sm:w-[180px]">
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="glass !h-auto w-full rounded-2xl border-transparent px-3.5 py-2.5 text-[12.5px]">
              <SelectValue>
                {(value: SortKey) => SORTS.find((s) => s.key === value)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="glass-panel rounded-2xl">
              {SORTS.map((s) => (
                <SelectItem key={s.key} value={s.key} className="rounded-xl text-[12.5px]">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter Drawer / Expandable Area */}
      <AnimatePresence initial={false}>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden px-5 lg:px-12"
          >
            <div className="glass mb-4 rounded-3xl p-4 border border-white/8">
              <div className="text-ink-4 mb-3 text-[11.5px] font-medium">محدوده قیمت</div>
              <div className="flex flex-wrap gap-2">
                {PRICE_BANDS.map((b) => {
                  const active = band === b.key;
                  return (
                    <motion.button
                      key={b.key}
                      type="button"
                      onClick={() => setBand(b.key)}
                      whileTap={{ scale: 0.94 }}
                      className={cn(
                        "rounded-full px-3.5 py-2 text-[12px] font-bold transition-colors",
                        active ? "glass-brand text-white" : "text-ink-3 bg-white/5"
                      )}
                    >
                      {b.label}
                    </motion.button>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4">
                <span className="text-ink-2 text-[12.5px]">فقط تخفیف‌دارها</span>
                <Switch
                  checked={onlyOff}
                  onCheckedChange={setOnlyOff}
                  className="data-[state=checked]:bg-brand"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      <div className="px-5 lg:px-12">
        <motion.div layout className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          <AnimatePresence mode="popLayout">
            {items.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 26, scale: 0.94, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
                transition={{
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                  delay: Math.min(i, 7) * 0.045,
                }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-ink-4 px-2.5 py-16 text-center text-[13.5px]"
          >
            محصولی با این مشخصات پیدا نشد. فیلترها را تغییر داده یا جست‌وجوی دیگری انجام دهید.
          </motion.div>
        )}

        {pagination && (
          <nav aria-label="صفحه‌بندی" className="mt-10 flex items-center justify-center gap-3 text-[12.5px] font-bold">
            {pagination.prevHref ? (
              <Link href={pagination.prevHref} rel="prev" className="glass flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-white">
                <ChevronRight className="size-4" />
                قبلی
              </Link>
            ) : (
              <span className="glass flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-ink-4 opacity-50">
                <ChevronRight className="size-4" />
                قبلی
              </span>
            )}
            <span className="text-ink-3">
              صفحه {toFaDigits(pagination.page)} از {toFaDigits(pagination.lastPage)}
            </span>
            {pagination.nextHref ? (
              <Link href={pagination.nextHref} rel="next" className="glass flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-white">
                بعدی
                <ChevronLeft className="size-4" />
              </Link>
            ) : (
              <span className="glass flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-ink-4 opacity-50">
                بعدی
                <ChevronLeft className="size-4" />
              </span>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
