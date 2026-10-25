"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageSquareText, CalendarCheck, Video, FileCheck2 } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: MessageSquareText,
    title: "Describe your symptoms",
    description:
      "Share your health concerns in plain words. Our clinical triage organizes your background and highlights urgency.",
  },
  {
    step: "02",
    icon: CalendarCheck,
    title: "Select your specialist",
    description:
      "Browse verified doctors by specialty, credentials, and fees. Pick a same-day or convenient future time slot.",
  },
  {
    step: "03",
    icon: Video,
    title: "Consult via HD video",
    description:
      "Join your encrypted video call directly in your browser. No downloads or setup required.",
  },
  {
    step: "04",
    icon: FileCheck2,
    title: "Receive your prescription",
    description:
      "Get a signed digital prescription PDF instantly to share with your pharmacy, plus follow-up guidance.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-24 border-b border-border bg-surface-elevated/40">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#006D77]">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            From symptoms to care in minutes.
          </h2>
          <p className="mt-3 text-base text-muted leading-relaxed">
            A simple, predictable consultation experience designed to respect your time.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
              className="rounded-2xl border border-border bg-surface p-6 space-y-4 hover:border-[#83C5BE]/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-[#006D77]/10 text-[#006D77] flex items-center justify-center">
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs font-bold text-muted">
                  STEP {step.step}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
