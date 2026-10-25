"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Percent,
  CalendarCheck,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Users,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

export function DoctorRecruitmentBanner() {
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const estimatedEarnings = hoursPerDay * 600 * 24; // e.g. 3 hrs * ~₹600/consult * 24 days = ~₹43,200 (or ~₹1,44,000 at 10 consults/day)

  return (
    <section id="for-doctors" className="py-20 sm:py-24 border-b border-border bg-[#0B1F33] text-white overflow-hidden relative">
      {/* Background radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-0 w-[600px] h-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,109,119,0.25),transparent_70%)]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Doctor Value Props */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3.5 py-1 text-xs font-semibold text-emerald-300">
              <Percent className="h-3.5 w-3.5" />
              <span>Doctor Incentive: 0% Platform Commission for First 3 Months</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Practice digital medicine. Retain 100% of your earnings.
            </h2>

            <p className="text-base text-white/75 leading-relaxed max-w-2xl">
              Join 380+ board-certified clinicians from AIIMS, Apollo, and Fortis. CuraLink handles patient scheduling, 
              intake triage, and instant bank settlements so you can focus entirely on patient diagnosis.
            </p>

            {/* 3 Core Highlights */}
            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.04]">
                <Percent className="h-5 w-5 text-[#83C5BE] mb-2" />
                <h4 className="text-sm font-bold text-white">0% Fees for 3 Months</h4>
                <p className="text-xs text-white/60 mt-1">Keep 100% of patient consultation payments.</p>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.04]">
                <CalendarCheck className="h-5 w-5 text-[#83C5BE] mb-2" />
                <h4 className="text-sm font-bold text-white">Smart Scheduling</h4>
                <p className="text-xs text-white/60 mt-1">Automated buffers & automated SMS reminders prevent no-shows.</p>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.04]">
                <CreditCard className="h-5 w-5 text-[#83C5BE] mb-2" />
                <h4 className="text-sm font-bold text-white">Instant Daily Payouts</h4>
                <p className="text-xs text-white/60 mt-1">Razorpay settlements directly into your account every morning.</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Link
                href="/register?role=doctor"
                className="group inline-flex items-center gap-2 rounded-xl bg-[#006D77] hover:bg-[#00565e] px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:shadow-[0_0_20px_rgba(131,197,190,0.5)] transition-all"
              >
                <Stethoscope className="h-4 w-4" />
                <span>Apply as a Doctor</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-5 py-3.5 text-sm font-medium text-white transition-colors"
              >
                <span>Doctor Portal Login</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Earnings Estimator */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-6 sm:p-7 backdrop-blur-md shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h4 className="text-base font-bold text-white">Monthly Earnings Estimator</h4>
                  <p className="text-xs text-white/60">Based on standard consultation volume</p>
                </div>
                <span className="rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5">
                  Live Calculator
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-white/80 mb-2">
                    <span>Practice Hours Per Day:</span>
                    <strong className="font-mono text-white text-sm">{hoursPerDay} hours / day</strong>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={6}
                    step={1}
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(Number(e.target.value))}
                    className="w-full accent-[#83C5BE] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-1">
                    <span>1 hr (casual)</span>
                    <span>3 hrs (part-time)</span>
                    <span>6 hrs (full-time)</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.05] border border-white/10 text-center">
                  <span className="text-xs text-white/70 block">Estimated Monthly Take-Home:</span>
                  <div className="mt-1 text-3xl sm:text-4xl font-extrabold font-mono text-[#83C5BE]">
                    ₹{(hoursPerDay * 36000).toLocaleString("en-IN")}
                    <span className="text-xs font-normal text-white/60"> / month</span>
                  </div>
                  <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>0% platform deduction for 90 days</span>
                  </p>
                </div>

                <div className="space-y-2 text-xs text-white/70 pt-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#83C5BE]" />
                    <span>NMC verification turnaround: &lt; 24 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#83C5BE]" />
                    <span>Full patient EMR telemetry & prescription builder</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#83C5BE]" />
                    <span>No minimum commitment required</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
