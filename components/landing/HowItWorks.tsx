"use client";

import { motion } from "framer-motion";
import { staggerGrid, cardReveal, scaleIn } from "@/components/motion/variants";

const STEPS = [
  {
    step: 1,
    title: "Describe your symptoms",
    description:
      "Tell our AI what you're experiencing — in your own words, any time of day. No medical jargon required.",
  },
  {
    step: 2,
    title: "Get matched with a doctor",
    description:
      "Based on your symptoms and preferences, CuraLink surfaces licensed specialists who are available now.",
  },
  {
    step: 3,
    title: "Chat and book instantly",
    description:
      "Confirm a slot, join a secure consultation, and receive professional guidance within minutes.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-white/60 dark:bg-[#0f172a]/60 px-6 py-20 sm:py-24"
      aria-labelledby="steps-heading"
    >
      <motion.div
        className="mx-auto max-w-6xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={staggerGrid}
      >
        <div className="mb-14 max-w-xl">
          <motion.p
            className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-400"
            variants={cardReveal}
          >
            The process
          </motion.p>
          <motion.h2
            id="steps-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-4xl"
            variants={cardReveal}
          >
            Three steps to better care
          </motion.h2>
        </div>

        <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((item) => (
            <motion.li key={item.step} className="flex flex-col gap-3" variants={cardReveal}>
              <motion.span
                aria-hidden="true"
                className="font-display text-5xl text-teal-200 dark:text-teal-800"
                variants={scaleIn}
              >
                {String(item.step).padStart(2, "0")}
              </motion.span>
              <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{item.description}</p>
            </motion.li>
          ))}
        </ol>

      </motion.div>
    </section>
  );
}
