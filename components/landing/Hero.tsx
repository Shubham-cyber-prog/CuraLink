"use client";

import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { MotionButton } from "@/components/motion/MotionButton";
import {
  getMotionVariants,
  blurFadeIn,
  floatingSlow,
  glowPulse,
  staggerContainer,
  fadeInUp,
} from "@/components/motion/variants";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductMock } from "./ProductMock";

export function Hero() {
  const variants = getMotionVariants(false);

  return (
    <motion.section
      aria-label="CuraLink healthcare platform"
      className="relative overflow-hidden px-6 pb-20 pt-28 sm:pt-32 lg:pb-28"
      initial="hidden"
      animate="visible"
      variants={variants.page}
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.035]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          className="max-w-xl"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 dark:border-teal-800/40 bg-teal-50 dark:bg-teal-950/40 px-3 py-1 text-xs font-medium text-teal-800 dark:text-teal-300 shadow-sm"
            variants={fadeInUp}
          >
            <Shield className="h-3.5 w-3.5" aria-hidden="true" />
            HIPAA-aligned care, built for real clinics
          </motion.div>

          <motion.h1
            className="mt-6 text-4xl font-normal leading-[1.08] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-[3.5rem]"
            variants={blurFadeIn}
          >
            Care that feels <span className="font-display italic text-teal-700 dark:text-teal-400">calm</span>
            <span className="text-slate-400">,</span>
            <br />
            not like a waiting room.
          </motion.h1>

          <motion.p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg" variants={fadeInUp}>
            Describe symptoms in plain language, get AI-guided triage, and sit down with a licensed doctor in
            minutes from a phone or a desk.
          </motion.p>

          <motion.div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" variants={fadeInUp}>
            <MotionButton className="w-full sm:w-auto">
              <Link
                href="/register"
                target="_self"
                className={cn(
                  buttonVariants({ size: "default" }),
                  "w-full shadow-lg shadow-teal-700/20 hover:shadow-xl sm:w-auto inline-flex items-center justify-center gap-2"
                )}
              >
                Start a visit
                <ArrowRight aria-hidden="true" />
              </Link>
            </MotionButton>
            <MotionButton className="w-full sm:w-auto">
              <Link
                href="#how-it-works"
                target="_self"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full sm:w-auto inline-flex items-center justify-center"
                )}
              >
                See the flow
              </Link>
            </MotionButton>
          </motion.div>

          <motion.p className="mt-4 text-xs text-slate-500 dark:text-slate-500" variants={fadeInUp}>
            No insurance required · Average wait under 5 minutes
          </motion.p>
        </motion.div>

        <motion.div variants={variants.card}>
          <ProductMock reduceMotion={false} />
        </motion.div>
      </div>
    </motion.section>
  );
}
