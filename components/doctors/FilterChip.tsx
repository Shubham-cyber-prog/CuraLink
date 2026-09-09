"use client";

import { motion } from "framer-motion";

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  id?: string;
}

export function FilterChip({ label, active, onClick, id }: FilterChipProps) {
  return (
    <motion.button
      id={id}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500/30 cursor-pointer ${
        active
          ? "bg-teal-700 dark:bg-teal-600 text-white shadow-sm shadow-teal-700/25 dark:shadow-teal-950/40"
          : "border border-slate-200 dark:border-[#263049] bg-white dark:bg-[#1C2338] text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-[#263049] dark:hover:text-[#F1F5F9]"
      }`}
    >
      {label}
    </motion.button>
  );
}
