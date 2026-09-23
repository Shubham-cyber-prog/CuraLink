"use client";

import React from "react";
import Link from "next/link";
import {
  Stethoscope,
  Star,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Video,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";

const FEATURED_SPECIALTIES = [
  { name: "General Medicine", doctors: "Primary care & acute triage", count: "12 Specialists" },
  { name: "Cardiology", doctors: "Heart health & blood pressure", count: "8 Specialists" },
  { name: "Dermatology", doctors: "Skin conditions & rash evaluations", count: "6 Specialists" },
  { name: "Pediatrics", doctors: "Child health & adolescent care", count: "9 Specialists" },
];

export function DoctorDiscoveryPreview() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="px-4 sm:px-6 py-16 sm:py-20 bg-[#FAFAFA] dark:bg-[#0F172A] border-b border-slate-200/80 dark:border-slate-800/80" aria-labelledby="discovery-heading">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0D9488] dark:text-[#14B8A6]">
              Physician Discovery
            </span>
            <h2
              id="discovery-heading"
              className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
            >
              Consult with verified medical specialists
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
              Browse licensed physicians by clinical department, check verified credentials, and book direct video visits.
            </p>
          </div>

          <Button asChild className="bg-[#0D9488] hover:bg-[#0F766E] text-white shrink-0 self-start md:self-end">
            <Link href="/find-doctor" className="inline-flex items-center gap-2">
              <span>View All Doctors</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Specialty cards grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_SPECIALTIES.map((spec) => (
            <Link
              key={spec.name}
              href={`/find-doctor?specialty=${encodeURIComponent(spec.name)}`}
              className="group block"
            >
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs hover:shadow-xs hover:border-[#0D9488]/40 dark:hover:border-teal-700/50 transition-all flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] dark:text-[#14B8A6] border border-teal-100 dark:border-teal-900/50">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] text-slate-500">
                      {spec.count}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base group-hover:text-[#0D9488] dark:group-hover:text-[#14B8A6] transition-colors">
                    {spec.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {spec.doctors}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-[#0D9488] dark:text-[#14B8A6]">
                  <span>Find specialist</span>
                  <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
