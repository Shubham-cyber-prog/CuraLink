"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
  HelpCircle,
  Stethoscope,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const INTAKE_STEPS = [
  {
    step: "01",
    label: "Symptom",
    title: "Report Initial Concern",
    description: "Describe what you're experiencing in plain language.",
    example: "Persistent lower back discomfort after prolonged sitting",
    status: "Completed",
  },
  {
    step: "02",
    label: "Questions",
    title: "Targeted Clarification",
    description: "Answer clinical questions about onset, duration, and pain scale.",
    example: "Duration: 12 days · Severity: 4/10 · No radiating numbness",
    status: "Reviewed",
  },
  {
    step: "03",
    label: "Assessment",
    title: "Structured Clinical Triage",
    description: "Receive a calm assessment categorizing urgency and key indicators.",
    example: "Moderate urgency · Musculoskeletal strain indicators",
    status: "Triaged",
  },
  {
    step: "04",
    label: "Next step",
    title: "Physician Connection",
    description: "Seamlessly transition to booking the appropriate specialist.",
    example: "Recommended: General Medicine or Physical Therapy",
    status: "Next Action",
  },
];

export function SymptomAssessmentPreview() {
  return (
    <section
      id="symptom-assessment"
      className="px-4 sm:px-6 py-20 bg-[#F5F7F6] dark:bg-[#0B1120] border-b border-[#E2E8F0] dark:border-slate-800"
      aria-labelledby="assessment-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Context & Action */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0D9488] dark:text-[#14B8A6]">
              Clinical Intake
            </span>
            <h2
              id="assessment-heading"
              className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-white"
            >
              Understand your symptoms before your visit.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Complete a guided health intake before you meet with a doctor. Our clinical framework summarizes your symptom timeline, pain characteristics, and red flags so your consultation can focus directly on treatment.
            </p>

            {/* Value bullets */}
            <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0 mt-0.5" />
                <span>Structured clinical intake questions, not an AI chatbot</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0 mt-0.5" />
                <span>Provides context for your physician without premature diagnosis</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0 mt-0.5" />
                <span>Clear urgency guidance so you know when to seek immediate care</span>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 flex flex-col sm:flex-row items-start gap-3">
              <Button asChild className="bg-[#0D9488] hover:bg-[#0F766E] text-white px-6 py-2.5 rounded-lg shadow-xs font-medium">
                <Link href="/symptom-checker" className="inline-flex items-center gap-2">
                  <span>Start Assessment</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Medical Disclaimer */}
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex items-start gap-1.5">
              <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                CuraLink symptom assessment provides preliminary clinical intake context. It does not replace professional medical evaluation, diagnosis, or emergency services.
              </span>
            </p>
          </motion.div>

          {/* Right Column: Clean Clinical Intake Flow Preview */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          >
            <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#151B2E] p-6 sm:p-7 shadow-xs">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0D9488]">
                    <ClipboardList className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#0F172A] dark:text-white uppercase tracking-wider">
                      Clinical Intake Framework
                    </h3>
                    <p className="text-[11px] text-slate-500">Standardized patient intake preview</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-200/60 dark:border-teal-900/50">
                  4-Step Protocol
                </span>
              </div>

              {/* Step Sequence Flow */}
              <div className="space-y-3 relative">
                {INTAKE_STEPS.map((step, idx) => (
                  <div
                    key={step.step}
                    className="relative flex items-start gap-4 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-[#FAFAFA] dark:bg-slate-900/60 transition-colors hover:border-[#0D9488]/30"
                  >
                    {/* Step indicator */}
                    <div className="flex flex-col items-center shrink-0">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-[#0F172A] dark:text-white shadow-2xs">
                        {step.step}
                      </span>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#0D9488]">
                          {step.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {step.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[#0F172A] dark:text-white mt-0.5">
                        {step.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {step.example}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Card Footer notice */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Clinical summary transmitted directly to booked physician</span>
                </div>
                <Link
                  href="/symptom-checker"
                  className="text-xs font-semibold text-[#0D9488] hover:text-[#0F766E] transition-colors"
                >
                  Try intake flow →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
