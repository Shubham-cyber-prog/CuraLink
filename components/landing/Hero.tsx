"use client";

import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { MotionButton } from "@/components/motion/MotionButton";
import { getMotionVariants } from "@/components/motion/variants";
import { Button } from "@/components/ui/button";
import { ProductMock } from "./ProductMock";

export function Hero() {
  const reduceMotion = Boolean(useReducedMotion());
  const variants = getMotionVariants(reduceMotion);

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
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-teal-300/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div className="max-w-xl" variants={variants.container}>
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-white/70 px-3 py-1 text-xs font-medium text-teal-800 shadow-sm backdrop-blur"
            variants={variants.item}
          >
            <Shield className="h-3.5 w-3.5" aria-hidden="true" />
            HIPAA-aligned care, built for real clinics
          </motion.div>

          <motion.h1
            className="mt-6 text-4xl font-normal leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem]"
            variants={variants.item}
          >
            Care that feels <span className="font-display italic text-teal-800">calm</span>
            <span className="text-slate-400">,</span>
            <br />
            not like a waiting room.
          </motion.h1>

          <motion.p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg" variants={variants.item}>
            Describe symptoms in plain language, get AI-guided triage, and sit down with a licensed doctor in
            minutes from a phone or a desk.
          </motion.p>

          <motion.div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" variants={variants.item}>
            <MotionButton className="w-full sm:w-auto">
              <Button asChild className="w-full shadow-lg shadow-teal-700/20 hover:shadow-xl sm:w-auto">
                <Link href="/register">
                  Start a visit
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </MotionButton>
            <MotionButton className="w-full sm:w-auto">
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href="#how-it-works">See the flow</Link>
              </Button>
            </MotionButton>
          </motion.div>

          <motion.p className="mt-4 text-xs text-slate-500" variants={variants.item}>
            No insurance required · Average wait under 5 minutes
          </motion.p>
        </motion.div>

        <motion.div variants={variants.card}>
          <ProductMock reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </motion.section>
  );
}
