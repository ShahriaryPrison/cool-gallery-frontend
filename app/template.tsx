"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      // No opacity fade: server HTML must be visible before hydration (LCP, crawlers)
      initial={{ y: 12 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.36, ease: [0.32, 0.72, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}
