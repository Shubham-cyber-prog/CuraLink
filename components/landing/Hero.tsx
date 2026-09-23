"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Stethoscope, Activity, CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductMock } from "./ProductMock";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section
      aria-label="CuraLink healthcare platform"
      className="relative overflow-hidden px-4 sm:px-6 pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24 bg-[#FAFAFA] dark:bg-[#0F172A] border-b border-slate-200/70 dark:border-slate-800/80 transition-colors duration-200"
    >
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        {/* Left Column: Headline, Copy & Actions */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-xl"
        >
          {/* Clinical Assurance Pill */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/90 dark:border-teal-800/60 bg-teal-50/80 dark:bg-teal-950/40 px-3.5 py-1 text-xs font-semibold text-[#0F766E] dark:text-teal-300 shadow-2xs">
              <ShieldCheck className="h-3.5 w-3.5 text-[#0D9488]" aria-hidden="true" />
              <span>Verified Doctors · Modern Telehealth Platform</span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="mt-5 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-[3.25rem] leading-[1.12]"
          >
            Care that feels <span className="text-[#0D9488] dark:text-[#14B8A6] font-normal italic font-serif">calm</span>,
            <br />
            not like a waiting room.
          </motion.h1>

          {/* Supporting Copy */}
          <motion.p
            variants={itemVariants}
            className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300"
          >
            Connect directly with verified medical doctors for video consultations, clinical triage, and same-day electronic prescriptions from your phone or desk.
          </motion.p>

          {/* Primary & Secondary CTAs */}
          <motion.div
            variants={itemVariants}
            className="mt-7 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <Link
              href="/find-doctor"
              className={cn(
                buttonVariants({ size: "lg" }),
                "inline-flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-xs rounded-xl"
              )}
            >
              <Stethoscope className="h-4 w-4" />
              <span>Find a Doctor</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <Link
              href="/symptom-checker"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "inline-flex items-center justify-center gap-2 rounded-xl border-slate-300 text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              )}
            >
              <Activity className="h-4 w-4 text-[#0D9488]" />
              <span>Check Symptoms</span>
            </Link>
          </motion.div>

          {/* Metadata Highlights */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-wrap items-center gap-y-2 gap-x-6 pt-6 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Licensed Physicians Only</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Encrypted Video Consultations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Immediate Slot Booking</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Clinical Interaction Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
          className="w-full flex justify-center lg:justify-end"
        >
          <ProductMock />
        </motion.div>
      </div>
    </section>
  );
}
