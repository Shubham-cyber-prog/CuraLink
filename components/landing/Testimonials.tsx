"use client";

import { Quote } from "lucide-react";
import { motion } from "framer-motion";
import { staggerGrid, cardReveal, cardHover } from "@/components/motion/variants";

const TESTIMONIALS = [
  {
    quote:
      "I described a lingering cough at 11pm and was talking to a GP before midnight. The whole flow felt calm, not clinical.",
    name: "Priya S.",
    role: "Patient · Bengaluru",
  },
  {
    quote:
      "Booking used to mean a phone tree. Now I pick a slot, pay later, and keep the visit notes in one place.",
    name: "Marcus T.",
    role: "Patient · Chicago",
  },
  {
    quote:
      "Placeholder quote from a clinician. We'll replace these with verified reviews once the first cohort is live.",
    name: "Dr. Amara Rao",
    role: "Family medicine · coming soon",
  },
] as const;

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="px-6 py-20 sm:py-24"
      aria-labelledby="testimonials-heading"
    >
      <motion.div
        className="mx-auto max-w-6xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={staggerGrid}
      >
        <div className="mb-12 max-w-xl">
          <motion.p
            className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-400"
            variants={cardReveal}
          >
            Stories
          </motion.p>
          <motion.h2
            id="testimonials-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-4xl"
            variants={cardReveal}
          >
            Care that feels human
          </motion.h2>
          <motion.p className="mt-3 text-sm text-slate-500 dark:text-slate-400" variants={cardReveal}>
            Trusted experiences from patients and clinicians across primary and urgent care.
          </motion.p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <motion.figure
              key={item.name}
              className="flex flex-col rounded-2xl border border-slate-100 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] p-6 shadow-sm transition-shadow hover:shadow-lg dark:hover:shadow-teal-950/20"
              variants={cardReveal}
              whileHover={cardHover}
            >
              <Quote className="h-5 w-5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {item.quote}
              </blockquote>
              <figcaption className="mt-6 border-t border-slate-100 dark:border-[#1e293b] pt-4">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.role}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
