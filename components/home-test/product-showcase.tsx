"use client";

import { motion, type MotionValue, useScroll, useTransform, useSpring, useMotionValueEvent } from "motion/react";
import { useRef, useState } from "react";
import Image from "next/image";
import { getBestSellers } from "@/lib/data";
import { formatToman } from "@/lib/format";
import { ArrowLeft } from "lucide-react";

// همان پالت برند دسکتاپ (Theatrical Split-Screen) برای هویت بصری یکپارچه بین دو بریک‌پوینت
const THEMES = [
  { accent: "#ff2d3c", glow: "rgba(255,45,60,0.32)" },
  { accent: "#3b82f6", glow: "rgba(59,130,246,0.28)" },
  { accent: "#f59e0b", glow: "rgba(245,158,11,0.28)" },
  { accent: "#10b981", glow: "rgba(16,185,129,0.28)" },
];

const COUNTER = ["01", "02", "03", "04"];

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function ProductShowcase() {
  const products = getBestSellers(4);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIdx, setCurrentIdx] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const step = products.length > 1 ? 1 / (products.length - 1) : 1;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const idx = Math.min(products.length - 1, Math.max(0, Math.round(latest / step)));
    if (idx !== currentIdx) {
      setCurrentIdx(idx);
    }
  });

  // قفل مغناطیسی به همراه اسپرینگ سریع و نرم برای جلوگیری از تداخل محصولات در اسکرول سریع
  const steppedProgress = useTransform(scrollYProgress, (v) => {
    return Math.min(1, Math.max(0, Math.round(v / step) * step));
  });

  const smoothProgress = useSpring(steppedProgress, {
    stiffness: 140,
    damping: 24,
    restDelta: 0.001,
  });

  const theme = THEMES[currentIdx % THEMES.length];

  return (
    <section
      ref={containerRef}
      id="products"
      className="relative w-full border-y border-white/5 bg-surface-0"
      style={{ height: `${products.length * 90}vh` }}
    >
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden bg-surface-0">
        {/* پس‌زمینه‌های محو شونده هر محصول */}
        {products.map((_, i) => {
          const ranges = getFadeRanges(i, products.length, step);
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const bgOpacity = useTransform(smoothProgress, ranges.inputs, ranges.opacity);
          const t = THEMES[i % THEMES.length];

          return (
            <motion.div
              key={`bg-${i}`}
              className="absolute inset-0 z-0"
              style={{
                opacity: bgOpacity,
                background: `radial-gradient(circle at 50% 38%, ${t.glow} 0%, #050506 65%)`,
              }}
            />
          );
        })}

        {/* نوارهای پرفوراسیون نوار فیلم — بالا و پایین */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-5 film-strip-border z-30 opacity-40" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-5 film-strip-border z-30 opacity-40" />

        {/* افکت اسکن‌لاین CRT */}
        <div className="pointer-events-none absolute inset-0 z-20 scanline-overlay opacity-20" />

        {/* لرزش نور آپارات */}
        <div className="pointer-events-none absolute inset-0 z-20 animate-film-flicker opacity-[0.03] bg-white" />

        {/* برچسب ثابت بالا */}
        <div className="absolute top-8 left-0 right-0 text-center z-20 px-6 pointer-events-none">
          <span className="cinematic-counter text-white/35 text-[10px] font-semibold tracking-[0.35em] uppercase">
            کالکشن ویژه
          </span>
        </div>

        {/* نور نقطه‌ای متحرک پشت صحنه، هم‌رنگ محصول فعال */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 h-[55%] z-0"
          animate={{
            background: `radial-gradient(ellipse 70% 60% at 50% 20%, ${theme.glow} 0%, transparent 70%)`,
          }}
          transition={{ duration: 0.8 }}
        />

        {products.map((product, i) => (
          <ProductFrame
            key={product.id}
            product={product}
            index={i}
            currentIdx={currentIdx}
            total={products.length}
            progress={smoothProgress}
            step={step}
            counter={COUNTER[i] ?? String(i + 1).padStart(2, "0")}
          />
        ))}
      </div>
    </section>
  );
}

function getFadeRanges(index: number, total: number, step: number) {
  const peak = index * step;
  if (total <= 1) return { inputs: [0, 1] as number[], opacity: [1, 1] as number[] };

  if (index === 0) {
    return { inputs: [peak, peak + step], opacity: [1, 0] };
  }
  if (index === total - 1) {
    return { inputs: [peak - step, peak], opacity: [0, 1] };
  }
  return { inputs: [peak - step, peak, peak + step], opacity: [0, 1, 0] };
}

function ProductFrame({
  product,
  index,
  currentIdx,
  total,
  progress,
  step,
  counter,
}: {
  product: ReturnType<typeof getBestSellers>[number];
  index: number;
  currentIdx: number;
  total: number;
  progress: MotionValue<number>;
  step: number;
  counter: string;
}) {
  // ایزولاسیون رندر: فقط فریم فعلی و مجاور اجازه رندر دارند
  const isAdjacent = Math.abs(index - currentIdx) <= 1;
  const peak = index * step;

  // فاصله نرمال‌شده نسبت به فریم فعال: -1 (قبل) .. 0 (فعال) .. 1 (بعد)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const dc = useTransform(progress, (v) => clamp((v - peak) / step, -1, 1));

  // ترنزیشن پرده‌ای عمودی (Curtain Wipe) — سینماتیک و مناسب اسکرول لمسی
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const imgClip = useTransform(dc, (d) =>
    d <= 0 ? `inset(0% 0% ${-d * 100}% 0%)` : `inset(${d * 100}% 0% 0% 0%)`
  );
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const imgScale = useTransform(dc, (d) => 1 - Math.abs(d) * 0.05);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const textOpacity = useTransform(dc, (d) => 1 - Math.abs(d));
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const titleY = useTransform(dc, (d) => `${d * -8}vh`);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const descY = useTransform(dc, (d) => `${d * -14}vh`);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const btnY = useTransform(dc, (d) => `${d * -20}vh`);

  if (!isAdjacent) return null;

  return (
    <motion.div className="absolute inset-0 flex items-center justify-center w-full h-full z-10 pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-center justify-start h-full w-full max-w-[1400px] mx-auto px-6 pt-32 pb-24 gap-2">
        {/* واترمارک شماره فریم */}
        <motion.span
          style={{ opacity: textOpacity }}
          className="pointer-events-none absolute top-[14%] left-1/2 -translate-x-1/2 text-[26vw] font-black text-white/[0.05] select-none cinematic-counter z-0 leading-none"
        >
          {counter}
        </motion.span>

        {/* تصویر محصول با ترنزیشن پرده‌ای */}
        <motion.div
          style={{ clipPath: imgClip, scale: imgScale }}
          className="relative w-full h-[40%] flex items-center justify-center shrink-0 origin-center z-10"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
          />
          {product.badge && (
            <span className="absolute top-0 right-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-medium px-3 py-1.5 rounded-full shadow-2xl">
              {product.badge}
            </span>
          )}
        </motion.div>

        {/* محتوای متنی - با افکت آبشاری */}
        <div className="w-full h-[60%] flex flex-col justify-start text-center pb-4 overflow-visible z-10">
          <motion.div style={{ y: titleY, opacity: textOpacity }}>
            <span className="cinematic-counter inline-flex items-center gap-2 text-white/40 text-[10px] tracking-[0.25em] uppercase mb-2">
              FRAME {counter}/{COUNTER[total - 1] ?? String(total).padStart(2, "0")}
              <span className="h-px w-4 bg-white/20" />
              {product.cat}
            </span>
            <h3 className="text-2xl font-extrabold text-white leading-tight mb-2 drop-shadow-lg line-clamp-2">
              {product.name}
            </h3>
          </motion.div>

          <motion.div style={{ y: descY, opacity: textOpacity }}>
            <p className="text-white/70 text-xs leading-relaxed line-clamp-3 mb-4 max-w-xl mx-auto">
              {product.description}
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 mb-4">
              {product.specs &&
                product.specs.slice(0, 3).map((spec, idx) => (
                  <div
                    key={idx}
                    className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-[10px] text-white"
                  >
                    <span className="text-white/50 ml-1">{spec.k}:</span>
                    <span className="font-semibold">{spec.v}</span>
                  </div>
                ))}
            </div>
          </motion.div>

          <motion.div
            style={{ y: btnY, opacity: textOpacity }}
            className="mt-auto pt-3 border-t border-white/10 flex flex-row items-center justify-between gap-4"
          >
            <div className="flex flex-col text-right">
              {product.oldPrice && (
                <span className="text-white/50 line-through text-[10px] mb-0.5">
                  {formatToman(product.oldPrice)}
                </span>
              )}
              <span className="text-xl font-bold text-white drop-shadow-md">
                {formatToman(product.price)}
              </span>
            </div>

            <a
              href={`/product/${product.id}`}
              className="bg-white text-black shrink-0 inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold transition-transform hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
            >
              خرید
              <ArrowLeft className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
