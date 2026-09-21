"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/components/motion/variants";

export function ForDoctors() {
  return (
    <section id="for-doctors" className="px-6 py-16" aria-labelledby="doctors-heading">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 rounded-2xl border border-slate-200/80 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] px-8 py-10 shadow-sm md:flex-row md:items-center">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-400">Clinicians</p>
            <h2 id="doctors-heading" className="mt-3 text-2xl tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Practice on a calendar you control
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Join a network that sends you prepared patients, not empty inboxes. CuraLink is built
              for licensed doctors who want telehealth without the noise.
            </p>
          </div>
          <Link
            href="/register"
            target="_self"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:hover:bg-slate-100"
          >
            Apply as a doctor
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
