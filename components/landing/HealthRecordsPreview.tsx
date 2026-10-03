"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Calendar,
  Pill,
  Activity,
  Download,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  Printer,
  Maximize2,
  X,
  Stethoscope,
  HeartPulse,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  PrescriptionDocument,
  SAMPLE_REALISTIC_PRESCRIPTION,
} from "@/components/records/PrescriptionDocument";

const RECORD_MODULES = [
  {
    icon: Pill,
    title: "Official Digital Prescriptions",
    description: "Authentic NMC-compliant e-prescriptions with precise meal schedules, dosage timings, and pharmacy verification.",
  },
  {
    icon: Activity,
    title: "Diagnostic & Lab Panels",
    description: "Blood tests, lipid panels, pathology reports, and imaging documents indexed with normal/alert ranges.",
  },
  {
    icon: FileText,
    title: "Clinical Consultation Notes",
    description: "Physician SOAP notes, differential diagnoses, and longitudinal care roadmaps stored securely.",
  },
  {
    icon: Calendar,
    title: "Consultation Timelines",
    description: "Chronological encounter history linking each prescription with its attending doctor.",
  },
];

export function HealthRecordsPreview() {
  const [activeTab, setActiveTab] = useState<"rx" | "lab" | "notes">("rx");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleSimulatedDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 2500);
  };

  return (
    <section
      id="records"
      className="px-4 sm:px-6 py-20 bg-[#F5F7F6] dark:bg-[#0B1120] border-b border-[#E2E8F0] dark:border-slate-800"
      aria-labelledby="records-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Context & Core Pillars */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0D9488] dark:text-[#14B8A6]">
              Personal Health Records & Vault
            </span>
            <h2
              id="records-heading"
              className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-white"
            >
              Real digital prescriptions, unified and private.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              No lost slips or scribbled illegible notes. Every consultation automatically generates a
              verifiable, authentic digital prescription with full pharmacological details, QR authentication,
              and tamper-proof archival.
            </p>

            {/* Modules list */}
            <div className="mt-6 space-y-3.5">
              {RECORD_MODULES.map((mod) => {
                const Icon = mod.icon;
                return (
                  <div key={mod.title} className="flex items-start gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] shrink-0 mt-0.5 border border-teal-200/50 dark:border-teal-800/40">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A] dark:text-white">
                        {mod.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                        {mod.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild className="bg-[#0D9488] hover:bg-[#0F766E] text-white px-6 py-2.5 rounded-lg shadow-xs font-medium">
                <Link href="/records" className="inline-flex items-center gap-2">
                  <span>Open Records Vault</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D9488] hover:text-[#0F766E] transition-colors cursor-pointer"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Inspect Full Rx Slip</span>
              </button>
            </div>
          </motion.div>

          {/* Right Column: Realistic Interactive Medical Prescription Slip */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          >
            {/* Realistic Prescription Document Container */}
            <div className="relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#151B2E] shadow-lg overflow-hidden">
              {/* Document Type Switcher Tabs */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("rx")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "rx"
                        ? "bg-white dark:bg-[#151B2E] text-[#0D9488] shadow-xs border border-slate-200/60 dark:border-slate-700"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    ℞ E-Prescription Slip
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("lab")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "lab"
                        ? "bg-white dark:bg-[#151B2E] text-[#0D9488] shadow-xs border border-slate-200/60 dark:border-slate-700"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Lab Diagnostic Panel
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("notes")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "notes"
                        ? "bg-white dark:bg-[#151B2E] text-[#0D9488] shadow-xs border border-slate-200/60 dark:border-slate-700"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Doctor SOAP Notes
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200/60">
                    <CheckCircle2 className="h-3 w-3" />
                    ABDM Verified
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Expand View"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Tab 1: Realistic E-Prescription Document */}
              {activeTab === "rx" && (
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Doctor & Clinic Letterhead */}
                  <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0D9488] text-white font-black text-xs">
                          Rx
                        </span>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                            CuraLink Telehealth Network
                          </h4>
                          <p className="text-[10px] text-slate-400">
                            Partner Center: Indiranagar, Bengaluru
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5">
                        <h5 className="text-sm font-bold text-[#0D9488] dark:text-teal-400">
                          Dr. Priya Sharma, MD (AIIMS)
                        </h5>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          Senior Consultant Physician · Reg: KMC-84920/2018
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-xs space-y-1">
                      <span className="inline-block font-mono text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] dark:text-teal-300 px-2 py-0.5 rounded border border-teal-200/60">
                        Rx ID: CL-2026-88219
                      </span>
                      <p className="text-[11px] text-slate-500">30 Sep 2026 · 10:30 AM</p>
                      <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        NMC 2020 Compliant ✓
                      </p>
                    </div>
                  </div>

                  {/* Patient Vitals Ribbon */}
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-[#F9FAFB] dark:bg-slate-900/60 p-3 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Patient
                        </span>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          Aarav Sharma (29/M)
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Vitals
                        </span>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">
                          BP 120/80 · SpO2 99%
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Diagnosis
                        </span>
                        <p className="font-bold text-[#0D9488] dark:text-teal-400 truncate">
                          Acute URTI (J06.9)
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Allergies
                        </span>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                          NKDA (None)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Prescribed Medications Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                      <span className="flex items-center gap-1.5">
                        <span className="font-serif text-base font-black text-[#0D9488]">℞</span>
                        <span>Medications Schedule</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        4 Prescribed Items
                      </span>
                    </div>

                    <div className="space-y-2">
                      {/* Med 1 */}
                      <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 p-2.5 text-xs flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                            <span>Tab. Augmentin 625 Duo</span>
                            <span className="text-[10px] font-normal text-slate-400">
                              (Amox 500 + Clav 125)
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            1 Tab · Oral · 5 Days · Finish complete course
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] dark:text-teal-300 font-mono font-bold text-[11px] border border-teal-200/60">
                            1 - 0 - 1
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">After Food</p>
                        </div>
                      </div>

                      {/* Med 2 */}
                      <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 p-2.5 text-xs flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                            <span>Syp. Ascoril-D Plus</span>
                            <span className="text-[10px] font-normal text-slate-400">
                              (Dry Cough)
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            5 ml · Oral · 5 Days · May cause mild drowsiness
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] dark:text-teal-300 font-mono font-bold text-[11px] border border-teal-200/60">
                            1 - 1 - 1
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">After Food</p>
                        </div>
                      </div>

                      {/* Med 3 */}
                      <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 p-2.5 text-xs flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                            <span>Tab. Pan-D</span>
                            <span className="text-[10px] font-normal text-slate-400">
                              (Antacid protection)
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            1 Cap · Oral · 5 Days
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] dark:text-teal-300 font-mono font-bold text-[11px] border border-teal-200/60">
                            1 - 0 - 0
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">Empty Stomach</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Signature, Stamp & Pharmacy QR */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                        <QrCode className="h-7 w-7 text-slate-800 dark:text-slate-200" />
                      </div>
                      <div className="text-[10px]">
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          Pharmacy Scannable QR
                        </p>
                        <p className="text-slate-400 font-mono">SHA-256 Validated</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-serif italic text-base font-bold text-[#0D9488] dark:text-teal-400">
                        Dr. Priya Sharma
                      </div>
                      <p className="text-[9px] text-slate-400 uppercase font-semibold">
                        Digitally Signed & Validated
                      </p>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#0D9488] transition-colors cursor-pointer"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span>View Full Letterhead Document</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSimulatedDownload}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      {downloadSuccess ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Downloaded PDF!</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5" />
                          <span>Download Rx PDF</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Lab Diagnostics Panel */}
              {activeTab === "lab" && (
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-900 dark:text-white">
                        Complete Metabolic Panel (CMP)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Diagnostic Lab Services · Specimen: Blood Serum
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200">
                      Normal Range Verified
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Fasting Blood Glucose</p>
                        <p className="text-[10px] text-slate-400">Ref: 70 - 99 mg/dL</p>
                      </div>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        88 mg/dL (Normal)
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Serum Creatinine</p>
                        <p className="text-[10px] text-slate-400">Ref: 0.7 - 1.2 mg/dL</p>
                      </div>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        0.9 mg/dL (Optimal)
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">C-Reactive Protein (hs-CRP)</p>
                        <p className="text-[10px] text-slate-400">Ref: &lt; 3.0 mg/L</p>
                      </div>
                      <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                        1.4 mg/L (Normal)
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 text-right">
                    <Link
                      href="/records"
                      className="text-xs font-semibold text-[#0D9488] hover:underline"
                    >
                      View All Pathology Reports →
                    </Link>
                  </div>
                </div>
              )}

              {/* Tab 3: Consultation SOAP Notes */}
              {activeTab === "notes" && (
                <div className="p-5 sm:p-6 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-900 dark:text-white">
                        Physician Clinical SOAP Note
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Author: Dr. Priya Sharma, MD · Encrypted Record
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      Signed Off
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    <p>
                      <strong className="text-slate-900 dark:text-white">Subjective:</strong> 29-year-old
                      male presents with a 3-day history of non-productive cough, sore throat, and
                      malaise. Denies dyspnea, chest discomfort, or anosmia.
                    </p>
                    <p>
                      <strong className="text-slate-900 dark:text-white">Objective:</strong> Telehealth video
                      assessment. Patient is comfortable at rest. Pharyngeal mucosal erythema observed.
                      No cervical lymphadenopathy noted on guided self-palpation.
                    </p>
                    <p>
                      <strong className="text-slate-900 dark:text-white">Assessment:</strong> Acute viral
                      upper respiratory tract infection with secondary tracheobronchial irritation.
                    </p>
                    <p>
                      <strong className="text-slate-900 dark:text-white">Plan:</strong> Supportive therapy,
                      oral hydration, targeted symptom relief. Follow-up in 5 days or SOS.
                    </p>
                  </div>

                  <div className="pt-2 text-right">
                    <Link
                      href="/records"
                      className="text-xs font-semibold text-[#0D9488] hover:underline"
                    >
                      Browse Full Consultation History →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── FULL-SCREEN PRESCRIPTION INSPECTOR MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#0F172A] p-2 sm:p-4 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="p-2 sm:p-4">
                <PrescriptionDocument
                  prescription={SAMPLE_REALISTIC_PRESCRIPTION}
                  onDownloadPdf={handleSimulatedDownload}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
