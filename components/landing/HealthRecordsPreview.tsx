"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Calendar,
  Pill,
  Activity,
  Download,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const RECORD_MODULES = [
  {
    icon: Calendar,
    title: "Appointments & Visits",
    description: "Full visibility into scheduled upcoming consultations and past visit timelines.",
  },
  {
    icon: FileText,
    title: "Consultation History",
    description: "Doctor consultation summaries, physician notes, and recorded care plans.",
  },
  {
    icon: Activity,
    title: "Diagnostic Reports",
    description: "Blood tests, pathology reports, and imaging documents securely stored in PDF format.",
  },
  {
    icon: Pill,
    title: "Digital Prescriptions",
    description: "Valid e-prescriptions with precise dosage schedules and refill instructions.",
  },
  {
    icon: ShieldCheck,
    title: "Health Information",
    description: "Documented medical history, known allergies, blood group, and emergency contacts.",
  },
];

export function HealthRecordsPreview() {
  return (
    <section
      id="records"
      className="px-4 sm:px-6 py-20 bg-[#F5F7F6] dark:bg-[#0B1120] border-b border-[#E2E8F0] dark:border-slate-800"
      aria-labelledby="records-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Context & 5 Pillars */}
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0D9488] dark:text-[#14B8A6]">
              Personal Health Records
            </span>
            <h2
              id="records-heading"
              className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-white"
            >
              Your health history, unified and private.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Consolidate every dimension of your clinical journey in one calm, organized vault. No paperwork to track down, no misplaced slips — just simple access whenever you or your doctor need it.
            </p>

            {/* Modules list */}
            <div className="mt-6 space-y-3">
              {RECORD_MODULES.slice(0, 4).map((mod) => {
                const Icon = mod.icon;
                return (
                  <div key={mod.title} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] shrink-0 mt-0.5">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A] dark:text-white">
                        {mod.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {mod.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="mt-8 flex items-center gap-4">
              <Button asChild className="bg-[#0D9488] hover:bg-[#0F766E] text-white px-6 py-2.5 rounded-lg shadow-xs font-medium">
                <Link href="/records" className="inline-flex items-center gap-2">
                  <span>Access Health Records</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Right Column: Clean Medical Record Preview (No giant dashboard, no sidebar) */}
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          >
            <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#151B2E] p-6 sm:p-7 shadow-xs">
              {/* Patient header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] font-bold text-xs">
                    Rx
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#0F172A] dark:text-white">
                      Patient Health Dossier
                    </h3>
                    <p className="text-[11px] text-slate-500">Record ID · CL-88219</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200/60 dark:border-slate-700/60">
                  <Lock className="h-3 w-3 text-[#0D9488]" />
                  <span>Encrypted Vault</span>
                </div>
              </div>

              {/* Record preview items */}
              <div className="space-y-3">
                {/* 1. Prescription item */}
                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-[#FAFAFA] dark:bg-slate-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0D9488]">
                      <Pill className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A] dark:text-white">
                        Digital Prescription · Active
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Prescribed by Dr. Priya Sharma, MD · 2 medications
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200/60">
                    PDF Ready
                  </span>
                </div>

                {/* 2. Diagnostic report */}
                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-[#FAFAFA] dark:bg-slate-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0D9488]">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A] dark:text-white">
                        Complete Metabolic Panel (CMP)
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Diagnostic Lab Services · Normal findings
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>

                {/* 3. Consultation history */}
                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-[#FAFAFA] dark:bg-slate-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0D9488]">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A] dark:text-white">
                        Consultation Summary & Notes
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Video Consultation · Follow-up in 30 days
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200/60">
                    Documented
                  </span>
                </div>
              </div>

              {/* Bottom security assurance */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#0D9488]" />
                  <span>Only accessible by you and authorized practitioners</span>
                </div>
                <Link
                  href="/records"
                  className="text-xs font-semibold text-[#0D9488] hover:text-[#0F766E] transition-colors"
                >
                  Open records →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
