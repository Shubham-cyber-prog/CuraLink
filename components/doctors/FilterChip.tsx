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
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 ${
        active
          ? "bg-teal-700 text-white shadow-sm shadow-teal-700/25"
          : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {label}
    </motion.button>
  );
}
