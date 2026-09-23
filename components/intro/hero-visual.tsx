"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef } from "react";

import { HeroHotspots } from "@/components/intro/hero-hotspots";
import { HeroScanner } from "@/components/intro/hero-scanner";

export function HeroVisual({ introDone }: { introDone: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax mouse tracking
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 30, damping: 25, mass: 1 });
  const springY = useSpring(rawY, { stiffness: 30, damping: 25, mass: 1 });

  // Image shifts opposite to create depth
  const imgX = useTransform(springX, [-1, 1], [12, -12]);
  const imgY = useTransform(springY, [-1, 1], [8, -8]);

  // Glow shifts even more
  const glowX = useTransform(springX, [-1, 1], [30, -30]);
  const glowY = useTransform(springY, [-1, 1], [22, -22]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      rawX.set(((e.clientX - w / 2) / (w / 2)));
      rawY.set(((e.clientY - h / 2) / (h / 2)));
    };

    const onLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };

    // Mobile: gyroscope tilt
    const onOrientation = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma ?? 0;
      const beta = e.beta ?? 0;
      rawX.set(Math.max(-1, Math.min(1, gamma / 25)));
      rawY.set(Math.max(-1, Math.min(1, (beta - 50) / 25)));
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("deviceorientation", onOrientation, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("deviceorientation", onOrientation);
    };
  }, [rawX, rawY]);

  return (
    <motion.div
      ref={containerRef}
      className="absolute inset-0 lg:relative lg:order-last lg:h-[78%] lg:w-[46%] lg:shrink-0 lg:overflow-hidden lg:rounded-[32px] lg:border lg:border-white/10 lg:shadow-[0_0_50px_rgba(255,45,60,0.18)]"
      initial={{ scale: 1.14 }}
      animate={introDone ? { scale: 1 } : { scale: 1.14 }}
      transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Base image — shifts with parallax */}
      <motion.div className="absolute inset-0" style={{ x: imgX, y: imgY }}>
        <Image
          src="/hero-bg.webp"
          alt="COOL Gallery Accessories"
          fill
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          className="object-cover object-[50%_40%] scale-[1.08]"
        />
      </motion.div>

      {/* Cyber laser scan beam & interactive spotlight */}
      <HeroScanner introDone={introDone} />

      {/* Interactive 3D Lookbook Hotspot Pins */}
      <HeroHotspots introDone={introDone} />

      {/* One soft backlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-screen"
        style={{ x: glowX, y: glowY }}
        aria-hidden
      >
        <div
          className="animate-neon-flicker absolute top-[22%] left-1/2 size-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,45,60,0.26) 0%, rgba(255,45,60,0.08) 45%, transparent 70%)",
            filter: "blur(45px)",
          }}
        />
      </motion.div>

      {/* Vignette & Contrast Overlay */}
      {/* Mobile: smooth dark gradient at bottom for text contrast */}
      <div
        className="pointer-events-none absolute inset-0 lg:hidden"
        style={{
          background:
            "linear-gradient(to top, #08080a 6%, rgba(8,8,10,0.85) 32%, rgba(8,8,10,0.2) 58%, transparent 75%)",
        }}
        aria-hidden
      />

      {/* Desktop: subtle inner shadow / glass edge */}
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 55%, rgba(5,5,6,0.5) 100%), linear-gradient(to top, rgba(8,8,10,0.4) 0%, transparent 40%)",
          boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.15), inset 0 0 30px rgba(0,0,0,0.6)",
        }}
        aria-hidden
      />
    </motion.div>
  );
}
