"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  FileText,
  Sparkles,
  CheckCircle2,
  Loader2,
  Pill,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

interface MedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface QuickRxModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientMeta?: string;
  existingPrescription?: any;
  onSuccess: () => void;
}

const RX_TEMPLATES = [
  {
    label: "Hypertension / Cardiac",
    diagnosis: "Essential Hypertension & Preventive Cardiac Care (ICD-10: I10)",
    notes: "Low-sodium DASH diet (<5g salt/day). Monitor home BP morning & evening. 30-min brisk walk daily.",
    meds: [
      { name: "Tab. Telma 40", dosage: "40 mg", frequency: "1-0-0 (Morning)", duration: "30 days", instructions: "Take with water after breakfast" },
      { name: "Tab. Ecosprin AV 75/20", dosage: "75mg / 20mg", frequency: "0-0-1 (Night)", duration: "30 days", instructions: "Take after dinner" },
    ],
  },
  {
    label: "Type 2 Diabetes",
    diagnosis: "Type 2 Diabetes Mellitus - Glycemic Control (ICD-10: E11.9)",
    notes: "Low glycemic index diet. Avoid refined sugars. Repeat Fasting & PP Blood Sugar + HbA1c after 6 weeks.",
    meds: [
      { name: "Tab. Glycomet-GP 1", dosage: "1mg / 500mg", frequency: "1-0-0 (Before Breakfast)", duration: "30 days", instructions: "Take 15 mins prior to breakfast" },
      { name: "Tab. Neurobion Forte", dosage: "1 tab", frequency: "0-1-0 (After Lunch)", duration: "30 days", instructions: "Nerve support supplement" },
    ],
  },
  {
    label: "Acute Viral / URTI",
    diagnosis: "Acute Upper Respiratory Tract Infection & Pharyngitis (ICD-10: J06.9)",
    notes: "Warm saline gargles 3x/day, steam inhalation, adequate oral fluids & rest.",
    meds: [
      { name: "Tab. Augmentin 625 Duo", dosage: "625 mg", frequency: "1-0-1 (After Food)", duration: "5 days", instructions: "Complete full 5-day course" },
      { name: "Tab. Dolo 650", dosage: "650 mg", frequency: "SOS (Max 3/day)", duration: "3 days", instructions: "Only if fever > 100°F or body ache" },
      { name: "Tab. Pan-D", dosage: "40 mg", frequency: "1-0-0 (Empty Stomach)", duration: "5 days", instructions: "Before breakfast" },
    ],
  },
  {
    label: "Hypothyroidism",
    diagnosis: "Primary Hypothyroidism - Maintenance (ICD-10: E03.9)",
    notes: "Repeat Free T3, T4, TSH panel after 8 weeks. Keep 45 min gap before tea/coffee.",
    meds: [
      { name: "Tab. Thyronorm 50mcg", dosage: "50 mcg", frequency: "1-0-0 (Empty Stomach)", duration: "60 days", instructions: "Take immediately upon waking" },
      { name: "Cap. Uprise-D3 60K", dosage: "60,000 IU", frequency: "Once Weekly", duration: "8 weeks", instructions: "Take after dinner with warm milk" },
    ],
  },
];

