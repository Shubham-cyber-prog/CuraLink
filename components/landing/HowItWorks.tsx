"use client";

import { Search, Calendar, Stethoscope, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const STEPS = [
  {
    number: "01",
    icon: Search,
    title: "Find your doctor",
    description: "Search by clinical specialty, verified availability, and consultation type.",
  },
  {
    number: "02",
    icon: Calendar,
    title: "Book your visit",
    description: "Choose a convenient date and time with transparent fees and immediate confirmation.",
  },
  {
    number: "03",
    icon: Stethoscope,
    title: "Get care",
    description: "Meet your doctor online via secure video or in person for diagnosis and treatment plans.",
  },
] as const;

export function HowItWorks() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
      id="how-it-works"
      className="px-4 sm:px-6 py-16 sm:py-20 bg-[#F5F7F6] dark:bg-[#0B1120] border-b border-[#E2E8F0] dark:border-slate-800"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mb-12 max-w-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0D9488] dark:text-[#14B8A6]">
            How It Works
          </span>
          <h2
            id="how-it-works-heading"
            className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
          >
            Three steps to better care
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            A simple, dignified patient journey designed to remove bureaucracy and waiting rooms.
          </p>
        </div>

        {/* 3 Steps Grid */}
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={containerVariants}
        >
          {STEPS.map((step) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="relative flex flex-col justify-between rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#151B2E] p-6 shadow-2xs transition-all hover:border-[#0D9488]/40"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold tracking-widest text-[#0D9488] dark:text-[#14B8A6] font-mono">
                    {step.number}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] dark:text-[#14B8A6] border border-teal-100 dark:border-teal-900/50">
                    <step.icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                </div>

                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
