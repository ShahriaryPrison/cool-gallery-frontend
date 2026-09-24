"use client";

import { motion, useScroll } from "motion/react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[100] origin-left pointer-events-none"
      style={{
        scaleX: scrollYProgress,
        background:
          "linear-gradient(90deg, #ff2d3c 0%, #ff6b74 50%, #ff2d3c 100%)",
        boxShadow: "0 0 10px rgba(255,45,60,0.5)",
      }}
    />
  );
}
