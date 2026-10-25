"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Video, HeartPulse } from "lucide-react";
import { motion } from "framer-motion";

export function Cta() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-border bg-[#006D77] p-12 sm:p-16 text-center relative overflow-hidden"
        >
          {/* Soft gradient overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#006D77] via-[#006D77] to-[#0B1F33]/30"
          />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Virtual Care Available 7 Days a Week</span>
            </span>

            <h2 className="mt-7 text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-white max-w-xl mx-auto leading-tight">
              Ready to speak with a verified specialist?
            </h2>

            <p className="mt-4 text-base text-white/75 max-w-lg mx-auto leading-relaxed">
              Connect with India&apos;s leading doctors from the comfort of your home.
              Consultations start at ₹500 with instant digital prescriptions.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/find-doctor"
                className="group inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-7 text-sm font-semibold text-[#006D77] shadow-sm hover:bg-[#f4f8f8] transition-all"
              >
                <span>Book Consultation Now</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/symptom-checker"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 text-sm font-medium text-white hover:bg-white/20 transition-colors"
              >
                <span>Try AI Symptom Check</span>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-white/65">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>NMC Verified Doctors</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Video className="h-3.5 w-3.5" />
                <span>Browser-Native HD Video</span>
              </span>
              <span className="flex items-center gap-1.5">
                <HeartPulse className="h-3.5 w-3.5" />
                <span>DPDP 2023 Compliant</span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