export function QuickRxModal({
  isOpen,
  onClose,
  appointmentId,
  patientId,
  patientName,
  patientMeta,
  existingPrescription,
  onSuccess,
}: QuickRxModalProps) {
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medications, setMedications] = useState<MedicationItem[]>([
    { name: "", dosage: "", frequency: "1-0-1 (After Food)", duration: "5 days", instructions: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (existingPrescription) {
      setDiagnosis(existingPrescription.diagnosis || "");
      setNotes(existingPrescription.notes || "");
      try {
        const parsed =
          typeof existingPrescription.medications === "string"
            ? JSON.parse(existingPrescription.medications)
            : existingPrescription.medications;
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMedications(parsed);
          return;
        }
      } catch {
        // Fallback below
      }
    }
    setDiagnosis("");
    setNotes("");
    setMedications([
      { name: "", dosage: "", frequency: "1-0-1 (After Food)", duration: "5 days", instructions: "" },
    ]);
  }, [isOpen, existingPrescription]);

  const applyTemplate = (tpl: (typeof RX_TEMPLATES)[number]) => {
    setDiagnosis(tpl.diagnosis);
    setNotes(tpl.notes);
    setMedications(tpl.meds.map((m) => ({ ...m })));
    setError(null);
  };

  const updateMed = (index: number, field: keyof MedicationItem, value: string) => {
    setMedications((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const addMedRow = () => {
    setMedications((prev) => [
      ...prev,
      { name: "", dosage: "", frequency: "1-0-1 (After Food)", duration: "5 days", instructions: "" },
    ]);
  };

  const removeMedRow = (index: number) => {
    if (medications.length <= 1) return;
    setMedications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!diagnosis.trim()) {
      setError("Please enter a clinical diagnosis.");
      return;
    }

    const validMeds = medications.filter((m) => m.name.trim().length > 0);
    if (validMeds.length === 0) {
      setError("Please add at least one medication.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post("/doctor/me/prescriptions", {
        appointmentId,
        patientId,
        diagnosis: diagnosis.trim(),
        medications: validMeds,
        notes: notes.trim() || undefined,
      });

      if (res?.success) {
        onSuccess();
        onClose();
      } else {
        setError(res?.message || "Failed to save prescription.");
      }
    } catch (err: any) {
      setError(err?.message || "Error issuing prescription. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0B1F33]/60 backdrop-blur-sm"
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1F33] shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1F33]/95 backdrop-blur-md px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#006D77] to-[#0D9488] text-white flex items-center justify-center shadow-sm">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0B1F33] dark:text-white">
                    {existingPrescription ? "Update Digital e-Prescription" : "Issue Digital e-Prescription"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Patient: <strong className="text-slate-800 dark:text-slate-200">{patientName}</strong>
                    {patientMeta ? ` · ${patientMeta}` : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Quick Indian Clinical Templates */}
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#006D77] dark:text-[#83C5BE] mb-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>1-Click Clinical Templates</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {RX_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.label}
                      type="button"
                      onClick={() => applyTemplate(tpl)}
                      className="rounded-lg border border-teal-200 dark:border-teal-800/70 bg-teal-50/70 dark:bg-teal-950/40 px-3 py-1.5 text-xs font-semibold text-[#006D77] dark:text-[#83C5BE] hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors cursor-pointer"
                    >
                      + {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-3 text-xs font-medium text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Diagnosis */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Clinical Diagnosis & ICD-10 Code *
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Essential Hypertension - Stage 1 (ICD-10: I10)"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#112a44] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006D77]"
                  required
                />
              </div>

              {/* Medications List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Pill className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
                    <span>Rx Medications ({medications.length})</span>
                  </label>
                  <button
                    type="button"
                    onClick={addMedRow}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Medicine
                  </button>
                </div>

                <div className="space-y-2.5">
                  {medications.map((med, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-[#112a44]/60 p-3 space-y-2.5"
                    >
                      <div className="grid sm:grid-cols-12 gap-2.5">
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            value={med.name}
                            onChange={(e) => updateMed(idx, "name", e.target.value)}
                            placeholder="Medicine name (e.g. Tab. Telma 40)"
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1F33] px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#006D77]"
                            required
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={(e) => updateMed(idx, "dosage", e.target.value)}
                            placeholder="Dosage (40 mg)"
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1F33] px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#006D77]"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <input
                            type="text"
                            value={med.frequency}
                            onChange={(e) => updateMed(idx, "frequency", e.target.value)}
                            placeholder="1-0-1 (After Food)"
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1F33] px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#006D77]"
                          />
                        </div>
                        <div className="sm:col-span-2 flex items-center gap-1.5">
                          <input
                            type="text"
                            value={med.duration}
                            onChange={(e) => updateMed(idx, "duration", e.target.value)}
                            placeholder="5 days"
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1F33] px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#006D77]"
                          />
                          {medications.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMedRow(idx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer shrink-0"
                              title="Remove medicine"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={med.instructions}
                        onChange={(e) => updateMed(idx, "instructions", e.target.value)}
                        placeholder="Special instructions (e.g. Take with warm water after dinner)"
                        className="w-full rounded-lg border border-slate-200/70 dark:border-slate-700/60 bg-white/80 dark:bg-[#0B1F33]/80 px-3 py-1.5 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#006D77]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Advice & Follow-Up */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Clinical Advice, Diet & Follow-Up Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Lifestyle advice, lab investigations recommended, red-flag precautions..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#112a44] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006D77]"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Digitally signed & immediately synced to Patient Health Vault.
                </p>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#006D77] to-[#0D9488] hover:brightness-110 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing & Issuing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Sign & Issue e-Prescription
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
