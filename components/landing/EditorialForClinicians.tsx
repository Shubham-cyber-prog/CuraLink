"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Stethoscope, Clock, ShieldCheck, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";

export function EditorialForClinicians() {
  return (
    <section
      id="for-doctors"
      className="relative bg-[#F5F3EE] text-[#0A0F0D] py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b border-[#0A0F0D]/10"
      aria-labelledby="practitioners-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-[#0A0F0D]/10 bg-white p-8 sm:p-14 lg:p-16 shadow-xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-8">
              <span className="font-mono text-xs uppercase tracking-widest text-[#085041] font-semibold">
                [ 06 · Practitioner Network ]
              </span>
              <h2
                id="practitioners-heading"
                className="mt-4 font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#0A0F0D] leading-[1.1]"
              >
                Practice on a schedule you control, with patients who arrive{" "}
                <em className="font-serif italic font-normal text-[#085041]">clinically prepared</em>.
              </h2>
              <p className="mt-5 text-sm sm:text-base text-[#0A0F0D]/70 max-w-2xl font-sans leading-relaxed">
                Join an elite collective of licensed physicians who value clinical depth over volume billing. CuraLink automates pre-visit triage, calendar management, and secure video rooms — giving you back your time and clinical joy.
              </p>

              <div className="mt-8 grid sm:grid-cols-3 gap-4 text-xs font-medium text-[#0A0F0D]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#085041] shrink-0" />
                  <span>Sovereign calendar control</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#085041] shrink-0" />
                  <span>Pre-visit intake dossiers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#085041] shrink-0" />
                  <span>Transparent direct payouts</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center gap-4">
              <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  href="/register?role=doctor"
                  className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2 overflow-hidden rounded-full bg-[#085041] px-8 py-4 text-sm font-semibold text-white shadow-md hover:bg-emerald-900 transition-all border border-emerald-500/30"
                >
                  <Stethoscope className="h-4 w-4 text-emerald-300" />
                  <span>Apply as a Physician</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
              <p className="text-[11px] font-mono text-[#0A0F0D]/50 text-left lg:text-right">
                Board certification &amp; medical registry verification mandatory.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
