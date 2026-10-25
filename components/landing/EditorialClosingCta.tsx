"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Stethoscope, UserPlus, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export function EditorialClosingCta() {
  return (
    <section
      className="relative bg-[#090D16] text-[#F5F3EE] py-28 sm:py-36 px-4 sm:px-6 lg:px-8 border-b border-teal-500/15 overflow-hidden"
      aria-label="Get Started"
    >
      {/* Background architectural aura with Logo Colors */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
        <div className="h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-[#0284C7]/20 via-[#0F9D8C]/25 to-[#10B981]/20 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-teal-400 font-semibold">
          [ 07 · Begin Your Care Journey ]
        </span>

        <h2 className="mt-5 font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[#F5F3EE] leading-[1.08] max-w-3xl mx-auto">
          Healthcare designed for your{" "}
          <em className="font-serif italic font-normal bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
            peace of mind
          </em>
          .
        </h2>

        <p className="mt-6 text-sm sm:text-base lg:text-lg text-slate-300 max-w-xl mx-auto font-sans leading-relaxed">
          Find the right care, book your visit, and stay connected with your personal medical record vault without waiting rooms.
        </p>

        {/* Action Buttons in Logo Colors */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
            <Link
              href="/find-doctor"
              className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#0284C7] via-[#0F9D8C] to-[#10B981] px-8 py-4 text-sm font-bold text-white shadow-xl shadow-teal-500/25 hover:brightness-105 transition-all"
            >
              <Stethoscope className="h-4 w-4" />
              <span>Find a Physician</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
            <Link
              href="/register"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-teal-500/30 bg-white/[0.04] hover:bg-white/[0.08] px-8 py-4 text-sm font-semibold text-teal-300 hover:text-white transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>Create Free Account</span>
            </Link>
          </motion.div>
        </div>

        {/* Minimalist Trust Guarantees */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-teal-400" />
            <span>NMC Telemedicine Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#0284C7]" />
            <span>DPDP Act 2023 Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>256-Bit Encrypted Sessions</span>
          </div>
        </div>
      </div>
    </section>
  );
}
