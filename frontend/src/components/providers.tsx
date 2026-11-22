"use client";

import { MotionConfig } from "motion/react";
import { SmoothScroll } from "@/components/smooth-scroll";

export function Providers({ children }: { children: React.ReactNode }) {
  // reducedMotion="user": Motion drops transform animations when the OS asks for less motion.
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>{children}</SmoothScroll>
    </MotionConfig>
  );
}
