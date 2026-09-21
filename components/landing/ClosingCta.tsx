"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/components/motion/variants";

export function ClosingCta() {
  return (
    <section className="px-6 py-20 sm:py-28" aria-label="Call to action">
      <motion.div
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] bg-[#085041] border border-teal-800/60 p-8 text-white sm:p-14"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200/90">
              Get Started
            </span>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl text-white">
              Ready to skip the waiting room?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-teal-100/80 sm:text-base">
              One account connects you with AI-guided triage, appointment scheduling, and secure telehealth visits with licensed doctors.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-teal-200/80">
              <ShieldCheck className="h-4 w-4 text-teal-300" />
              <span>HIPAA-aligned · Encrypted consultations · No insurance required</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start gap-3 shrink-0">
            <Link
              href="/register"
              target="_self"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#085041] shadow-md transition-all hover:bg-teal-50"
            >
              Create your account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-xs text-teal-200/70">Average setup takes under 2 minutes</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
