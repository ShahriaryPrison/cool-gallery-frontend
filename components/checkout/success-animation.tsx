"use client";

import { motion } from "motion/react";

export function SuccessAnimation() {
  return (
    <div className="relative mx-auto grid size-24 place-items-center">
      {[0, 1].map((ring) => (
        <motion.span
          key={ring}
          className="border-brand absolute inset-0 rounded-full border"
          initial={{ scale: 0.6, opacity: 0.7 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity, delay: ring * 1, ease: "easeOut" }}
        />
      ))}

      <motion.span
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 18 }}
        className="glass-brand grid size-20 place-items-center rounded-full"
      >
        <svg viewBox="0 0 24 24" fill="none" className="size-9">
          <motion.path
            d="M5 12.5L10 17.5L19 7"
            stroke="white"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
          />
        </svg>
      </motion.span>
    </div>
  );
}
