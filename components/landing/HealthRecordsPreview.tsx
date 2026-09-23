"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Lock,
  Download,
  Share2,
  CheckCircle2,
  ArrowRight,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";

export function HealthRecordsPreview() {
  return (
    <section className="px-4 sm:px-6 py-16 sm:py-20 bg-white dark:bg-[#0B1120] border-b border-slate-200/80 dark:border-slate-800/80" aria-labelledby="records-heading">
      <div className="mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0D9488] dark:text-[#14B8A6]">
              Digital Patient Vault
            </span>
            <h2
              id="records-heading"
              className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
            >
              Unified medical records under your control
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Consolidate your lab results, digital prescriptions, vaccination records, and doctor notes in one secure, accessible place. Download or share with authorized physicians on your terms.
            </p>

            <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>Instant PDF prescription downloads and summaries</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>Role-based clinical access controls and audit logs</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>Optional AI report summarization for plain-English clarity</span>
              </div>
            </div>

            <div className="mt-8">
              <Button asChild className="bg-[#0D9488] hover:bg-[#0F766E] text-white">
                <Link href="/records" className="inline-flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Access Health Records</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Records vault mockup card */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#0D9488]" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Recent Medical Documents
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Lock className="h-3 w-3 text-[#0D9488]" />
                <span>Private Access</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0D9488]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Annual Complete Blood Count</p>
                    <p className="text-[11px] text-slate-500">Diagnostic Lab Report · PDF</p>
                  </div>
                </div>
                <Badge variant="verified">Analyzed</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0D9488]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Follow-up Telehealth Rx</p>
                    <p className="text-[11px] text-slate-500">Dr. Priya Sharma, MD · Active</p>
                  </div>
                </div>
                <Badge variant="info">Prescription</Badge>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Encrypted storage in transit & at rest</span>
              <span className="font-medium text-[#0D9488]">Built for clinical privacy</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
