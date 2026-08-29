"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { calmTransition } from "./variants";

interface MotionButtonProps {
  children: ReactNode;
  className?: string;
}

export function MotionButton({ children, className }: MotionButtonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      transition={calmTransition}
      whileHover={reduceMotion ? undefined : { y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
    >
      {children}
    </motion.div>
  );
}
