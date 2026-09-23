"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Video,
  Star,
  ArrowRight,
  Stethoscope,
  Lock,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

interface ProductMockProps {
  reduceMotion?: boolean;
}

export function ProductMock({ reduceMotion = false }: ProductMockProps) {
  const shouldReduce = reduceMotion || useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-[500px]" aria-hidden="true">
      {/* Ambient calm glow - very subtle neutral slate */}
      <div className="absolute -inset-4 rounded-3xl bg-teal-500/5 dark:bg-teal-400/5 blur-2xl" />

      {/* Main Clinical Card: Telehealth Consultation Suite */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5 dark:shadow-black/30">
        {/* Top Clinical Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Live Physician Availability
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <Lock className="h-3 w-3 text-[#0D9488]" />
            <span>Private Consultation Room</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-4">
          {/* Doctor Profile Spotlight */}
          <div className="flex items-start justify-between rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 p-4">
            <div className="flex items-center gap-3.5">
              <div className="relative flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-950/60 text-[#0D9488] dark:text-[#14B8A6] font-bold text-base border border-teal-200/60 dark:border-teal-800/50">
                AR
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <CheckCircle2 className="h-3 w-3 stroke-[3]" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Dr. Amara Rao, MD
                  </h4>
                </div>
                <p className="text-xs text-[#0D9488] dark:text-[#14B8A6] font-medium">
                  Family Medicine & Primary Care
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    4.9
                  </span>
                  <span>•</span>
                  <span>12 yrs clinical exp.</span>
                </div>
              </div>
            </div>
            <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
              Verified
            </span>
          </div>

          {/* Consultation Flow Preview */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Next Available Consultation</span>
              <span className="text-[#0D9488] dark:text-[#14B8A6]">Today</span>
            </div>

            {/* Time Slot Selector */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center justify-center rounded-lg border border-[#0D9488] bg-teal-50/60 dark:bg-teal-950/40 py-2 px-1 text-center cursor-pointer">
                <span className="text-xs font-bold text-[#0D9488] dark:text-[#14B8A6]">2:15 PM</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Video Call</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/30 py-2 px-1 text-center opacity-70">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">3:30 PM</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Video Call</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/30 py-2 px-1 text-center opacity-70">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">4:45 PM</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">In-Person</span>
              </div>
            </div>
          </div>

          {/* Telehealth Room Details Box */}
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                <Video className="h-3.5 w-3.5 text-[#0D9488]" />
                Direct HD Video Consultation
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">Included</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                <Calendar className="h-3.5 w-3.5 text-[#0D9488]" />
                Electronic Prescription & Notes
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">Same Day</span>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-1">
            <div className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0D9488] py-2.5 px-4 text-xs font-semibold text-white shadow-xs">
              <span>Proceed to Consultation Room</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        {/* Footer Clinical Assurance */}
        <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-5 py-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Verified Practitioner Credentials
          </span>
          <span>Zero Waiting Room</span>
        </div>
      </div>
    </div>
  );
}
