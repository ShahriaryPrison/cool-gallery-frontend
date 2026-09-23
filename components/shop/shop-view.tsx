"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, SlidersHorizontal } from "lucide-react";

import { ProductCard } from "@/components/product/product-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CATEGORIES, PRICE_BANDS, PRODUCTS, type Category } from "@/lib/data";
import { toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

const ALL: Category | "همه" = "همه";
const SORTS = [
  { key: "new", label: "جدیدترین" },
  { key: "cheap", label: "ارزان‌ترین" },
  { key: "exp", label: "گران‌ترین" },
  { key: "pop", label: "محبوب‌ترین" },
] as const;

type SortKey = (typeof SORTS)[number]["key"];

export function ShopView({
  initialCategory,
  initialQuery = "",
}: {
  initialCategory: Category | "همه";
  initialQuery?: string;
}) {
  const [cat, setCat] = useState<Category | "همه">(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortKey>("new");
  const [band, setBand] = useState("all");
  const [onlyOff, setOnlyOff] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const items = useMemo(() => {
    const bandDef = PRICE_BANDS.find((b) => b.key === band)!;
    const q = query.trim();
    const filtered = PRODUCTS.filter(
      (p) =>
        (cat === ALL || p.cat === cat) &&
        (!q || p.name.includes(q) || p.cat.includes(q)) &&
        p.price >= bandDef.lo &&
        p.price < bandDef.hi &&
        (!onlyOff || Boolean(p.oldPrice)),
    );
    const sorters: Record<SortKey, (a: (typeof PRODUCTS)[number], b: (typeof PRODUCTS)[number]) => number> = {
      new: (a, b) => PRODUCTS.indexOf(a) - PRODUCTS.indexOf(b),
      cheap: (a, b) => a.price - b.price,
      exp: (a, b) => b.price - a.price,
      pop: (a, b) => b.popularity - a.popularity,
    };
    return [...filtered].sort(sorters[sort]);
  }, [cat, query, sort, band, onlyOff]);

  const activeFilters = band !== "all" || onlyOff;

  return (
    <div className="pt-6 lg:pt-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pb-4 lg:px-12"
      >
        <h1 className="text-[30px] leading-tight font-black text-white lg:text-[42px]">
          {cat === ALL ? "محصولات" : cat}
        </h1>
        <div className="text-ink-4 mt-1.5 text-[12.5px]">{toFaDigits(items.length)} محصول</div>
      </motion.div>

      <div className="px-5 pb-3 lg:px-12">
        <div className="glass flex items-center gap-2.5 rounded-2xl px-3.5 py-3">
          <Search className="text-ink-4 size-[17px] shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جست‌وجوی محصول (مثلاً اژدها، گردنبند، جاکارتی...)"
            className="text-ink-1 placeholder:text-ink-4 flex-1 bg-transparent text-[13.5px] outline-none"
          />
        </div>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-3 lg:flex-wrap lg:justify-center lg:px-12">
        {[ALL, ...CATEGORIES].map((c) => {
          const active = cat === c;
          return (
            <motion.button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
              className={cn(
                "relative shrink-0 rounded-full px-4 py-2.5 text-[12.5px] font-bold whitespace-nowrap",
                active ? "text-white" : "glass text-ink-3",
              )}
            >
              {active && (
                <motion.span
                  layoutId="cat-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="glass-brand absolute inset-0 rounded-full"
                />
              )}
              <span className="relative">{c}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 px-5 pb-4 lg:px-12">
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="glass !h-auto flex-1 rounded-2xl border-transparent px-4 py-3 text-[12.5px]">
            <SelectValue>{(value: SortKey) => SORTS.find((s) => s.key === value)?.label}</SelectValue>
          </SelectTrigger>
          <SelectContent className="glass-panel rounded-2xl">
            {SORTS.map((s) => (
              <SelectItem key={s.key} value={s.key} className="rounded-xl text-[12.5px]">
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <motion.button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-[12.5px] font-bold text-white",
            activeFilters ? "glass-brand" : "glass",
          )}
        >
          <SlidersHorizontal className="size-[15px]" strokeWidth={2.2} />
          فیلتر
          {activeFilters && <span className="bg-brand size-1.5 rounded-full" />}
        </motion.button>
      </div>

      <AnimatePresence initial={false}>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden px-5 lg:px-12"
          >
            <div className="glass mb-4 rounded-3xl p-4">
              <div className="text-ink-4 mb-3 text-[11.5px]">محدوده قیمت</div>
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
                        active ? "glass-brand text-white" : "text-ink-3 bg-white/5",
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
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                  delay: Math.min(i, 7) * 0.055,
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
            className="text-ink-4 px-2.5 py-14 text-center text-[13.5px]"
          >
            محصولی با این مشخصات پیدا نشد. فیلترها را تغییر داده یا دسته‌بندی دیگری را انتخاب کنید.
          </motion.div>
        )}
      </div>
    </div>
  );
}
