"use client";

import { Bot, CalendarCheck, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { staggerGrid, cardReveal, cardHover } from "@/components/motion/variants";

const FEATURES = [
  {
    icon: Bot,
    title: "AI symptom checker",
    description:
      "Describe what you're feeling in plain language. Our AI offers informed, preliminary guidance before you speak with a doctor.",
  },
  {
    icon: CalendarCheck,
    title: "Instant doctor booking",
    description:
      "Browse verified, licensed clinicians by specialty and availability. Confirm an appointment in under a minute.",
  },
  {
    icon: MessageCircle,
    title: "Secure consultation chat",
    description:
      "Meet your doctor in a real-time, encrypted chat. Share notes or images and get professional advice from anywhere.",
  },
] as const;

export function Features() {
  return (
    <section id="features" className="px-6 py-20 sm:py-24" aria-labelledby="features-heading">
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
            What we offer
          </motion.p>
          <motion.h2
            id="features-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-4xl"
            variants={cardReveal}
          >
            Everything you need for modern care
          </motion.h2>
          <motion.p
            className="mt-3 text-base leading-relaxed text-slate-500 dark:text-slate-400"
            variants={cardReveal}
          >
            Three focused tools — designed to remove friction between you and a licensed clinician.
          </motion.p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                variants={cardReveal}
                whileHover={cardHover}
                className="group flex flex-col gap-4 rounded-2xl border border-slate-100 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] p-7 shadow-sm transition-all duration-300 hover:border-teal-200 dark:hover:border-teal-800/40 hover:shadow-lg dark:hover:shadow-teal-950/20"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 transition-colors duration-200 group-hover:bg-[#085041] group-hover:text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{feature.description}</p>
              </motion.article>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
