"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";

const RUNTIME = 2.9;

export function CinematicIntro() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/home-test";
  const [phase, setPhase] = useState<"playing" | "flying" | "done">(() =>
    isHome ? "playing" : "done"
  );
  const [flyData, setFlyData] = useState<{
    deltaX: number;
    deltaY: number;
    scale: number;
  } | null>(null);

  useEffect(() => {
    if (!isHome) {
      document.documentElement.setAttribute("data-intro-done", "");
      document.documentElement.setAttribute("data-intro-fly-done", "");
      document.body.style.overflow = "";
      setPhase("done");
      return;
    }

    setPhase("playing");
    setFlyData(null);

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    document.documentElement.removeAttribute("data-intro-done");
    document.documentElement.removeAttribute("data-intro-fly-done");
    const skipped = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!skipped) document.body.style.overflow = "hidden";

    const end = () => {
      // If user has already scrolled down, finish immediately without flying offscreen
      if (typeof window !== "undefined" && window.scrollY > 20) {
        document.documentElement.setAttribute("data-intro-done", "");
        document.documentElement.setAttribute("data-intro-fly-done", "");
        document.body.style.overflow = "";
        setPhase("done");
        return;
      }

      setPhase("flying");
      // Signal hero to show its text content
      document.documentElement.setAttribute("data-intro-done", "");

      // Wait for hero to render & layout, then measure target slot
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const slot = document.querySelector("#hero-logo-slot img");
          const flyingLogo = document.querySelector("[data-flying-logo]");
          if (slot && flyingLogo && window.scrollY <= 20) {
            const targetRect = slot.getBoundingClientRect();
            const startRect = flyingLogo.getBoundingClientRect();

            setFlyData({
              deltaX: targetRect.left + targetRect.width / 2 - (startRect.left + startRect.width / 2),
              deltaY: targetRect.top + targetRect.height / 2 - (startRect.top + startRect.height / 2),
              scale: targetRect.width / startRect.width,
            });
          } else {
            // Fallback — no slot found or scrolled, just finish cleanly
            document.documentElement.setAttribute("data-intro-fly-done", "");
            document.body.style.overflow = "";
            setPhase("done");
          }
        });
      });
    };

    const timer = setTimeout(end, skipped ? 0 : RUNTIME * 1000);

    const skipOnPointer = () => {
      clearTimeout(timer);
      end();
    };
    const skipOnKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" && e.key !== " ") return;
      clearTimeout(timer);
      end();
    };

    const arm = setTimeout(() => {
      window.addEventListener("keydown", skipOnKey);
      window.addEventListener("pointerdown", skipOnPointer);
    }, 800);

    return () => {
      clearTimeout(timer);
      clearTimeout(arm);
      window.removeEventListener("keydown", skipOnKey);
      window.removeEventListener("pointerdown", skipOnPointer);
      document.body.style.overflow = "";
    };
  }, [pathname, isHome]);

  if (!isHome || phase === "done") return null;

  /* ── Phase: flying ─────────────────────────────────────────────────────────
   * Logo stays centered. Once flyData is calculated, it smoothly animates
   * (translate + scale) to the hero heading slot.
   * ──────────────────────────────────────────────────────────────────────── */
  if (phase === "flying") {
    return (
      <div className="pointer-events-none fixed inset-0 z-[201] flex items-center justify-center">
        <div className="relative flex flex-col items-center px-8">
          <motion.div
            data-flying-logo
            className="relative w-[min(74vw,300px)]"
            animate={
              flyData
                ? { x: flyData.deltaX, y: flyData.deltaY, scale: flyData.scale }
                : { x: 0, y: 0, scale: 1 }
            }
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={() => {
              if (flyData) {
                document.documentElement.setAttribute("data-intro-fly-done", "");
                document.body.style.overflow = "";
                setPhase("done");
              }
            }}
          >
            <Image
              src="/logo.png"
              alt="COOL"
              width={868}
              height={336}
              priority
              className="w-full drop-shadow-[0_0_30px_rgba(255,45,60,0.55)]"
            />
          </motion.div>
        </div>
      </div>
    );
  }

  /* ── Phase: playing ────────────────────────────────────────────────────────
   * Full cinematic intro. The overlay (bloom, bars, grain) fades out at the
   * end of RUNTIME. The logo is in a SEPARATE layer (z-201) so it persists
   * after the overlay (z-200) fades to 0.
   * ──────────────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ─ Overlay: background, bloom, bars, grain, vignette — fades out ─ */}
      <motion.div
        data-intro
        className="fixed inset-0 z-[200] overflow-hidden bg-[#040405]"
        animate={{ opacity: [1, 1, 0] }}
        transition={{ times: [0, 0.9, 1], duration: RUNTIME, ease: "easeInOut" }}
      >
        {/* projector bloom */}
        <motion.div
          className="absolute left-1/2 top-1/2 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle,#ff2d3c 0%,transparent 65%)",
            filter: "blur(90px)",
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 0.75, 0.5, 0.9],
            scale: [0.5, 1, 1.05, 1.35],
          }}
          transition={{
            times: [0, 0.32, 0.72, 1],
            duration: RUNTIME,
            ease: "easeOut",
          }}
        />

        {/* letterbox bars */}
        <motion.div
          className="absolute inset-x-0 top-0 bg-black"
          initial={{ height: "50%" }}
          animate={{ height: ["50%", "13%", "13%", "50%"] }}
          transition={{
            times: [0, 0.26, 0.8, 0.95],
            duration: RUNTIME,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
        <motion.div
          className="absolute inset-x-0 bottom-0 bg-black"
          initial={{ height: "50%" }}
          animate={{ height: ["50%", "13%", "13%", "50%"] }}
          transition={{
            times: [0, 0.26, 0.8, 0.95],
            duration: RUNTIME,
            ease: [0.16, 1, 0.3, 1],
          }}
        />

        <div className="film-grain pointer-events-none absolute inset-0 opacity-[0.16]" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(115% 75% at 50% 50%, transparent 40%, rgba(0,0,0,0.85) 100%)",
          }}
        />

        <motion.span
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] text-white/25"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0.8, 0] }}
          transition={{ times: [0, 0.5, 0.7, 0.92], duration: RUNTIME }}
        >
          برای رد شدن لمس کنید
        </motion.span>
      </motion.div>

      {/* ─ Logo layer: above overlay, persists after overlay fades ─ */}
      <div className="pointer-events-none fixed inset-0 z-[201] flex items-center justify-center">
        <div className="relative flex flex-col items-center px-8">
          <motion.div
            data-flying-logo
            className="relative w-[min(74vw,300px)]"
            initial={{ opacity: 0, scale: 1.34, filter: "blur(26px)" }}
            animate={{
              opacity: [0, 1, 1, 1],
              scale: [1.34, 1, 1, 1],
              filter: ["blur(26px)", "blur(0px)", "blur(0px)", "blur(0px)"],
            }}
            transition={{
              times: [0, 0.36, 0.82, 1],
              duration: RUNTIME,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Image
              src="/logo.png"
              alt="COOL"
              width={868}
              height={336}
              priority
              className="w-full drop-shadow-[0_0_30px_rgba(255,45,60,0.55)]"
            />

            {/* specular sweep, masked to the letterforms */}
            <motion.div
              className="pointer-events-none absolute inset-0"
              style={{
                maskImage: "url(/logo.png)",
                WebkitMaskImage: "url(/logo.png)",
                maskSize: "100% 100%",
                WebkitMaskSize: "100% 100%",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                background:
                  "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.9) 50%, transparent 62%)",
              }}
              initial={{ x: "-130%" }}
              animate={{ x: ["-130%", "-130%", "130%"] }}
              transition={{
                times: [0, 0.42, 0.72],
                duration: RUNTIME,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </div>
      </div>
    </>
  );
}
