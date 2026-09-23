"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  FileCheck2,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";

export function AppointmentExperiencePreview() {
  return (
    <section className="px-4 sm:px-6 py-16 sm:py-20 bg-[#FAFAFA] dark:bg-[#0F172A] border-b border-slate-200/80 dark:border-slate-800/80" aria-labelledby="appointment-exp-heading">
      <div className="mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Visual Showcase Card */}
          <div className="order-2 lg:order-1 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-[#0D9488]" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Video Consultation Flow
                </span>
              </div>
              <Badge variant="verified">HD Audio & Video</Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Select Confirmed Time Slot</p>
                  <p className="text-slate-500 dark:text-slate-400">Book only when doctors are truly available</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/50 text-xs">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D9488] text-white font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Enter Private Video Room</p>
                  <p className="text-slate-600 dark:text-slate-300">Browser-based, zero downloads or account friction</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] font-bold">
                  3
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Receive Electronic Rx & Summary</p>
                  <p className="text-slate-500 dark:text-slate-400">Clinical notes and prescriptions securely vaulted</p>
                </div>
              </div>
            </div>
          </div>

          {/* Copy Description */}
          <div className="order-1 lg:order-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0D9488] dark:text-[#14B8A6]">
              Consultation Experience
            </span>
            <h2
              id="appointment-exp-heading"
              className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
            >
              Consultations designed around patient calm
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              No software installations, no complex meeting codes, and no uncertain wait times. Simply tap your confirmed appointment link to join your physician at the scheduled hour.
            </p>

            <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>Real-time duration tracking and connection indicators</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>Direct electronic prescription delivery immediately post-call</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0" />
                <span>Easy rescheduling and follow-up booking in one place</span>
              </div>
            </div>

            <div className="mt-8">
              <Button asChild className="bg-[#0D9488] hover:bg-[#0F766E] text-white">
                <Link href="/appointments" className="inline-flex items-center gap-2">
                  <span>Manage Your Visits</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
