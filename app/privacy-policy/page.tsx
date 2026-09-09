"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, FileText, CheckCircle2, AlertTriangle, Mail } from "lucide-react";

export default function PrivacyPolicyPage() {
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
            <Shield className="h-4 w-4" />
            <span>Legal & Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-[#F1F5F9] mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Last Updated: September 2026 • Operational Version 1.2
          </p>

          {/* Legal Draft Notice */}
          <div className="mt-6 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/80 dark:bg-amber-950/30 p-4 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200 mb-0.5">Notice to Users & Compliance Note</p>
              <p className="leading-relaxed">
                This document details CuraLink&apos;s active technical and operational privacy practices. Prior to live commercial deployment, this policy is subject to formal legal review in accordance with India&apos;s Digital Personal Data Protection (DPDP) Act 2023, the Information Technology Act 2000, and the Telemedicine Practice Guidelines.
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
              Introduction
            </h2>
            <p className="text-sm">
              CuraLink (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting the confidentiality, integrity, and security of your personal and health-related data. This Privacy Policy describes how we collect, store, process, and safeguard your data when you use our telehealth platform, AI symptom checker, appointment scheduling, and electronic health record services.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 text-sm font-bold">2</span>
              Information We Collect
            </h2>
            <p className="text-sm">We collect the following categories of information to provide secure telehealth services:</p>
            <ul className="space-y-2 text-sm list-disc pl-5">
              <li>
                <strong className="text-slate-900 dark:text-[#F1F5F9]">Personal Identification:</strong> Full name, email address, password hash, phone number, and Google OAuth identifier (if Google sign-in is chosen).
              </li>
              <li>
                <strong className="text-slate-900 dark:text-[#F1F5F9]">Clinical & Health Records:</strong> Symptoms provided during consultation or AI triage, electronic prescriptions, physician diagnostic notes, consultation history, and uploaded lab reports.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-[#F1F5F9]">Physician Credentials:</strong> Medical license registration numbers, issuing councils, specialization documents, and administrative verification status.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-[#F1F5F9]">Payment & Transaction Data:</strong> Razorpay order IDs, transaction signatures, and payment confirmation statuses. We do not store raw credit card numbers or banking CVVs directly on our servers.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-[#F1F5F9]">Technical & Security Data:</strong> IP address, device user-agent, session cookies (CSRF tokens, secure JWT tokens), and bot protection verification tokens (Cloudflare Turnstile).
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 text-sm font-bold">3</span>
              How We Use Your Information
            </h2>
            <p className="text-sm">We process your data exclusively for legitimate healthcare and operational purposes:</p>
            <ul className="space-y-2 text-sm list-disc pl-5">
              <li>Facilitating video consultations and clinical care between verified medical practitioners and patients.</li>
              <li>Generating and safely storing electronic prescriptions signed by attending clinicians.</li>
              <li>Operating automated AI triage to assist users in understanding symptom severity prior to clinical visits.</li>
              <li>Preventing automated abuse, credential stuffing, and bot attacks using Cloudflare Turnstile verification.</li>
              <li>Maintaining immutable audit logs for compliance, security investigation, and access control validation.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 text-sm font-bold">4</span>
              Security Architecture & Data Safeguards
            </h2>
            <p className="text-sm">
              We implement industry-standard safeguards designed to ensure clinical data protection:
            </p>
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              <div className="rounded-2xl border border-slate-200 dark:border-[#263049] bg-slate-50/70 dark:bg-[#1C2338]/60 p-4">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-[#F1F5F9] text-xs mb-1">
                  <Lock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  256-Bit AES Encryption
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Data in transit is secured with TLS 1.3 encryption. Sensitive fields are encrypted at rest using AES-256.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-[#263049] bg-slate-50/70 dark:bg-[#1C2338]/60 p-4">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-[#F1F5F9] text-xs mb-1">
                  <Shield className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  Role-Based Access Control
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Strict RBAC ensures only authorized clinicians and verified patients can access relevant medical records.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 text-sm font-bold">5</span>
              Third-Party Infrastructure
            </h2>
            <p className="text-sm">
              CuraLink integrates with select HIPAA-eligible and industry-recognized infrastructure providers:
            </p>
            <ul className="space-y-2 text-sm list-disc pl-5">
              <li><strong className="text-slate-900 dark:text-[#F1F5F9]">Daily.co:</strong> Real-time WebRTC audio/video consultations. Video streams are encrypted end-to-end and not recorded unless explicitly requested by the patient and doctor.</li>
              <li><strong className="text-slate-900 dark:text-[#F1F5F9]">Razorpay:</strong> Secure payment processing adhering to PCI-DSS Level 1 compliance.</li>
              <li><strong className="text-slate-900 dark:text-[#F1F5F9]">Cloudflare Turnstile:</strong> Privacy-preserving bot protection with zero third-party cross-site tracking cookies.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 text-sm font-bold">6</span>
              Your Rights (DPDP Act 2023)
            </h2>
            <p className="text-sm">
              In accordance with applicable privacy regulations, users retain full rights over their personal data:
            </p>
            <ul className="space-y-2 text-sm list-disc pl-5">
              <li><strong className="text-slate-900 dark:text-[#F1F5F9]">Right to Access:</strong> View and export your health records, prescriptions, and profile details anytime from your dashboard.</li>
              <li><strong className="text-slate-900 dark:text-[#F1F5F9]">Right to Correction:</strong> Update outdated profile details directly within account settings.</li>
              <li><strong className="text-slate-900 dark:text-[#F1F5F9]">Right to Data Erasure:</strong> Request permanent deletion or anonymization of non-mandatory medical records via our formal Data Erasure API.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 border-t border-slate-100 dark:border-[#263049] pt-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <Mail className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              Contact Our Grievance & Privacy Team
            </h2>
            <p className="text-sm">
              For questions regarding privacy, data erasure requests, or compliance inquiries:
            </p>
            <div className="rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-800/50 p-4 text-xs space-y-1">
              <p><strong className="text-slate-900 dark:text-[#F1F5F9]">Data Protection Officer:</strong> CuraLink Privacy Office</p>
              <p><strong className="text-slate-900 dark:text-[#F1F5F9]">Email:</strong> <a href="mailto:privacy@curalink.health" className="text-teal-700 dark:text-teal-400 underline font-semibold">privacy@curalink.health</a></p>
              <p><strong className="text-slate-900 dark:text-[#F1F5F9]">Response SLA:</strong> Inquiries are addressed within 48 business hours.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
