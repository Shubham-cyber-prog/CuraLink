"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Stethoscope, UserPlus, ShieldCheck, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";

export function EditorialClosingCta() {
  return (
    <section
      className="relative bg-[#0A0F0D] text-[#F5F3EE] py-28 sm:py-36 px-4 sm:px-6 lg:px-8 border-b border-white/10 overflow-hidden"
      aria-label="Get Started"
    >
      {/* Background architectural aura */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
        <div className="h-[600px] w-[600px] rounded-full bg-[#085041]/20 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-semibold">
          [ 07 · Begin Your Care Journey ]
        </span>

        <h2 className="mt-5 font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[#F5F3EE] leading-[1.08] max-w-3xl mx-auto">
          Healthcare designed for your{" "}
          <em className="font-serif italic font-normal text-emerald-300">peace of mind</em>.
        </h2>

        <p className="mt-6 text-sm sm:text-base lg:text-lg text-white/60 max-w-xl mx-auto font-sans leading-relaxed">
          Find the right care, book your visit, and stay connected with your personal medical record vault without waiting rooms.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
            <Link
              href="/find-doctor"
              className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2 overflow-hidden rounded-full bg-[#085041] px-8 py-4 text-sm font-semibold text-white border border-emerald-400/40 shadow-lg hover:border-emerald-300 transition-all"
            >
              <Stethoscope className="h-4 w-4 text-emerald-300" />
              <span>Find a Physician</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-emerald-500/0 via-emerald-400/25 to-emerald-500/0 transition-transform duration-500 group-hover:translate-x-full" />
            </Link>
          </motion.div>

          <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
            <Link
              href="/register"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-8 py-4 text-sm font-medium text-[#F5F3EE] transition-colors"
            >
              <UserPlus className="h-4 w-4 text-emerald-400" />
              <span>Create Free Account</span>
            </Link>
          </motion.div>
        </div>

        {/* Minimalist Trust Guarantees */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-white/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Strict Patient Privacy</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Board-Verified Doctors</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <span>Zero Subscription Lock-In</span>
          </div>
        </div>
      </div>
    </section>
  );
}
