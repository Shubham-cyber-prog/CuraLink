"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { calmTransition } from "./variants";

interface MotionButtonProps {
  children: ReactNode;
  className?: string;
}

export function MotionButton({ children, className }: MotionButtonProps) {
  return (
    <motion.div
      className={className}
      transition={calmTransition}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.div>
  );
}
