"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, AlertTriangle, Stethoscope, ShieldAlert, CreditCard, Scale } from "lucide-react";

export default function TermsOfServicePage() {
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
            <Scale className="h-4 w-4" />
            <span>Terms & Conditions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-[#F1F5F9] mb-3">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Effective Date: September 2026 • Version 1.2
          </p>

          {/* Legal Draft Notice */}
          <div className="mt-6 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/80 dark:bg-amber-950/30 p-4 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200 mb-0.5">Notice to Users & Compliance Note</p>
              <p className="leading-relaxed">
                This document serves as CuraLink&apos;s active operational Terms of Service. Prior to official commercial launch, these terms must be finalized in consultation with healthcare legal counsel for compliance with national Telemedicine Practice Guidelines and electronic healthcare commerce laws.
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
              Agreement to Terms
            </h2>
            <p className="text-sm">
              By registering an account, accessing, or using CuraLink (&quot;the Platform&quot;), you confirm that you have read, understood, and agreed to be legally bound by these Terms of Service, along with our Privacy Policy and Cancellation Policy. If you do not agree to these terms, you must discontinue use immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 p-5">
              <div className="flex items-center gap-2 font-bold text-red-900 dark:text-red-200 text-sm mb-1.5">
                <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
                Emergency Medical Services Disclaimer — Not for Acute Emergencies
              </div>
              <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
                CuraLink is a telehealth technology platform designed for non-emergency consultations, routine care, follow-up evaluations, and preliminary AI symptom triage. <strong>If you are experiencing severe chest pain, shortness of breath, acute trauma, sudden numbness, or any life-threatening emergency, call your local emergency service (such as 112 or 911) or proceed immediately to the nearest hospital emergency department.</strong>
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 text-sm font-bold">3</span>
              Doctor-Patient Relationship & Clinical Autonomy
            </h2>
            <p className="text-sm">
              CuraLink provides secure video infrastructure, appointment scheduling, and digital records management. CuraLink is not a hospital and does not practice medicine. The clinical doctor-patient relationship is established strictly between you and the independent licensed physician you choose to consult.
            </p>
            <p className="text-sm">
              Attending physicians exercise independent medical judgment. A doctor may determine in their sole discretion that your condition is not suitable for telemedicine and advise an in-person physical examination.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 text-sm font-bold">4</span>
              Digital Prescriptions & Diagnostic Orders
            </h2>
            <p className="text-sm">
              Any electronic prescription issued on CuraLink is generated at the clinician&apos;s professional discretion based on the consultation. Doctors on the platform strictly adhere to Telemedicine Practice Guidelines, and specific prohibited substances (such as narcotics, psychotropic substances, and Schedule X pharmaceuticals) cannot and will not be prescribed via telehealth.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 text-sm font-bold">5</span>
              User Responsibilities & Platform Conduct
            </h2>
            <p className="text-sm">As a user of CuraLink, you agree to:</p>
            <ul className="space-y-2 text-sm list-disc pl-5">
              <li>Provide accurate, current, and complete personal and medical history information.</li>
              <li>Maintain the strict confidentiality of your account credentials and one-time codes.</li>
              <li>Not record audio, video, or screen captures of consultations without express mutual consent from the attending physician.</li>
              <li>Not use automated scripts, bots, or scraping tools on the platform (enforced via Cloudflare Turnstile).</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 text-sm font-bold">6</span>
              Fees, Payments & Billing
            </h2>
            <p className="text-sm">
              Consultation fees are displayed transparently before appointment confirmation. Payments are processed securely through licensed payment gateways (Razorpay). Service fees, if applicable, cover encrypted platform infrastructure and video room provisioning.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 border-t border-slate-100 dark:border-[#263049] pt-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9]">
              Questions Regarding Terms
            </h2>
            <p className="text-sm">
              If you have any questions or require clarification regarding these terms, please contact our legal and support team at{" "}
              <a href="mailto:support@curalink.health" className="text-teal-700 dark:text-teal-400 underline font-semibold">
                support@curalink.health
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
