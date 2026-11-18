"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  Heart,
  Activity,
  Droplets,
  Thermometer,
  Wind,
  FileText,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Phone,
  Mail,
  ExternalLink,
  Sparkles,
  Pill,
  Scale,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

interface QuickPatientChartDrawerProps {
  patientId: string | null;
  onClose: () => void;
  onWriteRx?: (apptId: string, patientId: string, patientName: string, existingRx?: any) => void;
}

export function QuickPatientChartDrawer({
  patientId,
  onClose,
  onWriteRx,
}: QuickPatientChartDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;
    let active = true;
    setLoading(true);
    setError(null);
    api
      .get(`/doctor/me/patients/${patientId}`)
      .then((res) => {
        if (!active) return;
        if (res?.success && res.data) {
          setData(res.data);
        } else {
          setError(res?.message || "Failed to load patient chart");
        }
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.message || "Unable to fetch patient EHR");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [patientId]);

  const patient = data?.patient;
  const latestVitals = data?.vitalsHistory?.[0] || null;
  const consultations = data?.consultations || [];
  const prescriptions = data?.prescriptions || [];
  const aiInsights = data?.aiVitalsInsights || null;

  return (
    <AnimatePresence>
      {patientId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0B1F33]/50 backdrop-blur-xs"
          />

          {/* Slide-over Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative z-10 w-full max-w-xl h-full bg-white dark:bg-[#0B1F33] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50/70 dark:bg-[#071320]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#006D77] to-[#0B1F33] text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm">
                  {patient?.name ? patient.name.charAt(0).toUpperCase() : "P"}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {loading ? "Loading Clinical Chart..." : patient?.name || "Patient Chart"}
                    </h2>
                    {patient?.trustCard?.phoneVerified && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Verified
                      </span>
                    )}
                  </div>
                  {patient && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {patient.age ? `${patient.age} yrs` : "Age N/A"} · {patient.gender || "Not specified"} ·{" "}
                      {consultations.length} clinical {consultations.length === 1 ? "visit" : "visits"}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                  <Loader2 className="h-7 w-7 animate-spin text-[#006D77]" />
                  <p className="text-xs font-medium">Retrieving encrypted EHR & vitals history...</p>
                </div>
              ) : error ? (
                <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4 text-xs text-red-700 dark:text-red-300">
                  {error}
                </div>
              ) : (
                <>
                  {/* Contact Info Row */}
                  <div className="flex flex-wrap gap-3 text-xs">
                    {patient?.phone && (
                      <a
                        href={`tel:${patient.phone}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112a44] px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:border-[#006D77] transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
                        {patient.phone}
                      </a>
                    )}
                    {patient?.email && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112a44] px-3 py-1.5 text-slate-600 dark:text-slate-300">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {patient.email}
                      </span>
                    )}
                  </div>

                  {/* Latest Recorded Vitals Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
                        Latest Clinical Vitals
                      </h3>
                      {latestVitals?.date && (
                        <span className="text-[11px] text-slate-400">Logged {latestVitals.date}</span>
                      )}
                    </div>

                    {latestVitals ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#112a44]/60 p-3">
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Heart className="h-3 w-3 text-rose-500" /> Blood Pressure
                          </span>
                          <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                            {latestVitals.bloodPressure || "—"}
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#112a44]/60 p-3">
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Activity className="h-3 w-3 text-[#006D77]" /> Heart Rate
                          </span>
                          <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                            {latestVitals.heartRate || "—"}
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#112a44]/60 p-3">
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Wind className="h-3 w-3 text-sky-500" /> SpO2
                          </span>
                          <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                            {latestVitals.spO2 || "—"}
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#112a44]/60 p-3">
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Droplets className="h-3 w-3 text-amber-500" /> Blood Glucose
                          </span>
                          <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                            {latestVitals.bloodGlucose || "—"}
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#112a44]/60 p-3">
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Thermometer className="h-3 w-3 text-orange-500" /> Temp
                          </span>
                          <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                            {latestVitals.temperature || "—"}
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#112a44]/60 p-3">
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Scale className="h-3 w-3 text-indigo-500" /> Weight
                          </span>
                          <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                            {latestVitals.weight || "—"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-4 text-center text-xs text-slate-500">
                        No vitals logged by this patient yet.
                      </div>
                    )}
                  </div>

                  {/* AI Clinical Insights */}
                  {aiInsights && (
                    <div className="rounded-2xl border border-teal-200/80 dark:border-teal-800/60 bg-gradient-to-br from-teal-50/80 to-white dark:from-[#082933] dark:to-[#0B1F33] p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006D77] dark:text-[#83C5BE]">
                          <Sparkles className="h-3.5 w-3.5" />
                          AI Clinical Vitals Triage
                        </span>
                        {aiInsights.overallStatus && (
                          <span className="rounded-full bg-white dark:bg-[#0B1F33] border border-teal-200 dark:border-teal-700 px-2 py-0.5 text-[10px] font-bold text-[#006D77] dark:text-[#83C5BE]">
                            {aiInsights.overallStatus}
                          </span>
                        )}
                      </div>
                      {aiInsights.summary && (
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {aiInsights.summary}
                        </p>
                      )}
                      {Array.isArray(aiInsights.alerts) && aiInsights.alerts.length > 0 && (
                        <div className="space-y-1 pt-1">
                          {aiInsights.alerts.slice(0, 3).map((alert: any, i: number) => (
                            <div
                              key={i}
                              className="flex items-start gap-1.5 text-[11px] text-amber-800 dark:text-amber-300"
                            >
                              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
                              <span>{typeof alert === "string" ? alert : alert.message || alert.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Prescriptions History */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
                      Digital Prescriptions ({prescriptions.length})
                    </h3>
                    {prescriptions.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No prescriptions issued yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {prescriptions.map((rx: any) => {
                          let meds: any[] = [];
                          try {
                            meds = typeof rx.medications === "string" ? JSON.parse(rx.medications) : rx.medications || [];
                          } catch {}
                          return (
                            <div
                              key={rx.id}
                              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#112a44]/50 p-3.5 space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-bold text-slate-900 dark:text-white">
                                  {rx.diagnosis}
                                </p>
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  {new Date(rx.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </span>
                              </div>
                              <div className="space-y-1">
                                {meds.map((m: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#0B1F33] px-2.5 py-1.5 rounded-lg"
                                  >
                                    <span className="font-semibold flex items-center gap-1.5">
                                      <Pill className="h-3 w-3 text-[#006D77] dark:text-[#83C5BE]" />
                                      {m.name} {m.dosage ? `(${m.dosage})` : ""}
                                    </span>
                                    <span className="text-slate-500 dark:text-slate-400">
                                      {m.frequency} · {m.duration}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              {rx.notes && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                                  Advice: {rx.notes}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Consultation Timeline */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
                      Consultation History ({consultations.length})
                    </h3>
                    <div className="space-y-2">
                      {consultations.map((c: any) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 px-3.5 py-2.5 text-xs"
                        >
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {c.date} · {c.time}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {c.prescription ? "✓ e-Prescription Issued" : "No Rx yet"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                c.status === "COMPLETED"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                                  : c.status === "CONFIRMED"
                                  ? "bg-teal-50 text-[#006D77] dark:bg-teal-950/50 dark:text-[#83C5BE]"
                                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                              }`}
                            >
                              {c.status}
                            </span>
                            {onWriteRx && c.status !== "CANCELLED" && (
                              <button
                                type="button"
                                onClick={() => onWriteRx(c.id, patient.id, patient.name, c.prescription)}
                                className="text-[11px] font-semibold text-[#006D77] dark:text-[#83C5BE] hover:underline cursor-pointer"
                              >
                                {c.prescription ? "Edit Rx" : "Write Rx"}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-3.5 bg-slate-50/70 dark:bg-[#071320] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
              <Link
                href={`/doctor-dashboard/patients/${patientId}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#006D77] hover:bg-[#00565e] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors"
              >
                <span>Open Full EHR & Trends</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
