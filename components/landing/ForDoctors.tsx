"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  BarChart3,
  CreditCard,
  ShieldCheck,
  Video,
} from "lucide-react";

const BENEFITS = [
  {
    icon: Calendar,
    title: "Smart Practice Scheduling",
    description: "Manage your availability with buffer times and automated reminder alerts that reduce no-shows.",
  },
  {
    icon: BarChart3,
    title: "Patient Health Trends",
    description: "Review longitudinal blood glucose curves, blood pressure trends, and past notes on one clean screen.",
  },
  {
    icon: CreditCard,
    title: "Direct Integrated Payouts",
    description: "Automated settlements directly to your bank account via Razorpay. Zero invoicing friction.",
  },
  {
    icon: ShieldCheck,
    title: "NMC & DPDP Aligned",
    description: "Built-in digital signature support, verified prescription templates, and compliance audit logging.",
  },
];

export function ForDoctors() {
  return (
    <section id="for-doctors" className="py-20 sm:py-24 border-b border-border">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Benefits */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#006D77]">
              For Medical Practitioners
            </span>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
              Practice medicine on your own terms.
            </h2>

            <p className="text-base text-muted leading-relaxed">
              CuraLink removes the administrative burden. We provide licensed clinicians with high-definition
              teleconsultation rooms, smart EMR telemetry, and instantaneous fee settlements in a calm interface.
            </p>

            <div className="pt-2 grid sm:grid-cols-2 gap-5">
              {BENEFITS.map((benefit) => (
                <div key={benefit.title} className="flex gap-3.5">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-[#006D77]/10 text-[#006D77] flex items-center justify-center">
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {benefit.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                href="/register?role=doctor"
                className="group inline-flex items-center gap-2 rounded-xl bg-[#006D77] hover:bg-[#00565e] px-6 py-3 text-sm font-semibold text-white shadow-xs hover:shadow-[0_0_16px_rgba(131,197,190,0.4)] transition-all"
              >
                <span>Apply as a Doctor</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-medium text-foreground hover:bg-surface-elevated transition-colors"
              >
                Doctor Portal Login
              </Link>
            </div>
          </div>

          {/* Right Column: Clean Doctor Dashboard Preview */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Today&apos;s Clinic Schedule
                  </h4>
                  <p className="text-xs text-muted">3 confirmed visits · Next at 10:30 AM</p>
                </div>
                <span className="rounded-full bg-[#006D77]/10 px-2.5 py-0.5 text-xs font-semibold text-[#006D77]">
                  Live
                </span>
              </div>

              {/* Consultation List */}
              <div className="space-y-2.5">
                {[
                  {
                    time: "10:30 AM",
                    name: "Ravi Kumar (48y)",
                    type: "Diabetes Follow-up",
                    status: "Ready",
                    isCurrent: true,
                  },
                  {
                    time: "11:15 AM",
                    name: "Priya Sharma (34y)",
                    type: "Hypertension Review",
                    status: "Confirmed",
                    isCurrent: false,
                  },
                  {
                    time: "02:00 PM",
                    name: "Anil Mehta (52y)",
                    type: "Lab Report Review",
                    status: "Scheduled",
                    isCurrent: false,
                  },
                ].map((apt) => (
                  <div
                    key={apt.time}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-colors ${
                      apt.isCurrent
                        ? "border-[#83C5BE]/60 bg-[#006D77]/5"
                        : "border-border bg-surface-elevated"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-foreground">{apt.time}</span>
                      <div>
                        <p className="font-semibold text-foreground">{apt.name}</p>
                        <p className="text-[11px] text-muted">{apt.type}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-surface border border-border px-2 py-0.5 text-[10px] text-muted font-medium">
                        {apt.status}
                      </span>
                      {apt.isCurrent && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#006D77] px-2.5 py-1 text-[11px] font-semibold text-white">
                          <Video className="h-3 w-3" />
                          <span>Join</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Settlement summary */}
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted">Weekly Settlement Projected:</span>
                <span className="font-mono font-bold text-foreground">₹24,800</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
