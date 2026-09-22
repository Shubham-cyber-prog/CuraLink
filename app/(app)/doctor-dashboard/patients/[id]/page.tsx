"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Activity,
  Droplets,
  Thermometer,
  Wind,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  ShieldCheck,
  Download,
  User,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface MedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface VitalsEntry {
  date: string;
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  spO2: string;
  bloodGlucose: string;
  weight: string;
}

interface ConsultationRecord {
  id: string;
  date: string;
  time: string;
  status: string;
  prescription?: any;
}

import { Skeleton } from "@/components/ui/Skeleton";

export default function DoctorPatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = params.id as string;
  const initialApptId = searchParams.get("appointmentId") || "";

  const [patient, setPatient] = useState<any>(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(true);
  const [vitals, setVitals] = useState<VitalsEntry[]>([]);
  const [aiVitalsInsights, setAiVitalsInsights] = useState<any>(null);
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([]);
  const [chartMetric, setChartMetric] = useState<"glucose" | "bp">("glucose");

  const chronologicalVitals = useMemo(() => [...vitals].reverse(), [vitals]);

  const chartData = useMemo(() => {
    if (chronologicalVitals.length === 0) return null;

    const points = chronologicalVitals.map((v: any) => {
      const val =
        chartMetric === "glucose"
          ? (v.rawGlucose ?? parseFloat(v.bloodGlucose) ?? 100)
          : (v.systolicBp ?? parseInt(v.bloodPressure?.split("/")[0]) ?? 120);
      return {
        date: v.date,
        val,
        original: v,
      };
    });

    const values = points.map((p) => p.val);
    const minRaw = Math.min(...values);
    const maxRaw = Math.max(...values);

    let min = Math.floor(minRaw * 0.9);
    let max = Math.ceil(maxRaw * 1.1);

    if (chartMetric === "glucose") {
      min = Math.min(min, 70);
      max = Math.max(max, 150);
    } else {
      min = Math.min(min, 90);
      max = Math.max(max, 160);
    }

    const range = max - min || 1;
    const width = 600;
    const height = 180;
    const pad = { top: 20, right: 30, bottom: 25, left: 45 };
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;

    const coords = points.map((p, idx) => {
      const x = pad.left + (idx / (points.length - 1 || 1)) * innerW;
      const y = pad.top + (1 - (p.val - min) / range) * innerH;
      return { ...p, x, y };
    });

    const path = coords.reduce(
      (acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`),
      ""
    );

    const area = coords.length > 0
      ? `${path} L ${coords[coords.length - 1].x} ${height - pad.bottom} L ${coords[0].x} ${height - pad.bottom} Z`
      : "";

    let thresholdY1: number | null = null;
    let thresholdLabel1 = "";
    let thresholdY2: number | null = null;
    let thresholdLabel2 = "";

    if (chartMetric === "glucose") {
      thresholdY1 = pad.top + (1 - (126 - min) / range) * innerH;
      thresholdLabel1 = "126 ADA";
      thresholdY2 = pad.top + (1 - (100 - min) / range) * innerH;
      thresholdLabel2 = "100 Normal";
    } else {
      thresholdY1 = pad.top + (1 - (130 - min) / range) * innerH;
      thresholdLabel1 = "130 HTN";
      thresholdY2 = pad.top + (1 - (120 - min) / range) * innerH;
      thresholdLabel2 = "120 Normal";
    }

    return {
      points,
      coords,
      path,
      area,
      min,
      max,
      width,
      height,
      pad,
      thresholdY1,
      thresholdLabel1,
      thresholdY2,
      thresholdLabel2,
    };
  }, [chronologicalVitals, chartMetric]);

  // Prescription Form State
  const [appointmentId, setAppointmentId] = useState(initialApptId);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medications, setMedications] = useState<MedicationItem[]>([
    {
      name: "",
      dosage: "",
      frequency: "Once daily",
      duration: "5 days",
      instructions: "",
    },
  ]);

  const [isSubmittingRx, setIsSubmittingRx] = useState(false);
  const [rxSuccess, setRxSuccess] = useState(false);
  const [rxError, setRxError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPatientDetails() {
      try {
        setIsLoadingPatient(true);
        const data = await api.get(`/doctor/me/patients/${patientId}`).catch(() => null);
        if (data?.success && data.data) {
          setPatient(data.data.patient || null);
          if (Array.isArray(data.data.vitalsHistory)) {
            setVitals(data.data.vitalsHistory);
          }
          if (data.data.aiVitalsInsights) {
            setAiVitalsInsights(data.data.aiVitalsInsights);
          }
          if (Array.isArray(data.data.consultations)) {
            setConsultations(data.data.consultations);
            if (!appointmentId && data.data.consultations.length > 0) {
              setAppointmentId(data.data.consultations[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Error loading patient details:", err);
      } finally {
        setIsLoadingPatient(false);
      }
    }
    loadPatientDetails();
  }, [patientId]);

  const handleAddMedication = () => {
    setMedications([
      ...medications,
      { name: "", dosage: "", frequency: "Once daily", duration: "7 days", instructions: "" },
    ]);
  };

  const handleRemoveMedication = (index: number) => {
    if (medications.length <= 1) return;
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleMedChange = (index: number, field: keyof MedicationItem, val: string) => {
    const updated = [...medications];
    updated[index][field] = val;
    setMedications(updated);
  };

  const handleSubmitPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRx(true);
    setRxError(null);
    setRxSuccess(false);

    try {
      const data = await api.post("/doctor/me/prescriptions", {
        patientId,
        appointmentId: appointmentId || consultations[0]?.id || `appt_gen_${Date.now()}`,
        diagnosis,
        medications,
        notes,
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to issue prescription.");
      }

      setRxSuccess(true);
      setTimeout(() => setRxSuccess(false), 5000);
    } catch (err: any) {
      setRxError(err.message || "Failed to issue prescription. Please verify patient session.");
    } finally {
      setIsSubmittingRx(false);
    }
  };

  if (isLoadingPatient) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-8 px-4 animate-fadeIn">
        <Skeleton className="h-6 w-40 rounded-lg" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mb-3">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Patient Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          The requested patient record could not be loaded or is not under your clinical care.
        </p>
        <Link
          href="/doctor-dashboard"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#085041] px-4 py-2 text-xs font-semibold text-white hover:bg-[#063d31]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const latestVitals = vitals[0] || null;

  return (
    <div className="space-y-8 pb-12">
      {/* ── TOP NAV / BACK BUTTON ── */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <Link
          href="/doctor-dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#085041] dark:hover:text-teal-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Doctor Dashboard
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 px-2.5 py-1 text-xs font-semibold text-[#085041] dark:text-teal-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          HIPAA Clinical Chart
        </span>
      </div>

      {/* ── PATIENT SUMMARY BANNER ── */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2E] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center font-bold text-xl text-[#085041] dark:text-teal-300">
              {patient.name?.charAt(0) || "P"}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{patient.name || "Patient"}</h1>
                <span className="rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-2 py-0.5 text-xs font-bold text-red-700 dark:text-red-300">
                  {patient.riskLevel || "Low"} Risk
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {patient.email} • {patient.gender || "Gender unspecified"}{patient.age ? `, ${patient.age} yrs` : ""} • Blood: <strong className="text-slate-700 dark:text-slate-200">{patient.bloodGroup || "N/A"}</strong>
              </p>
            </div>
          </div>

          <div className="text-xs space-y-1 text-right sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400">Emergency Phone: <strong className="text-slate-800 dark:text-slate-200">{patient.emergencyContact || "Not provided"}</strong></p>
            <p className="text-slate-500 dark:text-slate-400">Primary Condition: <strong className="text-[#085041] dark:text-teal-400">{patient.primaryCondition || "General Health"}</strong></p>
          </div>
        </div>

        {/* ── COMPACT PATIENT TRUST INDICATORS STRIP ── */}
        {patient.trustCard && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-[#085041] dark:text-teal-400" />
              Verification:
            </span>

            {/* Phone Verified Pill */}
            {patient.trustCard.phoneVerified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[11px]">
                <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                Phone Verified {patient.phone ? `(${patient.phone})` : ""}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 text-[11px]">
                <AlertCircle className="h-3 w-3 text-amber-500" />
                Phone Unverified
              </span>
            )}

            {/* Profile Completed Pill */}
            {patient.trustCard.profileCompleted ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 text-[11px]">
                <CheckCircle2 className="h-3 w-3 text-[#085041] dark:text-teal-400" />
                Complete Profile
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[11px]">
                Incomplete Profile
              </span>
            )}

            {/* Member Duration */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px]">
              <Calendar className="h-3 w-3 text-slate-500" />
              {patient.trustCard.memberSinceMonths > 0
                ? `Member ${patient.trustCard.memberSinceMonths}mo`
                : `Joined ${patient.trustCard.accountAgeInDays}d ago`}
            </span>

            {/* Completed Platform Consultations */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-[11px]">
              {patient.trustCard.totalPastAppointments > 0
                ? `${patient.trustCard.totalPastAppointments} past platform ${
                    patient.trustCard.totalPastAppointments === 1 ? "visit" : "visits"
                  }`
                : "1st booking on platform"}
            </span>

            {/* No-show count */}
            {patient.trustCard.noShowCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 text-[11px]">
                <AlertCircle className="h-3 w-3 text-rose-600" />
                {patient.trustCard.noShowCount} missed
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── AI CLINICAL DETERIORATION ALERT (DOCTOR VIEW) ── */}
      {aiVitalsInsights?.alerts && aiVitalsInsights.alerts.length > 0 && (
        <div className="rounded-xl border-2 border-rose-300 dark:border-rose-900 bg-rose-50/90 dark:bg-rose-950/40 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 animate-pulse" />
              <span>AI Remote Monitoring Alert: Longitudinal Deterioration Flag</span>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 uppercase">
              {aiVitalsInsights.overallTrajectory}
            </span>
          </div>
          <p className="text-xs text-rose-800 dark:text-rose-300 font-medium">
            {aiVitalsInsights.summaryText}
          </p>
          <div className="text-[11px] text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/60">
            <strong>Clinical Note:</strong> {aiVitalsInsights.alerts[0]?.clinicalRationale || "Review medication and consider dosage adjustment based on longitudinal trajectory."}
          </div>
        </div>
      )}

      {/* ── VITALS CARDS (LATEST CLINICAL METRICS) ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#085041] dark:text-teal-400" />
            Current Patient Vitals
          </h2>
          {latestVitals && <span className="text-xs text-slate-400">Recorded: {latestVitals.date}</span>}
        </div>

        {latestVitals ? (
          <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {/* Blood Pressure */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2E] p-4 text-center shadow-xs">
              <Heart className="h-4 w-4 mx-auto text-rose-600 mb-1.5" />
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Blood Pressure</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{latestVitals.bloodPressure}</p>
            </div>

            {/* Heart Rate */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2E] p-4 text-center shadow-xs">
              <Activity className="h-4 w-4 mx-auto text-red-500 mb-1.5" />
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Heart Rate</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{latestVitals.heartRate}</p>
            </div>

            {/* Oxygen SpO2 */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2E] p-4 text-center shadow-xs">
              <Wind className="h-4 w-4 mx-auto text-teal-600 dark:text-teal-400 mb-1.5" />
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Blood Oxygen</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{latestVitals.spO2}</p>
            </div>

            {/* Temperature */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2E] p-4 text-center shadow-xs">
              <Thermometer className="h-4 w-4 mx-auto text-amber-500 mb-1.5" />
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Body Temp</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{latestVitals.temperature}</p>
            </div>

            {/* Glucose */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2E] p-4 text-center shadow-xs">
              <Droplets className="h-4 w-4 mx-auto text-blue-500 mb-1.5" />
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Blood Glucose</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{latestVitals.bloodGlucose}</p>
            </div>

            {/* Weight */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2E] p-4 text-center shadow-xs">
              <User className="h-4 w-4 mx-auto text-[#085041] dark:text-teal-400 mb-1.5" />
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Weight</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{latestVitals.weight}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2E] p-6 text-center text-xs text-slate-500 dark:text-slate-400">
            No clinical vitals logged yet for this patient.
          </div>
        )}
      </section>

      {/* ── VITALS CHRONOLOGICAL HISTORY & TRENDLINE CHART ── */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2E] shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0f172a] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#085041] dark:text-teal-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Vitals Longitudinal Trendline & Tracking
            </h3>
          </div>

          {vitals.length > 1 && (
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setChartMetric("glucose")}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  chartMetric === "glucose"
                    ? "bg-white dark:bg-[#151B2E] text-teal-800 dark:text-teal-300 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Glucose Trajectory
              </button>
              <button
                type="button"
                onClick={() => setChartMetric("bp")}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  chartMetric === "bp"
                    ? "bg-white dark:bg-[#151B2E] text-teal-800 dark:text-teal-300 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Systolic BP Trajectory
              </button>
            </div>
          )}
        </div>

        {/* Visual SVG Trendline Chart for Doctor */}
        {chartData && chartData.coords.length > 1 && (
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-slate-50/50 to-white dark:from-[#111827]/40 dark:to-[#151B2E]">
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {chartMetric === "glucose" ? "Fasting Blood Glucose Drift (mg/dL)" : "Systolic Blood Pressure (mmHg)"}
                </span>
                {aiVitalsInsights?.metricInsights?.[chartMetric === "glucose" ? "glucose" : "bloodPressure"] && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      aiVitalsInsights.metricInsights[chartMetric === "glucose" ? "glucose" : "bloodPressure"].trajectory === "DETERIORATING"
                        ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                        : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                    }`}
                  >
                    {aiVitalsInsights.metricInsights[chartMetric === "glucose" ? "glucose" : "bloodPressure"].trajectory === "DETERIORATING" ? (
                      <TrendingUp className="h-3 w-3 text-rose-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-emerald-600" />
                    )}
                    {aiVitalsInsights.metricInsights[chartMetric === "glucose" ? "glucose" : "bloodPressure"].statusDescription}
                  </span>
                )}
              </div>
              <span className="text-slate-400 text-[11px] font-medium">
                {chartData.points.length} consecutive readings
              </span>
            </div>

            <div className="w-full overflow-hidden">
              <svg viewBox={`0 0 ${chartData.width} ${chartData.height}`} className="w-full h-44 overflow-visible">
                <defs>
                  <linearGradient id="doctorChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={chartMetric === "glucose" ? "#0D9488" : "#3B82F6"}
                      stopOpacity="0.25"
                    />
                    <stop
                      offset="100%"
                      stopColor={chartMetric === "glucose" ? "#0D9488" : "#3B82F6"}
                      stopOpacity="0.0"
                    />
                  </linearGradient>
                </defs>

                {/* Threshold 1 (Red / Warning) */}
                {chartData.thresholdY1 != null && chartData.thresholdY1 >= chartData.pad.top && chartData.thresholdY1 <= chartData.height - chartData.pad.bottom && (
                  <g>
                    <line
                      x1={chartData.pad.left}
                      y1={chartData.thresholdY1}
                      x2={chartData.width - chartData.pad.right}
                      y2={chartData.thresholdY1}
                      stroke="#EF4444"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      strokeOpacity="0.8"
                    />
                    <text
                      x={chartData.width - chartData.pad.right - 2}
                      y={chartData.thresholdY1 - 4}
                      textAnchor="end"
                      fill="#EF4444"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {chartData.thresholdLabel1}
                    </text>
                  </g>
                )}

                {/* Threshold 2 (Green / Normal) */}
                {chartData.thresholdY2 != null && chartData.thresholdY2 >= chartData.pad.top && chartData.thresholdY2 <= chartData.height - chartData.pad.bottom && (
                  <g>
                    <line
                      x1={chartData.pad.left}
                      y1={chartData.thresholdY2}
                      x2={chartData.width - chartData.pad.right}
                      y2={chartData.thresholdY2}
                      stroke="#10B981"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      strokeOpacity="0.8"
                    />
                    <text
                      x={chartData.width - chartData.pad.right - 2}
                      y={chartData.thresholdY2 - 4}
                      textAnchor="end"
                      fill="#10B981"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {chartData.thresholdLabel2}
                    </text>
                  </g>
                )}

                {/* Area under curve */}
                {chartData.area && (
                  <path d={chartData.area} fill="url(#doctorChartGrad)" />
                )}

                {/* Trajectory Line */}
                <path
                  d={chartData.path}
                  fill="none"
                  stroke={chartMetric === "glucose" ? "#0D9488" : "#3B82F6"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {chartData.coords.map((c, i) => (
                  <g key={i}>
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r={i === chartData.coords.length - 1 ? "4.5" : "3"}
                      fill={i === chartData.coords.length - 1 ? "#EF4444" : "#0D9488"}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="transition-all hover:scale-125 cursor-pointer"
                    >
                      <title>{`${c.date}: ${c.val} ${chartMetric === "glucose" ? "mg/dL" : "mmHg"}`}</title>
                    </circle>
                  </g>
                ))}

                {/* X-axis date labels */}
                {chartData.coords.length > 0 && (
                  <g fill="#94A3B8" fontSize="10">
                    <text x={chartData.coords[0].x} y={chartData.height - 8} textAnchor="start">
                      {chartData.coords[0].date}
                    </text>
                    {chartData.coords.length > 4 && (
                      <text
                        x={chartData.coords[Math.floor(chartData.coords.length / 2)].x}
                        y={chartData.height - 8}
                        textAnchor="middle"
                      >
                        {chartData.coords[Math.floor(chartData.coords.length / 2)].date}
                      </text>
                    )}
                    <text
                      x={chartData.coords[chartData.coords.length - 1].x}
                      y={chartData.height - 8}
                      textAnchor="end"
                    >
                      {chartData.coords[chartData.coords.length - 1].date}
                    </text>
                  </g>
                )}

                {/* Y-axis labels */}
                <g fill="#94A3B8" fontSize="9" textAnchor="end">
                  <text x={chartData.pad.left - 6} y={chartData.pad.top + 10}>
                    {chartData.max}
                  </text>
                  <text x={chartData.pad.left - 6} y={chartData.height - chartData.pad.bottom}>
                    {chartData.min}
                  </text>
                </g>
              </svg>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
              <tr>
                <th className="px-5 py-2.5">Date</th>
                <th className="px-4 py-2.5">BP (mmHg)</th>
                <th className="px-4 py-2.5">Pulse</th>
                <th className="px-4 py-2.5">SpO2</th>
                <th className="px-4 py-2.5">Glucose</th>
                <th className="px-5 py-2.5">Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {vitals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-slate-400">
                    No vitals tracking history available.
                  </td>
                </tr>
              ) : (
                vitals.map((v, i) => (
                  <tr key={i} className="text-slate-700 dark:text-slate-300">
                    <td className="px-5 py-2.5 font-medium">{v.date}</td>
                    <td className="px-4 py-2.5">{v.bloodPressure}</td>
                    <td className="px-4 py-2.5">{v.heartRate}</td>
                    <td className="px-4 py-2.5">{v.spO2}</td>
                    <td className="px-4 py-2.5">{v.bloodGlucose}</td>
                    <td className="px-5 py-2.5">{v.weight}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 2-COLUMN: CONSULTATIONS & PRESCRIPTION FORM ── */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Previous Consultations (4 cols) */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2E] p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#085041] dark:text-teal-400" />
            Clinical Consultations
          </h3>

          <div className="space-y-2.5">
            {consultations.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                No past consultations found for this patient.
              </p>
            ) : (
              consultations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setAppointmentId(c.id)}
                  className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    appointmentId === c.id
                      ? "border-[#085041] bg-teal-50/50 dark:bg-teal-950/40"
                      : "border-slate-100 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                    <span>{c.date}</span>
                    <span className="text-[#085041] dark:text-teal-400">{c.time}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-slate-400">
                    <span>Status: {c.status}</span>
                    {appointmentId === c.id && <span className="text-xs font-bold text-[#085041] dark:text-teal-300">Selected for Rx</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Prescription Form (8 cols) */}
        <div id="prescribe" className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2E] shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0f172a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#085041] dark:text-teal-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Issue Digital E-Prescription
              </h3>
            </div>
            <span className="text-xs text-slate-400">Digital Signature Encrypted</span>
          </div>

          <form onSubmit={handleSubmitPrescription} className="p-6 space-y-5">
            {/* Diagnosis */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-900 dark:text-white">
                Clinical Diagnosis *
              </label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Acute Bronchitis, Type 2 Diabetes"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070b14] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-[#085041] focus:outline-none"
                required
              />
            </div>

            {/* Medications List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-900 dark:text-white">
                  Prescribed Medications ({medications.length}) *
                </label>
                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#085041] dark:text-teal-400 hover:underline cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Medication
                </button>
              </div>

              <div className="space-y-3">
                {medications.map((med, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#070b14]/50 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#085041] dark:text-teal-400">
                        Item #{idx + 1}
                      </span>
                      {medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(idx)}
                          className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-4">
                      <div className="sm:col-span-2 space-y-1">
                        <span className="text-[10px] text-slate-400 font-medium">Drug / Salt Name</span>
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) => handleMedChange(idx, "name", e.target.value)}
                          placeholder="e.g. Amoxicillin"
                          className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151B2E] px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-medium">Dosage</span>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => handleMedChange(idx, "dosage", e.target.value)}
                          placeholder="e.g. 500 mg"
                          className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151B2E] px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-medium">Duration</span>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => handleMedChange(idx, "duration", e.target.value)}
                          placeholder="e.g. 5 days"
                          className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151B2E] px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2 pt-1">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-medium">Frequency</span>
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) => handleMedChange(idx, "frequency", e.target.value)}
                          placeholder="e.g. Twice daily after meals"
                          className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151B2E] px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-medium">Instructions / Advice</span>
                        <input
                          type="text"
                          value={med.instructions}
                          onChange={(e) => handleMedChange(idx, "instructions", e.target.value)}
                          placeholder="e.g. Avoid dairy 1hr before"
                          className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151B2E] px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor Clinical Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-900 dark:text-white">
                Clinical Recommendations & Follow-Up Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Doctor's clinical advice, diet instructions, or when to follow up..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070b14] p-3 text-xs text-slate-900 dark:text-white focus:border-[#085041] focus:outline-none"
              />
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                {rxError && (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
                    <AlertCircle className="h-4 w-4" /> {rxError}
                  </p>
                )}
                {rxSuccess && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="h-4 w-4" /> Digital E-Prescription issued successfully.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmittingRx}
                className="bg-[#085041] hover:bg-[#063b30] text-white px-5 py-2.5 text-xs font-bold rounded-lg shadow-xs cursor-pointer"
              >
                {isSubmittingRx ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Signing & Issuing...
                  </>
                ) : (
                  "Sign & Issue E-Prescription"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
