"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarX,
  Clock,
  RefreshCw,
  AlertTriangle,
  CreditCard,
  UserCheck,
  Headphones,
} from "lucide-react";

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-[#0B1120] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="mx-auto max-w-4xl">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to CuraLink
        </Link>

        {/* Header */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-[#263049] bg-white dark:bg-[#151B2E] p-8 sm:p-10 shadow-xs mb-8">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-3">
            <CalendarX className="h-4 w-4" />
            <span>Billing & Scheduling Policies</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-[#F1F5F9] mb-3">
            Cancellation & Refund Policy
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Effective Date: September 2026 • Version 1.1
          </p>

          {/* Legal Draft Notice */}
          <div className="mt-6 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/80 dark:bg-amber-950/30 p-4 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200 mb-0.5">Notice to Users & Compliance Note</p>
              <p className="leading-relaxed">
                This document outlines CuraLink&apos;s active operational cancellation and refund framework. Prior to formal commercial rollout, these terms must be formally reviewed and audited by qualified legal counsel in accordance with applicable consumer protection, e-commerce, and healthcare regulations.
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-[#263049] bg-white dark:bg-[#151B2E] p-8 sm:p-10 shadow-xs space-y-10 text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 text-sm font-bold">1</span>
              Patient-Initiated Cancellations
            </h2>
            <p className="text-sm">
              We understand that schedules change unexpectedly. Because our healthcare providers reserve dedicated clinical time for each patient, the following cancellation windows apply to all scheduled appointments:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="rounded-2xl border border-teal-100 dark:border-teal-800/60 bg-teal-50/40 dark:bg-teal-950/30 p-4">
                <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold text-sm mb-1">
                  <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>More than 2 Hours Notice</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <strong>100% Full Refund</strong> or free rescheduling. Cancel directly from your appointments dashboard without penalty.
                </p>
              </div>
              <div className="rounded-2xl border border-amber-100 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/30 p-4">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm mb-1">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>Within 2 Hours of Appointment</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Subject to a <strong>50% late-cancellation fee</strong> to compensate the doctor for reserved consultation time.
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
              Missed appointments without prior cancellation notice (&quot;Patient No-Show&quot;) are non-refundable.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 text-sm font-bold">2</span>
              Doctor Cancellations & Guaranteed Protection
            </h2>
            <p className="text-sm">
              In the rare event that a doctor must cancel or reschedule due to an urgent emergency or clinical conflict:
            </p>
            <div className="rounded-2xl border border-slate-200 dark:border-[#263049] bg-slate-50/60 dark:bg-[#1C2338]/60 p-4 space-y-2">
              <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <UserCheck className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <span>
                  <strong>100% Refund Guarantee:</strong> You will immediately be offered the choice between a full refund to your original payment method or an expedited rebooking with the same or an equivalent specialist.
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <RefreshCw className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Provider Delay:</strong> If your healthcare provider does not join the secure video room within 10 minutes of the scheduled start time, you may cancel the session immediately for a full 100% refund.
                </span>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 text-sm font-bold">3</span>
              Technical Difficulties & Video Room Failures
            </h2>
            <p className="text-sm">
              If an ongoing telemedicine consultation cannot proceed due to verified technical issues (e.g., severe audio/video degradation, room connection failures on CuraLink&apos;s infrastructure):
            </p>
            <ul className="list-disc pl-5 text-sm space-y-1 text-slate-600 dark:text-slate-400">
              <li>Our support team will verify session telemetrics and connection logs.</li>
              <li>If the session was interrupted prior to completing the clinical assessment, we will issue a complimentary reschedule credit or full refund.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 text-sm font-bold">4</span>
              Refund Processing & Timeline
            </h2>
            <div className="rounded-2xl border border-slate-200 dark:border-[#263049] bg-slate-50/60 dark:bg-[#1C2338]/60 p-4 flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold text-slate-900 dark:text-[#F1F5F9]">Razorpay Payment Gateway Timelines</p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  All eligible refunds are initiated automatically back to the original source of payment (UPI, Credit/Debit Card, Net Banking) via our payment partner, Razorpay. Once initiated, bank processing times typically range from <strong>5 to 7 business days</strong> depending on your issuing financial institution.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 text-sm font-bold">5</span>
              Disputes & Contact
            </h2>
            <p className="text-sm">
              If you have any questions, encounter issues with a scheduled session, or need to dispute a charge, our support team is available to assist you:
            </p>
            <div className="rounded-2xl border border-slate-200 dark:border-[#263049] bg-slate-50 dark:bg-[#1C2338]/60 p-4 flex items-center gap-3">
              <Headphones className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-slate-900 dark:text-[#F1F5F9]">CuraLink Patient Billing Support</p>
                <p className="text-slate-600 dark:text-slate-400">
                  Email: <a href="mailto:support@curalink.health" className="text-teal-600 dark:text-teal-400 hover:underline">support@curalink.health</a> • Hours: Monday – Saturday, 8:00 AM – 8:00 PM IST
                </p>
              </div>
            </div>
          </section>

          {/* Navigation Links */}
          <div className="pt-6 border-t border-slate-100 dark:border-[#263049] flex flex-wrap gap-4 text-xs font-semibold text-teal-700 dark:text-teal-400">
            <Link href="/terms-of-service" className="hover:underline">Terms of Service</Link>
            <span>•</span>
            <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
            <span>•</span>
            <Link href="/register" className="hover:underline">Create an Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
