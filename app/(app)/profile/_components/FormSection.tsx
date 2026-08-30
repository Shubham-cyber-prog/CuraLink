"use client";

import { motion } from "framer-motion";
import { cardReveal } from "@/components/motion/variants";
import React from "react";

export function FormSection({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      variants={cardReveal}
      className={`rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-900/5 ${className}`}
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {children}
    </motion.section>
  );
}
