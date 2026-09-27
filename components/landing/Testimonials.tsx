"use client";

import { Quote, Star } from "lucide-react";
import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    quote:
      "I needed a routine medical follow-up after work. Booking took less than a minute, and the video consultation was thorough, clear, and reassuring.",
    name: "Priya S.",
    role: "Patient · General Consultation",
    rating: 5,
  },
  {
    quote:
      "Having all my prescriptions and past consultation notes in one secure vault makes managing my family's ongoing care completely stress-free.",
    name: "Rahul M.",
    role: "Patient · Family Care",
    rating: 5,
  },
  {
    quote:
      "As a clinician, CuraLink provides structured symptom context before each call, allowing me to focus directly on patient diagnosis and treatment.",
    name: "Dr. Ananya Sen, MD",
    role: "Pediatrician · Verified Physician",
    rating: 5,
  },
] as const;

export function Testimonials() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  };

  return (
    <section
      id="stories"
      className="px-4 sm:px-6 py-20 bg-white dark:bg-[#0B1120] border-b border-[#E2E8F0] dark:border-slate-800"
      aria-labelledby="stories-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0D9488] dark:text-[#14B8A6]">
            Patient & Clinician Stories
          </span>
          <h2
            id="stories-heading"
            className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-white"
          >
            Care that feels human, not rushed.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Real experiences from patients receiving timely attention and physicians practicing medicine with calm focus.
          </p>
        </div>

        <motion.div
          className="grid gap-6 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={containerVariants}
        >
          {TESTIMONIALS.map((item) => (
            <motion.figure
              key={item.name}
              className="flex flex-col justify-between rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-[#FAFAFA] dark:bg-slate-900/60 p-6 shadow-2xs hover:shadow-xs transition-shadow"
              variants={itemVariants}
            >
              <div>
                <div className="flex items-center gap-1 mb-3 text-amber-500">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500 stroke-amber-500" />
                  ))}
                </div>
                <blockquote className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
              </div>

              <figcaption className="mt-6 border-t border-slate-200/80 dark:border-slate-800/80 pt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#0F172A] dark:text-white">{item.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
