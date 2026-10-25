"use client";

import React from "react";
import { motion } from "framer-motion";

const STATS = [
  { value: "1,420+", label: "Consultations completed", note: "Across chronic & acute care" },
  { value: "380+", label: "Verified specialists", note: "NMC credential checked" },
  { value: "18+", label: "Indian states covered", note: "Pan-India digital care" },
  { value: "< 2 min", label: "Average wait time", note: "Direct virtual triage" },
];

export function Stats() {
  return (
    <section className="py-14 sm:py-16 border-b border-border bg-surface-elevated/40">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
              className="text-left"
            >
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-[#006D77] dark:text-[#83C5BE]">
                {stat.value}
              </div>
              <div className="mt-1.5 text-sm font-semibold text-foreground">
                {stat.label}
              </div>
              <div className="mt-0.5 text-xs text-muted">
                {stat.note}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
