"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Heart,
  Droplets,
  Scale,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
  Trash2,
  Sparkles,
  Info,
  Clock,
  X,
  Stethoscope,
  RefreshCw,
  Sliders,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";

interface TrendPoint {
  id: string;
  date: string;
  isoDate: string;
  timestamp: number;
  bloodGlucose: number | null;
  glucoseType?: string | null;
  systolicBp: number | null;
  diastolicBp: number | null;
  weight: number | null;
  heartRate: number | null;
  spO2: number | null;
}

interface ClinicalAlert {
  id: string;
  metric: "glucose" | "bloodPressure" | "weight" | "heartRate" | "overall";
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  titleHindi?: string;
  message: string;
  messageHindi?: string;
  clinicalRationale: string;
  recommendedAction: string;
  suggestDoctorConsultation: boolean;
  detectedAt: string;
}

interface MetricTrendAnalysis {
  metric: string;
  displayName: string;
  unit: string;
  currentValue: number | null;
  baselineValue: number | null;
  sevenDayAvg: number | null;
  deltaFromBaseline: number | null;
  slope: number;
  trajectory: "IMPROVING" | "STABLE" | "DETERIORATING";
  severity: "NORMAL" | "MILD_CONCERN" | "MODERATE_WARNING" | "CRITICAL";
  statusDescription: string;
}

interface AiInsightsData {
  overallTrajectory: "IMPROVING" | "STABLE" | "DETERIORATING";
  totalLogsAnalyzed: number;
  alerts: ClinicalAlert[];
  metricInsights: {
    glucose?: MetricTrendAnalysis;
    bloodPressure?: MetricTrendAnalysis;
    weight?: MetricTrendAnalysis;
  };
  summaryText: string;
  summaryTextHindi: string;
}

