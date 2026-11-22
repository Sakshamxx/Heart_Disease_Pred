"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  delay?: number;
  float?: number;
  icon: ReactNode;
  value: string;
  label: string;
}

export function FloatingCard({ className, delay = 0, float = 8, icon, value, label }: Props) {
  return (
    <motion.div
      className={cn("absolute", className)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.9 + delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={{ y: [0, -float, 0] }}
        transition={{ duration: 5 + delay * 2, repeat: Infinity, ease: "easeInOut", delay }}
        className="flex items-center gap-3 rounded-xl border border-line bg-surface/90 px-3.5 py-2.5 shadow-soft backdrop-blur-sm"
      >
        <span className="grid size-8 place-items-center rounded-lg bg-blush/70 text-burgundy">{icon}</span>
        <span className="leading-tight">
          <span className="block font-display text-lg font-semibold text-burgundy-deep">{value}</span>
          <span className="block text-[0.7rem] text-ink-2">{label}</span>
        </span>
      </motion.div>
    </motion.div>
  );
}
