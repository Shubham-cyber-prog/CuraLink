"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Stethoscope, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function ClosingCta() {
  return (
    <section className="px-4 sm:px-6 py-20 bg-[#F5F7F6] dark:bg-[#0B1120]" aria-label="Get started with CuraLink">
      <motion.div
        className="mx-auto max-w-5xl rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#151B2E] p-8 sm:p-12 md:p-14 text-center shadow-xs"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-[#0D9488] dark:text-[#14B8A6]">
          Begin Your Care Journey
        </span>
        <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-white max-w-2xl mx-auto">
          Healthcare should feel simpler.
        </h2>
        <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Find the right care, book your visit, and stay connected with your healthcare journey.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Button asChild className="w-full sm:w-auto bg-[#0D9488] hover:bg-[#0F766E] text-white px-7 py-3 rounded-lg font-medium shadow-xs">
            <Link href="/doctors" className="inline-flex items-center justify-center gap-2">
              <Stethoscope className="h-4 w-4" />
              <span>Find a Doctor</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full sm:w-auto bg-white dark:bg-slate-900 border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#0F172A] dark:text-white px-7 py-3 rounded-lg font-medium">
            <Link href="/register" className="inline-flex items-center justify-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>Create Account</span>
            </Link>
          </Button>
        </div>

        {/* Reassurance points */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#0D9488]" />
            <span>Strict Patient Confidentiality</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Board-Verified Practitioners</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            <span>Zero Long-term Lock-in</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