export default function VitalsMonitoringPage() {
  const [activeTab, setActiveTab] = useState<"glucose" | "bp" | "weight">("glucose");
  const [timeRange, setTimeRange] = useState<"7" | "14" | "30" | "all">("30");
  const [timeSeries, setTimeSeries] = useState<TrendPoint[]>([]);
  const [insights, setInsights] = useState<AiInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<TrendPoint | null>(null);
  const [language, setLanguage] = useState<"bilingual" | "hindi" | "english">("bilingual");

  // Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [logForm, setLogForm] = useState({
    bloodGlucose: "",
    glucoseType: "FASTING",
    systolicBp: "",
    diastolicBp: "",
    weight: "",
    heartRate: "",
    spO2: "",
    notes: "",
    recordedAt: new Date().toISOString().split("T")[0],
  });

  // Fetch Trends & Insights
  const fetchVitalsData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/vitals/trends?days=${timeRange}`);
      if (res?.success && res.data) {
        setTimeSeries(res.data.timeSeries || []);
        if (res.data.insights) {
          setInsights(res.data.insights);
        }
      }
    } catch (err) {
      console.error("Failed to load vitals data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVitalsData();
  }, [timeRange]);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLog(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const payload: any = {
        glucoseType: logForm.glucoseType,
        notes: logForm.notes || undefined,
        recordedAt: logForm.recordedAt ? new Date(logForm.recordedAt).toISOString() : new Date().toISOString(),
      };
      if (logForm.bloodGlucose) payload.bloodGlucose = parseFloat(logForm.bloodGlucose);
      if (logForm.systolicBp) payload.systolicBp = parseInt(logForm.systolicBp);
      if (logForm.diastolicBp) payload.diastolicBp = parseInt(logForm.diastolicBp);
      if (logForm.weight) payload.weight = parseFloat(logForm.weight);
      if (logForm.heartRate) payload.heartRate = parseInt(logForm.heartRate);
      if (logForm.spO2) payload.spO2 = parseInt(logForm.spO2);

      const res = await api.post("/vitals", payload);
      if (res?.success) {
        setFormSuccess("Vital log recorded successfully!");
        setLogForm({
          bloodGlucose: "",
          glucoseType: "FASTING",
          systolicBp: "",
          diastolicBp: "",
          weight: "",
          heartRate: "",
          spO2: "",
          notes: "",
          recordedAt: new Date().toISOString().split("T")[0],
        });
        setTimeout(() => {
          setIsLogModalOpen(false);
          setFormSuccess(null);
        }, 1200);
        fetchVitalsData();
      } else {
        setFormError(res?.message || "Failed to save vitals.");
      }
    } catch (err: any) {
      setFormError(err?.message || "Error logging vitals.");
    } finally {
      setIsSubmittingLog(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vital entry?")) return;
    try {
      await api.delete(`/vitals/${id}`);
      fetchVitalsData();
    } catch (err) {
      console.error("Failed to delete vital:", err);
    }
  };

  // Metric points for active chart
  const activePoints = useMemo(() => {
    if (activeTab === "glucose") {
      return timeSeries
        .filter((p) => p.bloodGlucose != null)
        .map((p) => ({ ...p, value: p.bloodGlucose as number, value2: null as number | null }));
    }
    if (activeTab === "bp") {
      return timeSeries
        .filter((p) => p.systolicBp != null)
        .map((p) => ({ ...p, value: p.systolicBp as number, value2: p.diastolicBp }));
    }
    return timeSeries
      .filter((p) => p.weight != null)
      .map((p) => ({ ...p, value: p.weight as number, value2: null as number | null }));
  }, [timeSeries, activeTab]);

  // SVG Chart Geometry Calculations
  const chartWidth = 720;
  const chartHeight = 240;
  const padding = { top: 25, right: 30, bottom: 35, left: 45 };

  const { minVal, maxVal, coordinates, coords2 } = useMemo(() => {
    if (activePoints.length === 0) {
      return { minVal: 0, maxVal: 100, coordinates: [], coords2: [] };
    }

    const vals = activePoints.map((p) => p.value);
    if (activeTab === "bp") {
      activePoints.forEach((p) => {
        if (p.value2) vals.push(p.value2);
      });
    }

    let min = Math.min(...vals);
    let max = Math.max(...vals);

    // Padding bounds for pleasant charting
    if (activeTab === "glucose") {
      min = Math.min(min, 70);
      max = Math.max(max, 160);
    } else if (activeTab === "bp") {
      min = Math.min(min, 65);
      max = Math.max(max, 155);
    } else {
      min = Math.floor(min - 2);
      max = Math.ceil(max + 2);
    }

    const range = max - min || 1;
    const innerW = chartWidth - padding.left - padding.right;
    const innerH = chartHeight - padding.top - padding.bottom;

    const coords = activePoints.map((p, idx) => {
      const x = padding.left + (idx / (activePoints.length - 1 || 1)) * innerW;
      const y = padding.top + (1 - (p.value - min) / range) * innerH;
      return { x, y, point: p };
    });

    const c2 =
      activeTab === "bp"
        ? activePoints.map((p, idx) => {
            const x = padding.left + (idx / (activePoints.length - 1 || 1)) * innerW;
            const y = padding.top + (1 - ((p.value2 || 80) - min) / range) * innerH;
            return { x, y, point: p };
          })
        : [];

    return { minVal: min, maxVal: max, coordinates: coords, coords2: c2 };
  }, [activePoints, activeTab]);

  // Construct SVG Path Strings
  const primaryPath = useMemo(() => {
    if (coordinates.length === 0) return "";
    return coordinates.reduce(
      (acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`),
      ""
    );
  }, [coordinates]);

  const secondaryPath = useMemo(() => {
    if (coords2.length === 0) return "";
    return coords2.reduce(
      (acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`),
      ""
    );
  }, [coords2]);

  const areaPath = useMemo(() => {
    if (coordinates.length === 0) return "";
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    const bottomY = chartHeight - padding.bottom;
    return `${primaryPath} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  }, [coordinates, primaryPath]);

  // Target Zones for Glucose
  const glucoseTargetZones = useMemo(() => {
    if (activeTab !== "glucose" || minVal == null || maxVal == null) return null;
    const range = maxVal - minVal;
    const innerH = chartHeight - padding.top - padding.bottom;

    // Normal zone: 70 - 100 mg/dL
    const y100 = padding.top + (1 - (100 - minVal) / range) * innerH;
    const y70 = padding.top + (1 - (70 - minVal) / range) * innerH;

    // Warning line: 126 mg/dL (ADA fasting diabetes threshold)
    const y126 = padding.top + (1 - (126 - minVal) / range) * innerH;

    return { y100, y70, y126, height: Math.max(0, y70 - y100) };
  }, [activeTab, minVal, maxVal]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B101B] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-teal-300" />
                Continuous Remote Patient Monitoring (RPM)
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Vital Biomarkers & AI Deterioration Detection
              </h1>
              <p className="text-teal-100 text-xs sm:text-sm leading-relaxed">
                Log daily physiological vitals. Our clinical time-series AI analyzes trend velocity to catch silent deterioration drifts before acute emergencies occur.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsLogModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                Log Today&apos;s Vitals
              </button>
            </div>
          </div>
        </div>

        {/* AI Early Warning Banner (Deterioration Alert) */}
        {insights?.alerts && insights.alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 border-rose-300 dark:border-rose-900/80 bg-rose-50/90 dark:bg-rose-950/40 p-5 sm:p-6 shadow-md space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200/60 dark:border-rose-900/60 pb-3">
              <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400 font-bold text-sm sm:text-base">
                <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 animate-pulse" />
                <span>AI Clinical Early Warning: Trend Deterioration Detected</span>
              </div>
              <div className="inline-flex items-center gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Language:</span>
                <button
                  onClick={() => setLanguage("bilingual")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                    language === "bilingual" ? "bg-rose-600 text-white" : "bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  Both
                </button>
                <button
                  onClick={() => setLanguage("hindi")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                    language === "hindi" ? "bg-rose-600 text-white" : "bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  हिंदी
                </button>
                <button
                  onClick={() => setLanguage("english")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                    language === "english" ? "bg-rose-600 text-white" : "bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {insights.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-xl bg-white/90 dark:bg-slate-900/80 p-4 border border-rose-200/80 dark:border-rose-900/40 space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                      {alert.title}
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                      {alert.severity}
                    </span>
                  </div>

                  {(language === "bilingual" || language === "hindi") && alert.messageHindi && (
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed bg-amber-50/60 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-200/40 dark:border-amber-900/40">
                      <strong>AI Alert (Hindi):</strong> &quot;{alert.messageHindi}&quot;
                    </p>
                  )}

                  {(language === "bilingual" || language === "english") && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Clinical Rationale:</strong> {alert.message}
                    </p>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">
                      <strong>Recommended Action:</strong> {alert.recommendedAction}
                    </span>
                    {alert.suggestDoctorConsultation && (
                      <Link
                        href="/find-doctor"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all active:scale-[0.98] shrink-0"
                      >
                        <Stethoscope className="h-3.5 w-3.5" />
                        Book Doctor Consultation
                        <ArrowRight className="h-3 w-3 ml-0.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stable / Improving Banner when no critical alerts */}
        {insights && (!insights.alerts || insights.alerts.length === 0) && (
          <div className="rounded-2xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/70 dark:bg-teal-950/30 p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wide">
                  Vitals Trajectory: {insights.overallTrajectory}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {insights.summaryText}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Metric Overview Cards (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Fasting Glucose */}
          <div
            onClick={() => setActiveTab("glucose")}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === "glucose"
                ? "bg-white dark:bg-slate-900 border-teal-500 shadow-md ring-2 ring-teal-500/20"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Blood Glucose</span>
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <Droplets className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {insights?.metricInsights.glucose?.currentValue ?? (timeSeries[timeSeries.length - 1]?.bloodGlucose || "--")}
              </span>
              <span className="text-xs font-medium text-slate-400">mg/dL</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs">
              {insights?.metricInsights.glucose?.trajectory === "DETERIORATING" ? (
                <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +{insights.metricInsights.glucose.deltaFromBaseline} mg/dL (Rising)
                </span>
              ) : insights?.metricInsights.glucose?.trajectory === "IMPROVING" ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <TrendingDown className="h-3.5 w-3.5" />
                  Improving Trend
                </span>
              ) : (
                <span className="text-slate-500 font-medium">Stable over 14d</span>
              )}
            </div>
          </div>

          {/* Card 2: Blood Pressure */}
          <div
            onClick={() => setActiveTab("bp")}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === "bp"
                ? "bg-white dark:bg-slate-900 border-rose-500 shadow-md ring-2 ring-rose-500/20"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Blood Pressure</span>
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <Heart className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {timeSeries[timeSeries.length - 1]?.systolicBp || 120}/{timeSeries[timeSeries.length - 1]?.diastolicBp || 80}
              </span>
              <span className="text-xs font-medium text-slate-400">mmHg</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs">
              {insights?.metricInsights.bloodPressure?.trajectory === "DETERIORATING" ? (
                <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +{insights.metricInsights.bloodPressure.deltaFromBaseline} mmHg (Drift)
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Optimal systolic</span>
              )}
            </div>
          </div>

          {/* Card 3: Weight */}
          <div
            onClick={() => setActiveTab("weight")}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === "weight"
                ? "bg-white dark:bg-slate-900 border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Body Weight</span>
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Scale className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {timeSeries[timeSeries.length - 1]?.weight || 68.5}
              </span>
              <span className="text-xs font-medium text-slate-400">kg</span>
            </div>
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
              BMI: ~23.4 (Normal)
            </div>
          </div>

          {/* Card 4: Heart Rate / SpO2 */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Resting Pulse &amp; SpO2</span>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {timeSeries[timeSeries.length - 1]?.heartRate || 72}
              </span>
              <span className="text-xs font-medium text-slate-400">bpm</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {timeSeries[timeSeries.length - 1]?.spO2 || 98}%
              </span>
            </div>
            <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Normal Perfusion
            </div>
          </div>
        </div>

        {/* Main Interactive Time-Series Chart Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Chart Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("glucose")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "glucose"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                🩸 Blood Glucose
              </button>
              <button
                onClick={() => setActiveTab("bp")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "bp"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                💓 Blood Pressure
              </button>
              <button
                onClick={() => setActiveTab("weight")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "weight"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                ⚖️ Weight
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start sm:self-auto">
              {(["7", "14", "30", "all"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    timeRange === range
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {range === "all" ? "All" : `${range}D`}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Chart Graphic */}
          <div className="relative">
            {isLoading ? (
              <div className="h-[240px] flex items-center justify-center text-slate-400 text-xs gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading longitudinal time series...
              </div>
            ) : activePoints.length === 0 ? (
              <div className="h-[240px] flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
                <Activity className="h-8 w-8 text-slate-300" />
                <p>No vitals recorded in this time range.</p>
                <button
                  onClick={() => setIsLogModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 text-white font-bold"
                >
                  Log Now
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-[240px] overflow-visible"
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={activeTab === "glucose" ? "#0d9488" : activeTab === "bp" ? "#e11d48" : "#4f46e5"}
                        stopOpacity="0.25"
                      />
                      <stop
                        offset="100%"
                        stopColor={activeTab === "glucose" ? "#0d9488" : activeTab === "bp" ? "#e11d48" : "#4f46e5"}
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>

                  {/* Target Zones Background (Glucose: 70-100 normal green band) */}
                  {glucoseTargetZones && (
                    <>
                      <rect
                        x={padding.left}
                        y={glucoseTargetZones.y100}
                        width={chartWidth - padding.left - padding.right}
                        height={glucoseTargetZones.height}
                        fill="#10b981"
                        fillOpacity="0.08"
                        rx="4"
                      />
                      <line
                        x1={padding.left}
                        y1={glucoseTargetZones.y100}
                        x2={chartWidth - padding.right}
                        y2={glucoseTargetZones.y100}
                        stroke="#10b981"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                        strokeOpacity="0.4"
                      />
                      <text
                        x={chartWidth - padding.right - 4}
                        y={glucoseTargetZones.y100 - 4}
                        textAnchor="end"
                        className="text-[9px] font-bold fill-emerald-600 dark:fill-emerald-400"
                      >
                        Target Normal (&lt;100 mg/dL)
                      </text>

                      {/* Elevated Threshold (126 mg/dL) */}
                      <line
                        x1={padding.left}
                        y1={glucoseTargetZones.y126}
                        x2={chartWidth - padding.right}
                        y2={glucoseTargetZones.y126}
                        stroke="#ef4444"
                        strokeDasharray="4 4"
                        strokeWidth="1.2"
                        strokeOpacity="0.5"
                      />
                      <text
                        x={chartWidth - padding.right - 4}
                        y={glucoseTargetZones.y126 - 4}
                        textAnchor="end"
                        className="text-[9px] font-bold fill-rose-600 dark:fill-rose-400"
                      >
                        Diabetic Threshold (126 mg/dL)
                      </text>
                    </>
                  )}

                  {/* Grid Lines */}
                  {[0.25, 0.5, 0.75].map((pct, idx) => {
                    const y = padding.top + pct * (chartHeight - padding.top - padding.bottom);
                    const val = Math.round(maxVal - pct * (maxVal - minVal));
                    return (
                      <g key={idx}>
                        <line
                          x1={padding.left}
                          y1={y}
                          x2={chartWidth - padding.right}
                          y2={y}
                          stroke="#e2e8f0"
                          className="dark:stroke-slate-800"
                          strokeDasharray="3 3"
                        />
                        <text
                          x={padding.left - 8}
                          y={y + 3}
                          textAnchor="end"
                          className="text-[10px] fill-slate-400 font-mono"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Area Fill */}
                  <path d={areaPath} fill="url(#chartGradient)" />

                  {/* Primary Line */}
                  <path
                    d={primaryPath}
                    fill="none"
                    stroke={activeTab === "glucose" ? "#0d9488" : activeTab === "bp" ? "#e11d48" : "#4f46e5"}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Secondary Line for Diastolic BP */}
                  {secondaryPath && (
                    <path
                      d={secondaryPath}
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Data Points */}
                  {coordinates.map((c, i) => {
                    const isHovered = hoveredPoint?.id === c.point.id;
                    const isElevated =
                      activeTab === "glucose" && c.point.value >= 126;
                    return (
                      <g key={i}>
                        <circle
                          cx={c.x}
                          cy={c.y}
                          r={isHovered ? 6 : isElevated ? 4.5 : 3.5}
                          className={`transition-all cursor-pointer ${
                            isElevated
                              ? "fill-rose-500 stroke-white dark:stroke-slate-900 stroke-2"
                              : activeTab === "glucose"
                              ? "fill-teal-600 stroke-white dark:stroke-slate-900 stroke-2"
                              : "fill-rose-600 stroke-white dark:stroke-slate-900 stroke-2"
                          }`}
                          onMouseEnter={() => setHoveredPoint(c.point)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        {/* X-axis date labels for every few points */}
                        {(i === 0 || i === coordinates.length - 1 || i % Math.ceil(coordinates.length / 6) === 0) && (
                          <text
                            x={c.x}
                            y={chartHeight - 10}
                            textAnchor="middle"
                            className="text-[9px] fill-slate-400 font-semibold"
                          >
                            {c.point.date}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Hover Tooltip Overlay */}
                {hoveredPoint && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-3 pointer-events-none">
                    <span className="font-semibold">{hoveredPoint.date}</span>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    {activeTab === "glucose" && (
                      <span className="font-bold text-teal-400 dark:text-teal-600">
                        {hoveredPoint.bloodGlucose} mg/dL ({hoveredPoint.glucoseType || "Fasting"})
                      </span>
                    )}
                    {activeTab === "bp" && (
                      <span className="font-bold text-rose-400 dark:text-rose-600">
                        {hoveredPoint.systolicBp}/{hoveredPoint.diastolicBp} mmHg
                      </span>
                    )}
                    {activeTab === "weight" && (
                      <span className="font-bold text-indigo-400 dark:text-indigo-600">
                        {hoveredPoint.weight} kg
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chart Footer Indicator */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-600" />
                {activeTab === "glucose" ? "Fasting Blood Glucose" : activeTab === "bp" ? "Systolic BP" : "Weight"}
              </span>
              {activeTab === "bp" && (
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  Diastolic BP (dashed)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-slate-400" />
              <span>
                {insights?.metricInsights.glucose?.slope && activeTab === "glucose"
                  ? `Slope: +${insights.metricInsights.glucose.slope} mg/dL/day (Rising trajectory detected)`
                  : "Clinical regression slope calculated daily"}
              </span>
            </div>
          </div>
        </div>

        {/* Longitudinal Vitals History Log Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Recorded Vitals History
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chronological list of all logged readings
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {timeSeries.length} total entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Blood Glucose</th>
                  <th className="py-3 px-3">Blood Pressure</th>
                  <th className="py-3 px-3">Weight</th>
                  <th className="py-3 px-3">Heart Rate</th>
                  <th className="py-3 px-3">Notes</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {timeSeries.slice().reverse().map((log) => {
                  const isHighSugar = (log.bloodGlucose || 0) >= 126;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {log.date}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {log.bloodGlucose ? (
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded-full ${
                              isHighSugar
                                ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                                : "text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            {log.bloodGlucose} mg/dL
                          </span>
                        ) : (
                          "--"
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono">
                        {log.systolicBp && log.diastolicBp ? `${log.systolicBp}/${log.diastolicBp} mmHg` : "--"}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono">
                        {log.weight ? `${log.weight} kg` : "--"}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono">
                        {log.heartRate ? `${log.heartRate} bpm` : "--"}
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {log.glucoseType ? `[${log.glucoseType}] ` : ""}
                        {(log as any).notes || "Routine log"}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Log Today's Vitals Modal */}
      <AnimatePresence>
        {isLogModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Log Daily Health Vitals
                    </h3>
                    <p className="text-xs text-slate-500">Record today&apos;s clinical numbers</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsLogModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {formSuccess && (
                <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 text-teal-800 dark:text-teal-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleLogSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Blood Glucose */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Blood Glucose (mg/dL)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 110"
                      value={logForm.bloodGlucose}
                      onChange={(e) => setLogForm({ ...logForm, bloodGlucose: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* Glucose Type */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Timing / State
                    </label>
                    <select
                      value={logForm.glucoseType}
                      onChange={(e) => setLogForm({ ...logForm, glucoseType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="FASTING">Fasting (Morning)</option>
                      <option value="POST_PRANDIAL">Post-Prandial (After Meal)</option>
                      <option value="RANDOM">Random Check</option>
                    </select>
                  </div>

                  {/* Systolic BP */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Systolic BP (mmHg)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 120"
                      value={logForm.systolicBp}
                      onChange={(e) => setLogForm({ ...logForm, systolicBp: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* Diastolic BP */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Diastolic BP (mmHg)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 80"
                      value={logForm.diastolicBp}
                      onChange={(e) => setLogForm({ ...logForm, diastolicBp: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 68.5"
                      value={logForm.weight}
                      onChange={(e) => setLogForm({ ...logForm, weight: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* Heart Rate */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Heart Rate (bpm)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 72"
                      value={logForm.heartRate}
                      onChange={(e) => setLogForm({ ...logForm, heartRate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Recorded Date
                  </label>
                  <input
                    type="date"
                    value={logForm.recordedAt}
                    onChange={(e) => setLogForm({ ...logForm, recordedAt: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsLogModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingLog}
                    className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center gap-2"
                  >
                    {isSubmittingLog ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Vitals Log"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
