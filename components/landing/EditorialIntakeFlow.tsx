"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Stethoscope,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  FileText,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CaseStudy {
  id: string;
  tag: string;
  label: string;
  symptom: string;
  followUp: string[];
  triageGrade: "Low" | "Moderate" | "Urgent";
  recommendation: string;
  specialistType: string;
}

const CASES: CaseStudy[] = [
  {
    id: "case-1",
    tag: "CARDIOVASCULAR",
    label: "Episodic Palpitations",
    symptom: "Sudden onset of fluttering heartbeat during light work (lasting 15–20 minutes, 3 occurrences this week).",
    followUp: [
      "No chest pain or shortness of breath reported",
      "No syncopal (fainting) episodes",
      "Correlates with recent elevated caffeine intake",
    ],
    triageGrade: "Moderate",
    recommendation: "Non-emergent physician telemetry review + 12-lead ECG evaluation advised within 48 hours.",
    specialistType: "Cardiovascular Specialist",
  },
  {
    id: "case-2",
    tag: "NEUROLOGICAL",
    label: "Migraine with Aura",
    symptom: "Unilateral throbbing head pain preceded by geometric visual shimmering for 30 minutes.",
    followUp: [
      "Photophobia and phonophobia present",
      "Nausea without active emesis",
      "History of identical episodes triggered by poor sleep",
    ],
    triageGrade: "Low",
    recommendation: "Classical migraine presentation. Prescriptive triptan prophylaxis and lifestyle counseling.",
    specialistType: "Internal Medicine / Neurology",
  },
  {
    id: "case-3",
    tag: "DERMATOLOGY",
    label: "Erythematous Rash",
    symptom: "Pruritic annular rash on inner forearm following outdoor hiking, non-blanching margin.",
    followUp: [
      "No systemic fever or joint aches",
      "Lesion size expanded from 1cm to 3.5cm over 6 days",
      "Mild central clearing noted on inspection",
    ],
    triageGrade: "Moderate",
    recommendation: "Clinical evaluation for contact dermatitis vs. early localized erythema migrans.",
    specialistType: "Dermatologist",
  },
];

export function EditorialIntakeFlow() {
  const [activeCase, setActiveCase] = useState<CaseStudy>(CASES[0]);

  return (
    <section
      id="clinical-intake"
      className="relative bg-[#0A0F0D] text-[#F5F3EE] py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b border-white/10"
      aria-labelledby="intake-heading"
    >
      <div className="mx-auto max-w-7xl">
        {/* Asymmetric Header */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-end mb-16">
          <div className="lg:col-span-8">
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-semibold">
              [ 04 · Clinical Intake Framework ]
            </span>
            <h2
              id="intake-heading"
              className="mt-4 font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#F5F3EE] leading-[1.1]"
            >
              Intake designed like a{" "}
              <em className="font-serif italic font-normal text-emerald-300">clinical consultation</em>,
              not an AI chatbot.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-white/60 max-w-xl font-sans leading-relaxed">
              No conversational bots with emojis or hallucinated diagnoses. A deterministic medical intake protocol that gathers structured context, calculates triage urgency, and equips your doctor before you speak.
            </p>
          </div>

          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <Link
              href="/symptom-checker"
              className="group inline-flex items-center gap-2 rounded-full bg-[#085041] px-6 py-3 text-xs font-semibold text-white border border-emerald-400/40 hover:border-emerald-300 transition-all shadow-xs"
            >
              <span>Test Clinical Intake</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Interactive Case Selector & Telemetry Dossier View */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Case Navigation Tabs (Col 4) */}
          <div className="lg:col-span-4 space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-wider text-white/40 mb-3">
              Select Sample Protocol Scenario:
            </p>

            {CASES.map((item) => {
              const isSelected = activeCase.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveCase(item)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all text-xs ${
                    isSelected
                      ? "bg-white/10 border-emerald-400/50 shadow-md text-white"
                      : "bg-white/[0.02] border-white/10 hover:bg-white/5 text-white/70"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">
                      {item.tag}
                    </span>
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
                        item.triageGrade === "Urgent"
                          ? "bg-rose-950 text-rose-300 border border-rose-800"
                          : item.triageGrade === "Moderate"
                          ? "bg-amber-950/80 text-amber-300 border border-amber-800/60"
                          : "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                      }`}
                    >
                      {item.triageGrade} Urgency
                    </span>
                  </div>
                  <p className="font-medium text-sm text-white">{item.label}</p>
                </button>
              );
            })}
          </div>

          {/* Rendered Clinical Dossier Preview (Col 8) */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-white/15 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-md shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                    <ClipboardCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-normal text-white">
                      Structured Intake Dossier
                    </h3>
                    <p className="font-mono text-[10px] text-white/40">
                      Auto-transmitted to assigned physician
                    </p>
                  </div>
                </div>

                <span className="font-mono text-xs text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 px-3 py-1 rounded-full">
                  Status: Doctor Ready
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCase.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5 text-xs font-sans"
                >
                  {/* Reported Chief Complaint */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                      Primary Complaint &amp; Timeline
                    </p>
                    <p className="text-white text-sm leading-relaxed">
                      {activeCase.symptom}
                    </p>
                  </div>

                  {/* Clarifying Clinical Questions */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                      Targeted Protocol Inquiries
                    </p>
                    <ul className="space-y-1.5">
                      {activeCase.followUp.map((point) => (
                        <li key={point} className="flex items-start gap-2 text-white/80">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action & Specialist Recommendation */}
                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-300">
                        Recommended Specialist Routing
                      </p>
                      <p className="text-sm font-semibold text-white mt-0.5">
                        {activeCase.specialistType}
                      </p>
                      <p className="text-[11px] text-white/60 mt-1 max-w-md">
                        {activeCase.recommendation}
                      </p>
                    </div>

                    <Link
                      href="/find-doctor"
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#085041] px-4 py-2 text-xs font-semibold text-white border border-emerald-400/40 hover:bg-emerald-800 transition-colors"
                    >
                      <span>Connect with MD</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Disclaimer */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] text-white/40">
                <AlertCircle className="h-3.5 w-3.5 text-white/50 shrink-0" />
                <span>
                  Informational triage context only. Physician makes all clinical diagnostic and prescribing decisions.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
