"use client";

import { motion } from "framer-motion";
import { staggerGrid, cardReveal } from "@/components/motion/variants";

const STATS = [
  { value: "10k+", label: "Patients served" },
  { value: "500+", label: "Licensed clinicians" },
  { value: "<5 min", label: "Typical wait" },
  { value: "24/7", label: "AI triage" },
];

export function Stats() {
  return (
    <section className="px-6" aria-label="Platform statistics">
      <motion.div
        className="mx-auto grid max-w-6xl grid-cols-2 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] shadow-sm sm:grid-cols-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerGrid}
      >
        {STATS.map((item, i) => (
          <motion.div
            key={item.label}
            variants={cardReveal}
            className={`px-6 py-8 text-center ${i !== 0 ? "border-t border-slate-100 dark:border-[#1e293b] sm:border-l sm:border-t-0" : ""}`}
          >
            <p className="font-display text-3xl text-slate-900 dark:text-white">{item.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              {item.label}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
