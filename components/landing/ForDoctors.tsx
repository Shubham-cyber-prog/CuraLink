"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function ForDoctors() {
  return (
    <section id="for-doctors" className="px-4 sm:px-6 py-20 bg-[#F5F7F6] dark:bg-[#0B1120] border-b border-[#E2E8F0] dark:border-slate-800" aria-labelledby="doctors-heading">
      <motion.div
        className="mx-auto max-w-6xl rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#151B2E] p-8 sm:p-12 shadow-xs"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0D9488] dark:text-[#14B8A6]">
              For Healthcare Practitioners
            </span>
            <h2 id="doctors-heading" className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-white">
              Practice on a schedule you control
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Join a verified medical network designed to eliminate administrative noise. CuraLink handles patient intake summaries, calendar scheduling, and secure video consultations so you can focus on clinical medicine.
            </p>

            <div className="mt-6 grid sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>Flexible consultation hours</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>Pre-visit intake notes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>Direct payout management</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-center gap-3">
            <Button asChild className="w-full sm:w-auto bg-[#0F172A] hover:bg-slate-800 dark:bg-white dark:text-[#0F172A] text-white px-6 py-2.5 rounded-lg shadow-xs font-medium">
              <Link href="/register?role=doctor" className="inline-flex items-center justify-center gap-2">
                <Stethoscope className="h-4 w-4" />
                <span>Apply as a Doctor</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Medical credential verification required
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
