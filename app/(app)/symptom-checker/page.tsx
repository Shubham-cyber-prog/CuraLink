"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  HeartPulse,
  Info,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface SymptomAnalysis {
  urgencyLevel: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
  triageCategory: "GREEN" | "YELLOW" | "RED";
  summary: string;
  possibleCauses: string[];
  recommendedAction: string;
  suggestBooking: boolean;
  disclaimer?: string;
  isEmergency?: boolean;
}

export default function SymptomCheckerPage() {
  const shouldReduceMotion = useReducedMotion();

  // Multi-step assessment state: 1 = Symptoms, 2 = Clarifying Questions, 3 = Assessment
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Symptoms Intake
  const [primarySymptoms, setPrimarySymptoms] = useState("");
  const [duration, setDuration] = useState("a-few-days");
  const [severity, setSeverity] = useState<"mild" | "moderate" | "severe">("moderate");

  // Step 2: Clinical Context
  const [associatedFever, setAssociatedFever] = useState<"no" | "mild" | "high">("no");
  const [existingConditions, setExistingConditions] = useState("");

  // Step 3: Analysis Result
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);

  const handleRunAssessment = async () => {
    if (!primarySymptoms.trim()) {
      setError("Please describe your symptoms to begin clinical triage.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Build synthesized clinical query
    const durationLabel =
      duration === "today"
        ? "started today"
        : duration === "a-few-days"
        ? "lasting 2-3 days"
        : duration === "weeks"
        ? "lasting multiple weeks"
        : "chronic (over a month)";

    const feverLabel =
      associatedFever === "high"
        ? "with high fever"
        : associatedFever === "mild"
        ? "with low-grade fever"
        : "no fever";

    const fullMessage = `${primarySymptoms.trim()}. Duration: ${durationLabel}. Severity: ${severity}. Fever: ${feverLabel}.${
      existingConditions.trim() ? ` Prior medical history: ${existingConditions.trim()}.` : ""
    }`;

    try {
      const res = await fetch("/api/symptoms/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: fullMessage,
          messages: [{ role: "user", content: fullMessage }],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Unable to complete clinical triage assessment.");
      }

      const result = data.data || data;
      setAnalysis(result);
      setStep(3);
    } catch (err: any) {
      console.error("Symptom assessment error:", err);
      setError(err.message || "Failed to reach clinical evaluation service. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setPrimarySymptoms("");
    setDuration("a-few-days");
    setSeverity("moderate");
    setAssociatedFever("no");
    setExistingConditions("");
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-3xl py-6 px-4 sm:px-6 space-y-6">
      {/* Top Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-[#0D9488] dark:text-[#14B8A6] uppercase tracking-wider">
                Clinical Triage Tool
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Symptom Assessment &amp; Triage
            </h1>
          </div>

          <Badge variant="info">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
            <span>Encrypted &amp; Confidential</span>
          </Badge>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Answer a few clinical questions to evaluate urgency, explore possible explanations, and connect with the right medical specialist.
        </p>

        {/* Step Progression Bar */}
        <div className="grid grid-cols-3 gap-2 mt-5">
          {[
            { num: 1, label: "1. Primary Symptoms" },
            { num: 2, label: "2. Clinical Context" },
            { num: 3, label: "3. Triage & Guidance" },
          ].map((s) => (
            <div
              key={s.num}
              className={`rounded-lg border p-2 text-xs font-medium transition-colors ${
                step === s.num
                  ? "border-[#0D9488] bg-teal-50/60 dark:bg-teal-950/40 text-[#0D9488] dark:text-[#14B8A6] font-semibold"
                  : step > s.num
                  ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 text-emerald-800 dark:text-emerald-300"
                  : "border-slate-200 dark:border-slate-800 text-slate-400"
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Primary complaint */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
              <label className="text-sm font-semibold text-slate-900 dark:text-white block">
                What are your main symptoms?
              </label>
              <textarea
                value={primarySymptoms}
                onChange={(e) => setPrimarySymptoms(e.target.value)}
                placeholder="e.g. Throbbing pain behind my forehead and eyes since yesterday morning, sensitive to bright light."
                rows={4}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
              />
              <p className="text-[11px] text-slate-400">
                Please include where you feel discomfort and how it started.
              </p>
            </div>

            {/* Duration */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
              <label className="text-sm font-semibold text-slate-900 dark:text-white block">
                How long have these symptoms persisted?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: "today", label: "Started Today" },
                  { key: "a-few-days", label: "2 - 3 Days" },
                  { key: "weeks", label: "1 - 3 Weeks" },
                  { key: "chronic", label: "Over a Month" },
                ].map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setDuration(d.key)}
                    className={`rounded-xl p-3 text-xs font-medium border text-center transition-colors cursor-pointer ${
                      duration === d.key
                        ? "border-[#0D9488] bg-teal-50 dark:bg-teal-950/50 text-[#0D9488] dark:text-[#14B8A6] font-semibold"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity scale */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
              <label className="text-sm font-semibold text-slate-900 dark:text-white block">
                How would you rate the intensity?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "mild", label: "Mild", desc: "Noticeable but doesn't interrupt daily routine" },
                  { key: "moderate", label: "Moderate", desc: "Disrupts focus, work, or sleep" },
                  { key: "severe", label: "Severe", desc: "Significant pain or intense discomfort" },
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSeverity(s.key as any)}
                    className={`rounded-xl p-3 text-left border transition-colors cursor-pointer ${
                      severity === s.key
                        ? "border-[#0D9488] bg-teal-50 dark:bg-teal-950/50 text-[#0D9488] dark:text-[#14B8A6]"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <p className="text-xs font-semibold">{s.label}</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => {
                  if (!primarySymptoms.trim()) {
                    setError("Please describe your symptoms before proceeding.");
                    return;
                  }
                  setError(null);
                  setStep(2);
                }}
                className="bg-[#0D9488] hover:bg-[#0F766E] text-white"
              >
                <span>Continue to Clinical Details</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Fever check */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
              <label className="text-sm font-semibold text-slate-900 dark:text-white block">
                Do you have a fever or elevated temperature?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "no", label: "No Fever", desc: "Normal body temperature" },
                  { key: "mild", label: "Low-Grade Fever", desc: "Under 101°F (38.3°C)" },
                  { key: "high", label: "High Fever", desc: "Over 101°F (38.3°C) or chills" },
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setAssociatedFever(f.key as any)}
                    className={`rounded-xl p-3 text-left border transition-colors cursor-pointer ${
                      associatedFever === f.key
                        ? "border-[#0D9488] bg-teal-50 dark:bg-teal-950/50 text-[#0D9488] dark:text-[#14B8A6]"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <p className="text-xs font-semibold">{f.label}</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Medical context */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
              <label className="text-sm font-semibold text-slate-900 dark:text-white block">
                Relevant Medical History or Medications (Optional)
              </label>
              <textarea
                value={existingConditions}
                onChange={(e) => setExistingConditions(e.target.value)}
                placeholder="e.g. Asthma, hypertension, taking daily antihistamines, or pregnant."
                rows={3}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)} disabled={isLoading}>
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>

              <Button
                onClick={handleRunAssessment}
                disabled={isLoading}
                className="bg-[#0D9488] hover:bg-[#0F766E] text-white px-6 font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    <span>Analyzing Clinical Profile...</span>
                  </>
                ) : (
                  <span>Generate Assessment</span>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && analysis && (
          <motion.div
            key="step3"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Triage Card */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-xs">
              {/* Urgency Badge Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Clinical Triage Evaluation
                  </span>
                  <div className="flex items-center gap-2">
                    {(analysis.urgencyLevel === "EMERGENCY" || analysis.isEmergency) && (
                      <Badge variant="emergency">🚨 Emergency · Immediate Care Required</Badge>
                    )}
                    {analysis.urgencyLevel !== "EMERGENCY" && !analysis.isEmergency && analysis.triageCategory === "GREEN" && (
                      <Badge variant="verified">Green · Routine Care / Low Urgency</Badge>
                    )}
                    {analysis.urgencyLevel !== "EMERGENCY" && !analysis.isEmergency && analysis.triageCategory === "YELLOW" && (
                      <Badge variant="pending">Yellow · Consultation Recommended</Badge>
                    )}
                    {analysis.urgencyLevel !== "EMERGENCY" && !analysis.isEmergency && analysis.triageCategory === "RED" && (
                      <Badge variant="emergency">Red · Urgent Clinical Attention Advised</Badge>
                    )}
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={handleReset} className="self-start sm:self-auto">
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  New Assessment
                </Button>
              </div>

              {/* Clinical Summary */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Clinical Summary
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {analysis.summary}
                </p>
              </div>

              {/* Possible Explanations */}
              {analysis.possibleCauses && analysis.possibleCauses.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Possible Explanations to Discuss with a Clinician
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {analysis.possibleCauses.map((cause, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3 text-xs font-medium text-slate-800 dark:text-slate-200"
                      >
                        <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0 mt-0.5" />
                        <span>{cause}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Action */}
              <div className="pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Recommended Action Plan
                </h3>
                <p className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed">
                  {analysis.recommendedAction}
                </p>
              </div>

              {/* Connect with Doctor Banner */}
              <div className="rounded-xl border border-teal-200 dark:border-teal-800/80 bg-teal-50/60 dark:bg-teal-950/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D9488] text-white shrink-0">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Speak with a Licensed Doctor
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Share this triage summary directly with a specialist over video consultation.
                    </p>
                  </div>
                </div>

                <Button asChild className="bg-[#0D9488] hover:bg-[#0F766E] text-white shrink-0">
                  <Link href="/find-doctor">Browse Verified Doctors</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prominent Medical Disclaimer Banner */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex items-start gap-3">
        <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
            Clinical Information Disclaimer
          </span>
          This tool provides informational guidance and does not replace professional medical evaluation. It does not prescribe medications. For life-threatening emergencies, chest pain, or severe breathing difficulties, immediately contact local emergency services (112 / 911).
        </div>
      </div>
    </div>
  );
}
