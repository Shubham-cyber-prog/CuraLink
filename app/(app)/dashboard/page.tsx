"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Calendar,
  Activity,
  FileText,
  Video,
  ArrowRight,
  Star,
  Clock,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Droplets,
  Heart,
  ChevronRight,
  AlertTriangle,
  UserX,
  MessageSquare,
  Pill,
  Download,
  PhoneCall,
  Sparkles,
  ShieldAlert,
  Lock,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Doctor } from "@/types/doctor";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  phoneVerified?: boolean;
  profileCompleted?: boolean;
  age?: number | null;
  gender?: string | null;
}

interface UpcomingAppointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: string;
  status: string;
  avatarInitial: string;
  isToday?: boolean;
}

interface PrescriptionItem {
  id: string;
  diagnosis: string;
  doctorName: string;
  doctorSpecialty: string;
  createdAt: string;
  medications: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
  }>;
  pdfUrl?: string;
}

export default function DashboardPage() {
  const shouldReduceMotion = useReducedMotion();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [latestAppointmentId, setLatestAppointmentId] = useState<string | null>(null);
  const [upcomingAppointment, setUpcomingAppointment] = useState<UpcomingAppointment | null>(null);
  const [topRecommendedDoctors, setTopRecommendedDoctors] = useState<Doctor[]>([]);
  const [vitalsSummary, setVitalsSummary] = useState<any>(null);
  const [recentPrescriptions, setRecentPrescriptions] = useState<PrescriptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        // 1. Fetch current authenticated user
        try {
          const userRes = await api.get("/auth/me");
          if (userRes?.success && userRes.data && isMounted) {
            const u = userRes.data.user || userRes.data;
            setUser(u);
          }
        } catch (e) {
          console.warn("[Dashboard] Could not fetch user profile:", e);
        }

        // 2. Fetch real verified doctors
        try {
          const docRes = await api.get("/doctors/verified");
          if (docRes?.success && Array.isArray(docRes.data) && isMounted) {
            setTopRecommendedDoctors(docRes.data.slice(0, 3));
          }
        } catch (e) {
          console.warn("[Dashboard] Could not fetch verified doctors:", e);
        }

        // 3. Fetch real user appointments
        try {
          const aptRes = await api.get("/appointments/my-appointments");
          if (aptRes?.success && Array.isArray(aptRes.data) && aptRes.data.length > 0 && isMounted) {
            const todayStr = new Date().toISOString().split("T")[0];
            const activeApts = aptRes.data.filter(
              (a: any) => a.status === "CONFIRMED" || a.status === "PENDING"
            );
            const targetApt = activeApts.length > 0 ? activeApts[0] : aptRes.data[0];

            setLatestAppointmentId(targetApt.id);
            setUpcomingAppointment({
              id: targetApt.id,
              doctorName: targetApt.doctor?.name || "Dr. Medical Specialist",
              specialty:
                targetApt.doctor?.specialty ||
                targetApt.doctor?.specialization ||
                "Telehealth Consultation",
              date: targetApt.date,
              time: targetApt.time,
              type: targetApt.roomUrl ? "Encrypted HD Video Room" : "Telehealth Consultation",
              status: targetApt.status || "PENDING",
              avatarInitial: targetApt.doctor?.name
                ? targetApt.doctor.name.replace("Dr. ", "").charAt(0)
                : "D",
              isToday: targetApt.date === todayStr,
            });
          }
        } catch (e) {
          console.warn("[Dashboard] Could not fetch appointments:", e);
        }

        // 4. Fetch real vitals trends
        try {
          const vitalsRes = await api.get("/vitals/trends?days=14");
          if (vitalsRes?.success && vitalsRes.data && isMounted) {
            setVitalsSummary(vitalsRes.data);
          }
        } catch (e) {
          console.warn("[Dashboard] Could not fetch vitals:", e);
        }

        // 5. Fetch recent prescriptions
        try {
          const rxRes = await api.get("/prescriptions/my-prescriptions?limit=2");
          if (rxRes?.success && Array.isArray(rxRes.data) && isMounted) {
            const parsedRx: PrescriptionItem[] = rxRes.data.map((rx: any) => {
              let meds = [];
              try {
                meds = typeof rx.medications === "string" ? JSON.parse(rx.medications) : rx.medications || [];
              } catch {
                meds = [];
              }
              return {
                id: rx.id,
                diagnosis: rx.diagnosis || "Clinical Consultation",
                doctorName: rx.doctor?.name || "Verified Clinician",
                doctorSpecialty: rx.doctor?.specialization || "General Medicine",
                createdAt: rx.createdAt
                  ? new Date(rx.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Recent",
                medications: Array.isArray(meds) ? meds.slice(0, 3) : [],
                pdfUrl: rx.pdfUrl,
              };
            });
            setRecentPrescriptions(parsedRx);
          }
        } catch (e) {
          console.warn("[Dashboard] Could not fetch prescriptions:", e);
        }
      } catch (err) {
        console.error("[Dashboard] General data loading error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const rawName = user?.name || "Patient";
  const firstName = rawName.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const anim = (delay: number) => {
    if (shouldReduceMotion) return {};
    return {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.35, delay: delay * 0.06, ease: [0.16, 1, 0.3, 1] as const },
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto py-2">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Skeleton className="h-12 w-80 rounded-2xl" />
          <Skeleton className="h-10 w-48 rounded-xl" />
        </div>
        <Skeleton className="h-48 w-full rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  // Parse latest vital indicators
  const latestVital =
    vitalsSummary?.timeSeries && vitalsSummary.timeSeries.length > 0
      ? vitalsSummary.timeSeries[vitalsSummary.timeSeries.length - 1]
      : null;

  const systolic = latestVital?.systolicBp ?? 120;
  const diastolic = latestVital?.diastolicBp ?? 80;
  const glucose = latestVital?.bloodGlucose ?? 95;
  const pulse = latestVital?.heartRate ?? 72;
  const spO2 = latestVital?.spO2 ?? 98;

  // Systolic fill percentage (base max 180)
  const systolicPercent = Math.min(Math.max(Math.round((systolic / 180) * 100), 20), 100);
  const diastolicPercent = Math.min(Math.max(Math.round((diastolic / 120) * 100), 20), 100);

  // Glucose position percentage on 60-180 mg/dL scale
  const glucosePercent = Math.min(Math.max(Math.round(((glucose - 60) / 120) * 100), 10), 92);

  return (
    <div className="relative space-y-9 max-w-7xl mx-auto pb-16">
      {/* ── AMBIENT RADIAL LIGHT MESH ── */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-[radial-gradient(ellipse_75%_55%_at_50%_0%,rgba(0,109,119,0.14),transparent_75%)] dark:bg-[radial-gradient(ellipse_75%_55%_at_50%_0%,rgba(131,197,190,0.10),transparent_75%)] blur-2xl -z-10"
        aria-hidden="true"
      />

      {/* ── 1. EDITORIAL HEADER & TELEMETRY SHIELD STATUS ── */}
      <motion.section
        {...anim(0)}
        className="relative flex flex-col md:flex-row md:items-end justify-between gap-5 pb-6 border-b border-slate-200/80 dark:border-white/[0.08]"
      >
        <div className="space-y-2">
          {/* Health Shield Micro-pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 dark:bg-teal-400/10 border border-teal-500/25 px-3 py-1 text-[11px] font-semibold text-[#006D77] dark:text-[#83C5BE]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006D77] dark:bg-[#83C5BE]" />
            </span>
            <span className="tracking-wide">Continuous Care Network • Real-time Sync Active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {greeting},{" "}
            <span className="font-serif italic font-normal text-[#006D77] dark:text-[#83C5BE]">
              {firstName}
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Clinical precision &amp; quiet care. Monitor your daily vitals, review encrypted consultations,
            and connect with certified specialists on demand.
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            id="hero-check-symptoms-btn"
            href="/symptom-checker"
            className="group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#006D77] via-[#0D9488] to-[#0A8896] hover:from-[#005a63] hover:to-[#08727e] px-4.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-teal-700/20 hover:shadow-lg hover:shadow-teal-700/30 transition-all"
          >
            <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12 text-[#83C5BE]" />
            <span>AI Symptom Triage</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-2xl text-xs font-medium border-slate-200/90 dark:border-white/[0.12] bg-white/70 dark:bg-[#0B1F33]/60 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Link href="/find-doctor" className="flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
              <span>Find Specialist</span>
            </Link>
          </Button>
        </div>
      </motion.section>

      {/* ── 2. EXECUTIVE CONSULTATION PASS (HERO APPOINTMENT CARD) ── */}
      <motion.section {...anim(1)} className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-[#006D77] dark:bg-[#83C5BE]" />
            <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              Next Scheduled Consultation
            </h2>
            {upcomingAppointment?.isToday && (
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                Today
              </span>
            )}
          </div>
          <Link
            href="/appointments"
            className="text-xs font-semibold text-[#006D77] dark:text-[#83C5BE] hover:underline flex items-center gap-1 group"
          >
            <span>All Consultations</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {upcomingAppointment ? (
          <div className="relative overflow-hidden rounded-3xl border border-teal-500/25 bg-gradient-to-br from-white/95 via-teal-50/20 to-white/95 dark:from-[#0B1F33]/90 dark:via-teal-950/20 dark:to-[#071320] p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)] backdrop-blur-xl transition-all">
            {/* Top decorative gradient sheen */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-[#83C5BE] to-[#006D77]" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Doctor Details */}
              <div className="flex items-start sm:items-center gap-4.5">
                <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#006D77] to-[#0A8896] text-white text-2xl font-bold shadow-md shadow-teal-900/20 ring-4 ring-teal-500/15 dark:ring-teal-400/10">
                  {upcomingAppointment.avatarInitial}
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0B1F33]">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {upcomingAppointment.doctorName}
                    </h3>
                    <Badge
                      variant={
                        upcomingAppointment.status === "CONFIRMED"
                          ? "verified"
                          : upcomingAppointment.status === "CANCELLED"
                          ? "emergency"
                          : "pending"
                      }
                      className="text-[11px] font-semibold"
                    >
                      {upcomingAppointment.status === "CONFIRMED"
                        ? "Confirmed Slot"
                        : upcomingAppointment.status === "PENDING"
                        ? "Awaiting Clinician Approval"
                        : upcomingAppointment.status}
                    </Badge>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                    {upcomingAppointment.specialty}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-600 dark:text-slate-300 pt-1">
                    <span className="inline-flex items-center gap-1.5 font-medium rounded-lg bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1">
                      <Calendar className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
                      {upcomingAppointment.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-medium rounded-lg bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1">
                      <Clock className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
                      {upcomingAppointment.time}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[#006D77] dark:text-[#83C5BE]">
                      <Video className="h-3.5 w-3.5" />
                      {upcomingAppointment.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200/70 dark:border-white/[0.08]">
                <Link
                  id="join-consultation-btn"
                  href={latestAppointmentId ? `/consultation/${latestAppointmentId}` : "/appointments"}
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#006D77] to-[#0A8896] hover:from-[#005a63] hover:to-[#08727e] px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-teal-700/25 transition-all text-center"
                >
                  <Video className="h-4 w-4" />
                  <span>Join Video Room</span>
                </Link>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-2xl text-xs font-semibold h-11 px-4 border-slate-200/90 dark:border-white/[0.12] bg-white/60 dark:bg-[#0B1F33]/60 backdrop-blur-md"
                >
                  <Link href="/appointments">Manage Session</Link>
                </Button>
              </div>
            </div>

            {/* Room security badge footer */}
            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span>WebRTC 256-bit AES End-to-End Encrypted Consultation</span>
              </span>
              <span>Room opens 10 minutes prior to scheduled time</span>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0B1F33]/40 p-7 flex flex-col sm:flex-row items-center justify-between gap-5 backdrop-blur-sm">
            <div className="flex items-center gap-4 text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#006D77] dark:text-[#83C5BE] border border-teal-100 dark:border-teal-900/50 shadow-xs">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  No upcoming visits scheduled
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-md">
                  Consult with India&apos;s leading verified medical specialists via secure video or in-clinic visits.
                </p>
              </div>
            </div>
            <Button
              asChild
              className="bg-gradient-to-r from-[#006D77] to-[#0A8896] hover:from-[#005a63] hover:to-[#08727e] text-white rounded-2xl text-xs font-semibold px-5 py-2.5 shrink-0 shadow-md shadow-teal-700/20"
            >
              <Link href="/find-doctor">Book New Appointment</Link>
            </Button>
          </div>
        )}
      </motion.section>

      {/* ── 3. CLINICAL HEALTH VITALS & TELEMETRY DECK ── */}
      <motion.section {...anim(2)} className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
              Clinical Telemetry &amp; Biomarkers
            </h2>
            {vitalsSummary?.insights?.overallTrajectory === "DETERIORATING" ? (
              <Badge variant="emergency" className="text-[10px]">Attention Required</Badge>
            ) : (
              <Badge variant="verified" className="text-[10px]">Optimal Range</Badge>
            )}
          </div>
          <Link
            href="/vitals"
            className="text-xs font-semibold text-[#006D77] dark:text-[#83C5BE] hover:underline flex items-center gap-1 group"
          >
            <span>Log &amp; View Analytics</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Active AI Deterioration Alerts */}
        {vitalsSummary?.alerts && vitalsSummary.alerts.length > 0 && (
          <div className="space-y-2">
            {vitalsSummary.alerts.map((alert: any) => (
              <div
                key={alert.id || alert.title}
                className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                  alert.severity === "CRITICAL"
                    ? "bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200"
                    : "bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200"
                }`}
              >
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-current" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-sm">{alert.title}</p>
                  <p className="opacity-90">{alert.message}</p>
                  {alert.recommendedAction && (
                    <p className="font-semibold pt-0.5">Recommendation: {alert.recommendedAction}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4 Clinical Vital Cards with Rich Telemetry Visualizers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Blood Pressure Card with Dual Gauge Bars */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-[#0B1F33]/70 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] backdrop-blur-xl flex flex-col justify-between hover:border-teal-500/40 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                  Blood Pressure
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <Heart className="h-4 w-4" />
                </span>
              </div>

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {systolic}/{diastolic}
                </span>
                <span className="text-xs font-medium text-slate-400">mmHg</span>
              </div>

              {/* Dual Visual Progress Bars */}
              <div className="mt-3.5 space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>SYS ({systolic})</span>
                    <span>120 Target</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${systolicPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>DIA ({diastolic})</span>
                    <span>80 Target</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-[#83C5BE] rounded-full transition-all duration-500"
                      style={{ width: `${diastolicPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px]">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Normotensive
              </span>
              <span className="text-slate-400 text-[10px]">Arterial Stability</span>
            </div>
          </div>

          {/* 2. Pulse Rate Card with Live ECG SVG Waveform */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-[#0B1F33]/70 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] backdrop-blur-xl flex flex-col justify-between hover:border-teal-500/40 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                  Pulse Rate
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal-500/10 text-[#006D77] dark:text-[#83C5BE]">
                  <Activity className="h-4 w-4" />
                </span>
              </div>

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {pulse}
                </span>
                <span className="text-xs font-medium text-slate-400">bpm</span>
              </div>

              {/* Animated ECG Pulse Waveform SVG */}
              <div className="mt-3 py-1">
                <svg
                  className="w-full h-9 overflow-visible text-[#006D77] dark:text-[#83C5BE]"
                  viewBox="0 0 200 40"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 0 20 L 35 20 L 42 16 L 48 20 L 56 20 L 62 8 L 70 34 L 76 12 L 82 20 L 95 20 L 102 16 L 108 20 L 140 20 L 148 16 L 154 20 L 162 8 L 170 34 L 176 12 L 182 20 L 200 20"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px]">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Sinus Rhythm
              </span>
              <span className="text-slate-400 text-[10px]">Normal (60-100)</span>
            </div>
          </div>

          {/* 3. Blood Glucose Card with Safe Band Strip */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-[#0B1F33]/70 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] backdrop-blur-xl flex flex-col justify-between hover:border-teal-500/40 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                  Blood Glucose
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Droplets className="h-4 w-4" />
                </span>
              </div>

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {glucose}
                </span>
                <span className="text-xs font-medium text-slate-400">mg/dL</span>
              </div>

              {/* Band range visualizer */}
              <div className="mt-4">
                <div className="relative h-2 w-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-500 to-rose-500">
                  {/* Current Pinpoint */}
                  <span
                    className="absolute -top-1 h-4 w-2 rounded-full bg-slate-900 dark:bg-white shadow-sm ring-2 ring-white dark:ring-slate-900 -translate-x-1/2 transition-all duration-500"
                    style={{ left: `${glucosePercent}%` }}
                    title={`Current: ${glucose} mg/dL`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
                  <span>70 (Low)</span>
                  <span className="text-[#006D77] dark:text-[#83C5BE] font-semibold">90-110 Normal</span>
                  <span>140+ (High)</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px]">
              <span className="font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Fasting Baseline
              </span>
              <span className="text-slate-400 text-[10px]">Metabolic Steady</span>
            </div>
          </div>

          {/* 4. Oxygen Saturation Card with Circular Gauge Arc */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-[#0B1F33]/70 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] backdrop-blur-xl flex flex-col justify-between hover:border-teal-500/40 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                  Oxygen (SpO2)
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <TrendingUp className="h-4 w-4" />
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      {spO2}
                    </span>
                    <span className="text-xs font-medium text-slate-400">%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Room air saturation
                  </p>
                </div>

                {/* SVG Progress Ring */}
                <div className="relative h-14 w-14 shrink-0">
                  <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100 dark:text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#006D77] dark:text-[#83C5BE]"
                      strokeDasharray={`${spO2}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {spO2}%
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px]">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Optimal
              </span>
              <span className="text-slate-400 text-[10px]">≥95% Threshold</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 4. QUICK MEDICAL ACTIONS (6-GRID LAUNCHPAD) ── */}
      <motion.section {...anim(3)} className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#006D77] dark:bg-[#83C5BE]" />
            <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              Primary Patient Care Services
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            {
              id: "quick-action-find-doctor",
              label: "Find Specialist",
              desc: "40+ clinical domains",
              href: "/find-doctor",
              icon: Stethoscope,
              gradient: "from-teal-500/10 to-teal-500/5 text-[#006D77] dark:text-[#83C5BE] border-teal-500/20",
            },
            {
              id: "quick-action-symptom-checker",
              label: "AI Symptom Triage",
              desc: "Instant pre-assessment",
              href: "/symptom-checker",
              icon: Sparkles,
              gradient: "from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
            },
            {
              id: "quick-action-book-appointment",
              label: "Book Visit",
              desc: "In-clinic & video slots",
              href: "/find-doctor",
              icon: Calendar,
              gradient: "from-blue-500/10 to-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/20",
            },
            {
              id: "quick-action-records",
              label: "Prescriptions",
              desc: "Digitally signed Rx",
              href: "/records",
              icon: FileText,
              gradient: "from-indigo-500/10 to-indigo-500/5 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
            },
            {
              id: "quick-action-messages",
              label: "Clinician Chat",
              desc: "Secure message desk",
              href: "/messages",
              icon: MessageSquare,
              gradient: "from-cyan-500/10 to-cyan-500/5 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
            },
            {
              id: "quick-action-health-risk",
              label: "Health Risk AI",
              desc: "Framingham score",
              href: "/health-risk",
              icon: ShieldAlert,
              gradient: "from-purple-500/10 to-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-500/20",
            },
          ].map((action) => (
            <Link
              key={action.id}
              id={action.id}
              href={action.href}
              className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-[#0B1F33]/70 p-4.5 hover:border-teal-500/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-900/5 dark:hover:shadow-black/40 transition-all duration-200"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${action.gradient} border shadow-xs transition-transform group-hover:scale-105`}
              >
                <action.icon className="h-5 w-5" />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#006D77] dark:group-hover:text-[#83C5BE] transition-colors">
                    {action.label}
                  </h3>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#006D77] dark:group-hover:text-[#83C5BE] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all opacity-0 group-hover:opacity-100" />
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {action.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* ── 5. RECENT E-PRESCRIPTIONS & ACTIVE MEDICATIONS ── */}
      <motion.section {...anim(4)} className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#006D77] dark:bg-[#83C5BE]" />
            <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Pill className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
              Active Prescriptions &amp; Digital Rx
            </h2>
          </div>
          <Link
            href="/records"
            className="text-xs font-semibold text-[#006D77] dark:text-[#83C5BE] hover:underline flex items-center gap-1 group"
          >
            <span>All Medical Records</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {recentPrescriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentPrescriptions.map((rx) => (
              <div
                key={rx.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-[#0B1F33]/70 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] backdrop-blur-xl flex flex-col justify-between gap-4 hover:border-teal-500/40 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[#006D77] dark:text-[#83C5BE] bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20">
                      Rx #{rx.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-[11px] text-slate-400">{rx.createdAt}</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-3">
                    {rx.diagnosis}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Prescribed by <span className="font-semibold text-slate-700 dark:text-slate-300">{rx.doctorName}</span> ({rx.doctorSpecialty})
                  </p>

                  {rx.medications.length > 0 && (
                    <div className="mt-4 space-y-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                      {rx.medications.map((m, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#006D77] dark:bg-[#83C5BE]" />
                            {m.name}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                            {[m.dosage, m.frequency].filter(Boolean).join(" • ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="text-xs rounded-xl h-9 border-slate-200 dark:border-white/[0.1] hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Link href="/records">View Clinical Notes</Link>
                  </Button>

                  {rx.pdfUrl && (
                    <a
                      href={rx.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006D77] dark:text-[#83C5BE] hover:text-[#00565e] transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download PDF</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0B1F33]/40 p-8 text-center backdrop-blur-sm">
            <Pill className="h-8 w-8 text-slate-400 mx-auto mb-2.5 opacity-60" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No active prescriptions logged
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Prescriptions issued by verified doctors during your telehealth visits will automatically sync here with digital signatures.
            </p>
          </div>
        )}
      </motion.section>

      {/* ── 6. VERIFIED PHYSICIANS DIRECTORY CAROUSEL ── */}
      <motion.section {...anim(5)} className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#006D77] dark:bg-[#83C5BE]" />
            <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              Certified Telehealth Specialists
            </h2>
          </div>
          <Link
            href="/find-doctor"
            className="text-xs font-semibold text-[#006D77] dark:text-[#83C5BE] hover:underline flex items-center gap-1 group"
          >
            <span>Full Directory</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {topRecommendedDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topRecommendedDoctors.map((doc) => (
              <div
                key={doc.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-[#0B1F33]/70 p-5.5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] backdrop-blur-xl flex flex-col justify-between gap-4 hover:border-teal-500/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="relative flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#006D77] to-[#0A8896] text-white font-bold text-lg shadow-sm ring-2 ring-teal-500/20">
                    {doc.name ? doc.name.replace("Dr. ", "").charAt(0) : "D"}
                    <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0B1F33]">
                      <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                    </span>
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {doc.name}
                      </h3>
                      {doc.rating && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 font-bold shrink-0 bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {doc.rating}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#006D77] dark:text-[#83C5BE] font-semibold truncate">
                      {doc.specialty}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Fee: <span className="font-semibold text-slate-700 dark:text-slate-300">₹{doc.consultationFee || 500}</span> · {doc.experience || "5+ yrs"}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs font-semibold flex-1 h-9 border-slate-200 dark:border-white/[0.1] hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Link href={`/doctors/${doc.id}`}>Profile</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="bg-gradient-to-r from-[#006D77] to-[#0A8896] hover:from-[#005a63] hover:to-[#08727e] text-white rounded-xl text-xs font-bold flex-1 h-9 shadow-sm shadow-teal-700/20"
                  >
                    <Link href={`/doctors/${doc.id}/book`}>Book Slot</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0B1F33]/40 p-8 text-center backdrop-blur-sm">
            <UserX className="h-8 w-8 text-slate-400 mx-auto mb-2.5 opacity-60" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Verified Physicians Directory
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Browse all certified doctors and clinicians available for high-definition video and in-person care.
            </p>
            <div className="mt-4">
              <Button asChild variant="outline" size="sm" className="text-xs rounded-xl font-semibold">
                <Link href="/find-doctor">Explore All Doctors</Link>
              </Button>
            </div>
          </div>
        )}
      </motion.section>

      {/* ── 7. EMERGENCY HELPLINE & CLINICAL SECURITY BANNER ── */}
      <motion.section {...anim(6)}>
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-[#0B1F33]/80 dark:via-[#071320] dark:to-[#0B1F33]/80 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 mt-0.5">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                24/7 Medical Emergency Response
              </p>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                If you are experiencing severe chest pain, shortness of breath, acute trauma, or a life-threatening crisis, call{" "}
                <span className="font-bold text-rose-600 dark:text-rose-400">112 / 108</span> immediately or proceed to the nearest emergency room.
              </p>
            </div>
          </div>

          <a
            href="tel:112"
            className="inline-flex items-center gap-2 rounded-2xl border border-rose-300 dark:border-rose-900/60 bg-white dark:bg-rose-950/40 px-5 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/40 transition-colors shadow-xs shrink-0 self-stretch sm:self-auto justify-center"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Call 112 (Emergency)</span>
          </a>
        </div>
      </motion.section>
    </div>
  );
}
