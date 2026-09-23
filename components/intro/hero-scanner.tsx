"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { Scan, Eye } from "lucide-react";

export function HeroScanner({ introDone }: { introDone: boolean }) {
  const [scanning, setScanning] = useState(false);
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const smoothX = useSpring(pointerX, { stiffness: 45, damping: 25 });
  const smoothY = useSpring(pointerY, { stiffness: 45, damping: 25 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      pointerX.set(Math.max(0, Math.min(100, x)));
      pointerY.set(Math.max(0, Math.min(100, y)));
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [pointerX, pointerY]);

  if (!introDone) return null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
      aria-hidden
    >
      {/* Interactive Torch Light / Flashlight Cone that tracks cursor */}
      <motion.div
        className="absolute size-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 mix-blend-screen pointer-events-none"
        style={{
          left: `${smoothX.get()}%`,
          top: `${smoothY.get()}%`,
          background:
            "radial-gradient(circle, rgba(255,45,60,0.3) 0%, rgba(255,45,60,0.08) 50%, transparent 75%)",
          filter: "blur(30px)",
        }}
      />

      {/* Soft interactive subtle ambient overlay */}

      {/* Subtle Scanline Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}
