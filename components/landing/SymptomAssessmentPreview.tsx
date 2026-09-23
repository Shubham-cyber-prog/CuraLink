"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";

export function SymptomAssessmentPreview() {
  return (
    <section className="px-4 sm:px-6 py-16 sm:py-20 bg-white dark:bg-[#0B1120] border-b border-slate-200/80 dark:border-slate-800/80" aria-labelledby="triage-heading">
      <div className="mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0D9488] dark:text-[#14B8A6]">
              Clinical Triage
            </span>
            <h2
              id="triage-heading"
              className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
            >
              Structured symptom intake before your visit
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Describe your health concerns in plain language. Our clinical intake framework summarizes your onset, duration, and severity so your physician can focus on diagnosis and care.
            </p>

            <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>3-step guided intake with targeted clarifying questions</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>Transparent urgency indicators (Green, Yellow, Red)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>Clear clinical boundaries — guidance, not automated diagnosis</span>
              </div>
            </div>

            <div className="mt-8">
              <Button asChild className="bg-[#0D9488] hover:bg-[#0F766E] text-white">
                <Link href="/symptom-checker" className="inline-flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>Start Clinical Assessment</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Interactive preview card */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#0D9488]" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Sample Triage Summary
                </span>
              </div>
              <Badge variant="moderate">Yellow · Moderate Urgency</Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                <p className="font-semibold text-slate-900 dark:text-white mb-1">
                  Reported Symptoms:
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  Persistent lower back discomfort lasting 2 weeks, exacerbated by prolonged sitting.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                <p className="font-semibold text-slate-900 dark:text-white mb-1">
                  Recommended Action:
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  Consultation with an Orthopedic or Physical Therapy specialist for clinical assessment.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-amber-50/80 dark:bg-amber-950/30 p-3 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600" />
              <span>Informational triage guidance. Not a substitute for licensed medical evaluation.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
