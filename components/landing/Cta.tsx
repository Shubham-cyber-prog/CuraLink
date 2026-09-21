"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn, staggerContainer } from "@/components/motion/variants";

export function Cta() {
  return (
    <section className="px-6 pb-24 pt-8 sm:pb-28" aria-labelledby="cta-heading">
      <motion.div
        className="mx-auto max-w-2xl text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <motion.div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400"
          variants={scaleIn}
        >
          <Clock className="h-6 w-6" aria-hidden="true" />
        </motion.div>
        <motion.h2
          id="cta-heading"
          className="mt-6 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-4xl"
          variants={fadeInUp}
        >
          Your health can&apos;t wait.
        </motion.h2>
        <motion.p
          className="mx-auto mt-3 max-w-md text-base leading-relaxed text-slate-500 dark:text-slate-400"
          variants={fadeInUp}
        >
          Join patients who booked a licensed consult in minutes — no insurance required to get started.
        </motion.p>
        <motion.div className="mt-8 flex justify-center" variants={fadeInUp}>
          <Button size="lg" asChild>
            <Link href="/register">
              Create your free account
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </motion.div>
        <motion.p className="mt-4 text-xs text-slate-500 dark:text-slate-500" variants={fadeInUp}>
          No credit card required · Cancel anytime
        </motion.p>
      </motion.div>
    </section>
  );
}
