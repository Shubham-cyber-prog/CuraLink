"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Video,
  FileText,
  Search,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Stethoscope,
  Activity,
  RefreshCw,
  MapPin,
  IndianRupee,
  Star,
  UserPlus,
  Settings,
  Heart,
  Wind,
  Phone,
  MessageSquare,
  Sparkles,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { QuickRxModal } from "@/components/doctor/QuickRxModal";
import { QuickPatientChartDrawer } from "@/components/doctor/QuickPatientChartDrawer";
import { PracticeSettingsModal } from "@/components/doctor/PracticeSettingsModal";
import { QuickBookModal } from "@/components/doctor/QuickBookModal";

interface DoctorStats {
  todayAppointments: number;
  totalPatients: number;
  pendingRequests: number;
  completedConsultations: number;
  consultationFee: number;
  specialization: string;
  verificationStatus: string;
  consultationModes?: string[];
  city?: string | null;
  bio?: string;
  experienceYears?: number;
  medicalLicenseNumber?: string;
  totalRevenue?: number;
  todayRevenue?: number;
  averageRating?: number;
  totalReviews?: number;
  prescriptionsIssued?: number;
}

interface TrustCardData {
  phoneVerified: boolean;
  profileCompleted: boolean;
  accountAgeInDays: number;
  memberSinceMonths: number;
  totalPastAppointments: number;
  noShowCount: number;
}

interface LatestVitals {
  bloodPressure: string | null;
  systolicBp: number | null;
  diastolicBp: number | null;
  heartRate: number | null;
  spO2: number | null;
  temperature: number | null;
  bloodGlucose: number | null;
  notes: string | null;
  recordedAt: string;
}

interface AppointmentItem {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string | null;
  patientAge?: number | null;
  patientGender?: string | null;
  date: string;
  time: string;
  status: string;
  roomName: string;
  roomUrl: string;
  fee: number;
  paymentStatus: string;
  hasPrescription: boolean;
  prescription?: any;
  trustCard?: TrustCardData;
  latestVitals?: LatestVitals | null;
}

interface PatientItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  age?: number | null;
  gender?: string | null;
  lastVisit: string;
  lastVisitDate: string;
  lastStatus: string;
  primaryCondition: string;
  riskLevel: "Low" | "Moderate" | "High";
  totalVisits: number;
  latestAppointmentId?: string;
  trustCard?: TrustCardData;
}

const INITIAL_STATS: DoctorStats = {
  todayAppointments: 0,
  totalPatients: 0,
  pendingRequests: 0,
  completedConsultations: 0,
  consultationFee: 500,
  specialization: "General Medicine & Cardiology",
  verificationStatus: "APPROVED",
  consultationModes: ["VIDEO", "IN_PERSON"],
  city: "Hisar",
  totalRevenue: 0,
  todayRevenue: 0,
  averageRating: 4.9,
  totalReviews: 0,
  prescriptionsIssued: 0,
};

function getIstDateStr(daysOffset = 0): string {
  const d = new Date(Date.now() + daysOffset * 86400000);
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function getSmartDateLabel(dateStr: string): { label: string; isToday: boolean; isTomorrow: boolean } {
  const today = getIstDateStr(0);
  const tom = getIstDateStr(1);
  if (dateStr === today) return { label: "Today", isToday: true, isTomorrow: false };
  if (dateStr === tom) return { label: "Tomorrow", isToday: false, isTomorrow: true };
  try {
    const parsed = new Date(`${dateStr}T00:00:00`);
    const formatted = parsed.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    return { label: formatted, isToday: false, isTomorrow: false };
  } catch {
    return { label: dateStr, isToday: false, isTomorrow: false };
  }
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DoctorDashboardPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [isActivatingDoctor, setIsActivatingDoctor] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const [stats, setStats] = useState<DoctorStats>(INITIAL_STATS);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Availability Status (UI clinical status toggle)
  const [availabilityStatus, setAvailabilityStatus] = useState<"ONLINE" | "IN_CALL" | "AWAY">("ONLINE");

  // Filters & Search
  const [apptFilter, setApptFilter] = useState<"ALL" | "TODAY" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED">("ALL");
  const [apptSearch, setApptSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<"ALL" | "High" | "Moderate" | "Low">("ALL");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Interactive Working Modals & Drawers
  const [rxModalTarget, setRxModalTarget] = useState<{
    appointmentId: string;
    patientId: string;
    patientName: string;
    patientMeta?: string;
    existingPrescription?: any;
  } | null>(null);
  const [drawerPatientId, setDrawerPatientId] = useState<string | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [quickBookOpen, setQuickBookOpen] = useState(false);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    setPermissionError(null);
    try {
      const meRes = await api.get("/auth/me").catch(() => null);
      if (meRes?.success && meRes.data?.user) {
        const u = meRes.data.user;
        setUserRole(u.role);
        setUserName(u.name || "Doctor");

        if (meRes.data.token && typeof window !== "undefined") {
          localStorage.setItem("curalink_token", meRes.data.token);
        }

        if (u.role !== "DOCTOR") {
          setIsLoading(false);
          setIsRefreshing(false);
          return;
        }
      }

      const [statsData, apptsData, patientsData] = await Promise.all([
        api.get<DoctorStats>("/doctor/me/dashboard-stats").catch((err) => {
          if (err?.message?.includes("Forbidden") || err?.status === 403) {
            setPermissionError("Forbidden: Insufficient permissions to access clinician practice records.");
          }
          return null;
        }),
        api.get<AppointmentItem[]>("/doctor/me/appointments?limit=50").catch(() => null),
        api.get<PatientItem[]>("/doctor/me/patients?limit=50").catch(() => null),
      ]);

      if (statsData?.success && statsData.data) {
        setStats(statsData.data);
      }
      if (apptsData?.success && Array.isArray(apptsData.data)) {
        setAppointments(apptsData.data);
      }
      if (patientsData?.success && Array.isArray(patientsData.data)) {
        setPatients(patientsData.data);
      }
    } catch (err: any) {
      console.warn("Error fetching doctor dashboard data:", err);
      if (err?.message?.includes("Forbidden") || err?.status === 403) {
        setPermissionError("Forbidden: Activate your doctor practice credentials to proceed.");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleActivateDoctor = async () => {
    try {
      setIsActivatingDoctor(true);
      const res = await api.post("/auth/switch-role", { role: "DOCTOR" });
      if (res?.success && res.data) {
        if (res.data.token && typeof window !== "undefined") {
          localStorage.setItem("curalink_token", res.data.token);
        }
        setUserRole("DOCTOR");
        setPermissionError(null);
        showToast("Doctor credentials activated! Loading clinical workspace...");
        await fetchDashboardData();
      }
    } catch (err: any) {
      showToast(`Activation error: ${err?.message || "Failed to activate doctor profile"}`);
    } finally {
      setIsActivatingDoctor(false);
    }
  };

  const handleUpdateStatus = async (apptId: string, newStatus: "CONFIRMED" | "CANCELLED" | "COMPLETED") => {
    const previous = appointments;
    setAppointments((prev) =>
      prev.map((a) => (a.id === apptId ? { ...a, status: newStatus } : a))
    );

    try {
      const res = await api.patch(`/doctor/me/appointments/${apptId}`, { status: newStatus });
      if (res?.success) {
        const label =
          newStatus === "CONFIRMED"
            ? "confirmed — video room ready"
            : newStatus === "CANCELLED"
            ? "cancelled"
            : "marked as completed";
        showToast(`Consultation ${label}.`);
        fetchDashboardData();
      } else {
        setAppointments(previous);
      }
    } catch (err: any) {
      setAppointments(previous);
      showToast(`Failed to update appointment: ${err?.message || "Unknown error"}`);
    }
  };

  const todayStr = getIstDateStr(0);

  const todayQueue = useMemo(
    () => appointments.filter((a) => a.date === todayStr && a.status !== "CANCELLED"),
    [appointments, todayStr]
  );

  // Next active confirmed visit for the live spotlight banner
  const nextActiveVisit = useMemo(() => {
    const todayConfirmed = appointments.find((a) => a.date === todayStr && a.status === "CONFIRMED");
    if (todayConfirmed) return todayConfirmed;
    return appointments.find((a) => a.status === "CONFIRMED") || null;
  }, [appointments, todayStr]);

  const filteredAppointments = useMemo(() => {
    const q = apptSearch.trim().toLowerCase();
    return appointments.filter((a) => {
      if (apptFilter === "TODAY" && a.date !== todayStr) return false;
      if (apptFilter !== "ALL" && apptFilter !== "TODAY" && a.status !== apptFilter) return false;
      if (!q) return true;
      return (
        a.patientName.toLowerCase().includes(q) ||
        a.patientEmail.toLowerCase().includes(q) ||
        (a.patientPhone || "").toLowerCase().includes(q)
      );
    });
  }, [appointments, apptFilter, apptSearch, todayStr]);

  const filteredPatients = useMemo(() => {
    const q = patientSearch.trim().toLowerCase();
    return patients.filter((p) => {
      if (riskFilter !== "ALL" && p.riskLevel !== riskFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.primaryCondition.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.phone || "").toLowerCase().includes(q)
      );
    });
  }, [patients, patientSearch, riskFilter]);

  const cycleAvailability = () => {
    setAvailabilityStatus((prev) =>
      prev === "ONLINE" ? "IN_CALL" : prev === "IN_CALL" ? "AWAY" : "ONLINE"
    );
  };

  const displayDoctorName = userName
    ? userName.toLowerCase().startsWith("dr")
      ? userName
      : `Dr. ${userName}`
    : "Doctor";

  // Non-doctor prompt view
  if (userRole === "PATIENT") {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 space-y-6 text-center">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-[#006D77] dark:text-[#83C5BE]">
          <Stethoscope className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F33] dark:text-white">
            Clinician Practice Portal
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Welcome, <span className="font-semibold text-slate-900 dark:text-white">{userName || "User"}</span>. Activate your Doctor credentials below to manage consultations, EHR charts, and digital prescriptions.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1F33] p-6 shadow-sm space-y-4 text-left">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-[#006D77] dark:text-[#83C5BE] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                Doctor Practice Workspace Privileges
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Switching to Doctor Mode activates your live telehealth queue, public practice profile, encrypted WebRTC video sessions, and ABDM-ready e-prescriptions.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <button
              onClick={handleActivateDoctor}
              disabled={isActivatingDoctor}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#006D77] to-[#0D9488] hover:brightness-110 text-white px-5 py-2.5 text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              {isActivatingDoctor ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Activating Practice...
                </>
              ) : (
                <>
                  <Stethoscope className="h-4 w-4" />
                  Activate Doctor Workspace
                </>
              )}
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#112a44] px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Go to Patient Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="dashboard" className="space-y-7 pb-14">
      {/* ── 1. EXECUTIVE CLINICAL HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1F33] dark:text-white">
              {getGreeting()}, {displayDoctorName}
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2.5 py-0.5 text-[11px] font-bold text-[#006D77] dark:text-[#83C5BE]">
              <ShieldCheck className="h-3.5 w-3.5" />
              NMC Verified Clinician
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {stats.specialization} · {stats.city || "Telehealth Practice"} ·{" "}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {todayQueue.length} active {todayQueue.length === 1 ? "consultation" : "consultations"} scheduled today
            </span>
          </p>
        </div>

        {/* Right Executive Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Live Availability Toggle */}
          <button
            type="button"
            onClick={cycleAvailability}
            title="Click to toggle your live telehealth availability status"
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
              availabilityStatus === "ONLINE"
                ? "border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300"
                : availabilityStatus === "IN_CALL"
                ? "border-amber-200 dark:border-amber-800/70 bg-amber-50/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300"
                : "border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                availabilityStatus === "ONLINE"
                  ? "bg-emerald-500 animate-pulse"
                  : availabilityStatus === "IN_CALL"
                  ? "bg-amber-500"
                  : "bg-slate-400"
              }`}
            />
            <span>
              {availabilityStatus === "ONLINE"
                ? "Accepting Video"
                : availabilityStatus === "IN_CALL"
                ? "In Consultation"
                : "Away"}
            </span>
          </button>

          {/* Schedule Walk-In / Follow-Up */}
          <button
            type="button"
            onClick={() => setQuickBookOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#006D77] to-[#0D9488] hover:brightness-110 text-white px-3.5 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>+ Walk-In / Book</span>
          </button>

          {/* Edit Practice Settings */}
          <button
            type="button"
            onClick={() => setSettingsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1F33] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#006D77] hover:text-[#006D77] dark:hover:text-[#83C5BE] transition-colors cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Practice Settings</span>
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1F33] p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Refresh clinical data"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-[#006D77]" : ""}`} />
          </button>
        </div>
      </motion.div>

      {/* Alerts & Toast Notifications */}
      {permissionError && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 text-xs font-medium text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <span>{permissionError}</span>
          </div>
          <button
            onClick={handleActivateDoctor}
            disabled={isActivatingDoctor}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#006D77] text-white px-3.5 py-1.5 text-xs font-semibold hover:bg-[#00565e] transition-colors shrink-0 cursor-pointer"
          >
            <Stethoscope className="h-3.5 w-3.5" />
            Re-activate Credentials
          </button>
        </div>
      )}

      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/50 px-4 py-3 text-xs font-semibold text-[#006D77] dark:text-[#83C5BE] flex items-center gap-2 shadow-xs"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{statusMessage}</span>
        </motion.div>
      )}

      {/* ── 2. NEXT UP: LIVE TELEHEALTH SPOTLIGHT BANNER ── */}
      {nextActiveVisit && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-[#0B1F33] text-white p-5 sm:p-6 shadow-lg border border-[#163656]"
        >
          {/* Ambient radial glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(131,197,190,0.22),transparent_70%)]"
          />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Next Active Telehealth Session
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#83C5BE]">
                  {getSmartDateLabel(nextActiveVisit.date).label} · {nextActiveVisit.time}
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/80">
                  Paid ₹{nextActiveVisit.fee}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#006D77] to-[#83C5BE] text-[#0B1F33] font-extrabold text-base flex items-center justify-center shrink-0">
                  {nextActiveVisit.patientName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 flex-wrap">
                    <span>{nextActiveVisit.patientName}</span>
                    {(nextActiveVisit.patientAge || nextActiveVisit.patientGender) && (
                      <span className="text-xs font-medium text-white/70">
                        ({nextActiveVisit.patientAge ? `${nextActiveVisit.patientAge}y` : ""}
                        {nextActiveVisit.patientAge && nextActiveVisit.patientGender ? " · " : ""}
                        {nextActiveVisit.patientGender || ""})
                      </span>
                    )}
                  </h2>
                  {nextActiveVisit.latestVitals?.notes ? (
                    <p className="text-xs text-white/75 mt-0.5">
                      Chief Note: {nextActiveVisit.latestVitals.notes}
                    </p>
                  ) : (
                    <p className="text-xs text-white/70 mt-0.5">
                      Encrypted WebRTC Room Ready · {nextActiveVisit.patientPhone || nextActiveVisit.patientEmail}
                    </p>
                  )}
                </div>
              </div>

              {/* Pre-Consult Vitals Strip */}
              {nextActiveVisit.latestVitals && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {nextActiveVisit.latestVitals.bloodPressure && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-rose-200">
                      <Heart className="h-3 w-3 text-rose-400" />
                      BP {nextActiveVisit.latestVitals.bloodPressure}
                    </span>
                  )}
                  {nextActiveVisit.latestVitals.heartRate && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-[#83C5BE]">
                      <Activity className="h-3 w-3 text-[#83C5BE]" />
                      {nextActiveVisit.latestVitals.heartRate} bpm
                    </span>
                  )}
                  {nextActiveVisit.latestVitals.spO2 && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-sky-200">
                      <Wind className="h-3 w-3 text-sky-400" />
                      SpO2 {nextActiveVisit.latestVitals.spO2}%
                    </span>
                  )}
                  {nextActiveVisit.latestVitals.bloodGlucose && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-amber-200">
                      Glucose {nextActiveVisit.latestVitals.bloodGlucose} mg/dL
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Instant Clinical Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href={`/consultation/${nextActiveVisit.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#006D77] via-[#0D9488] to-[#0A8896] hover:brightness-110 px-5 py-3 text-xs font-bold text-white shadow-[0_0_24px_rgba(131,197,190,0.3)] transition-all"
              >
                <Video className="h-4 w-4" />
                <span>Join HD Video Room</span>
              </Link>
              <button
                type="button"
                onClick={() =>
                  setRxModalTarget({
                    appointmentId: nextActiveVisit.id,
                    patientId: nextActiveVisit.patientId,
                    patientName: nextActiveVisit.patientName,
                    patientMeta: `${nextActiveVisit.patientAge ? `${nextActiveVisit.patientAge}y · ` : ""}${nextActiveVisit.patientGender || ""}`,
                    existingPrescription: nextActiveVisit.prescription,
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 px-4 py-3 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5 text-[#83C5BE]" />
                <span>Write Rx</span>
              </button>
              <button
                type="button"
                onClick={() => setDrawerPatientId(nextActiveVisit.patientId)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-3 text-xs font-semibold text-white/90 transition-colors cursor-pointer"
              >
                <span>Quick Chart</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── 3. EXECUTIVE 5-METRIC CLINICAL KPI GRID ── */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        {/* Today's Visits */}
        <motion.button
          type="button"
          whileHover={{ y: -3 }}
          onClick={() => setApptFilter("TODAY")}
          className="text-left rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B1F33] p-4 shadow-xs hover:border-[#006D77]/50 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today&apos;s Queue
            </span>
            <div className="h-8 w-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#006D77] dark:text-[#83C5BE] flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2.5 text-2xl font-extrabold text-[#0B1F33] dark:text-white">
            {stats.todayAppointments}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active visits today
          </p>
        </motion.button>

        {/* Active Patients */}
        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B1F33] p-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Patients
            </span>
            <div className="h-8 w-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2.5 text-2xl font-extrabold text-[#0B1F33] dark:text-white">
            {stats.totalPatients}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Under continuous care
          </p>
        </motion.div>

        {/* Pending Action */}
        <motion.button
          type="button"
          whileHover={{ y: -3 }}
          onClick={() => setApptFilter("PENDING")}
          className={`text-left rounded-2xl border p-4 shadow-xs transition-all cursor-pointer ${
            stats.pendingRequests > 0
              ? "border-amber-200 dark:border-amber-800/70 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-400"
              : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B1F33]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pending Review
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-100/80 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2.5 text-2xl font-extrabold text-[#0B1F33] dark:text-white">
            {stats.pendingRequests}
          </p>
          <p className="mt-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
            {stats.pendingRequests > 0 ? "Needs confirmation →" : "All caught up"}
          </p>
        </motion.button>

        {/* Completed & Rx */}
        <motion.button
          type="button"
          whileHover={{ y: -3 }}
          onClick={() => setApptFilter("COMPLETED")}
          className="text-left rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B1F33] p-4 shadow-xs hover:border-emerald-400/50 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Completed Visits
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2.5 text-2xl font-extrabold text-[#0B1F33] dark:text-white">
            {stats.completedConsultations}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {stats.prescriptionsIssued ?? stats.completedConsultations} e-Rx digitally signed
          </p>
        </motion.button>

        {/* Clinical Revenue & Rating */}
        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-2xl border border-teal-200/80 dark:border-teal-800/60 bg-gradient-to-br from-teal-50/70 to-white dark:from-[#082933] dark:to-[#0B1F33] p-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#006D77] dark:text-[#83C5BE]">
              Practice Earnings
            </span>
            <div className="h-8 w-8 rounded-xl bg-[#006D77] text-white flex items-center justify-center">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2.5 text-2xl font-extrabold font-mono text-[#0B1F33] dark:text-white">
            ₹{(stats.totalRevenue ?? 0).toLocaleString("en-IN")}
          </p>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">
              Fee: ₹{stats.consultationFee}
            </span>
            <span className="inline-flex items-center gap-0.5 font-bold text-amber-600 dark:text-amber-400">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {stats.averageRating || 4.9}
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── 4. PUBLIC PRACTICE BAR ── */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-[#0B1F33]/80 px-4 py-3 text-xs flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-500 dark:text-slate-400">Public Listing:</span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 font-bold text-[#006D77] dark:text-[#83C5BE] border border-teal-200/60 dark:border-teal-800/40">
            <Stethoscope className="h-3 w-3" /> {stats.specialization}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-[#112a44] px-2.5 py-1 font-medium text-slate-700 dark:text-slate-300">
            <MapPin className="h-3 w-3 text-slate-400" /> {stats.city || "National Telehealth"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-[#112a44] px-2.5 py-1 font-medium text-slate-700 dark:text-slate-300">
            {stats.consultationModes?.includes("VIDEO") && stats.consultationModes?.includes("IN_PERSON")
              ? "Video & In-Person"
              : stats.consultationModes?.includes("IN_PERSON")
              ? "In-Person Clinic"
              : "HD Video Telehealth"}
          </span>
          <span className="font-bold text-[#006D77] dark:text-[#83C5BE]">
            · ₹{stats.consultationFee} / session
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSettingsModalOpen(true)}
            className="font-semibold text-[#006D77] dark:text-[#83C5BE] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <SlidersHorizontal className="h-3 w-3" />
            Edit Fee & Profile
          </button>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <Link
            href="/find-doctor"
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1"
          >
            <span>Find Doctor View</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* ── 5. PATIENT CONSULTATIONS SCHEDULE ── */}
      <section id="appointments" className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#0B1F33] dark:text-white">
              Patient Consultations Schedule
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Accept bookings, launch encrypted video sessions, inspect live vitals, and sign e-prescriptions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick Search */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={apptSearch}
                onChange={(e) => setApptSearch(e.target.value)}
                placeholder="Search patient name or phone..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1F33] pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006D77]"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-[#071320] p-1 flex-wrap">
              {(["ALL", "TODAY", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map((filterKey) => {
                const badgeCount =
                  filterKey === "PENDING"
                    ? appointments.filter((a) => a.status === "PENDING").length
                    : filterKey === "TODAY"
                    ? todayQueue.length
                    : 0;
                return (
                  <button
                    key={filterKey}
                    onClick={() => setApptFilter(filterKey)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      apptFilter === filterKey
                        ? "bg-white dark:bg-[#112a44] text-[#006D77] dark:text-[#83C5BE] shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {filterKey === "ALL"
                      ? "All"
                      : filterKey === "TODAY"
                      ? "Today"
                      : filterKey.charAt(0) + filterKey.slice(1).toLowerCase()}
                    {badgeCount > 0 && (
                      <span
                        className={`inline-flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[9px] font-bold text-white ${
                          filterKey === "PENDING" ? "bg-amber-500" : "bg-[#006D77]"
                        }`}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Consultations Table */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B1F33] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-[#071320] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Patient Profile</th>
                  <th className="px-4 py-3.5">Schedule</th>
                  <th className="px-4 py-3.5">Pre-Visit Vitals</th>
                  <th className="px-4 py-3.5">Status & Fee</th>
                  <th className="px-4 py-3.5">e-Prescription</th>
                  <th className="px-5 py-3.5 text-right">Clinical Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-[#006D77] mb-2" />
                      Loading clinical consultations...
                    </td>
                  </tr>
                ) : filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-500 dark:text-slate-400">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        No consultations found for this filter.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setApptFilter("ALL");
                          setApptSearch("");
                        }}
                        className="mt-2 text-xs font-semibold text-[#006D77] dark:text-[#83C5BE] hover:underline cursor-pointer"
                      >
                        Show all appointments
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appt) => {
                    const isPending = appt.status === "PENDING";
                    const isConfirmed = appt.status === "CONFIRMED";
                    const isCompleted = appt.status === "COMPLETED";
                    const isCancelled = appt.status === "CANCELLED";
                    const smartDate = getSmartDateLabel(appt.date);

                    return (
                      <tr
                        key={appt.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-[#112a44]/40 transition-colors"
                      >
                        {/* Patient Profile */}
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              onClick={() => setDrawerPatientId(appt.patientId)}
                              className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#006D77]/15 to-[#83C5BE]/30 text-[#006D77] dark:text-[#83C5BE] font-extrabold text-sm flex items-center justify-center shrink-0 hover:scale-105 transition-transform cursor-pointer"
                              title="Open quick patient chart"
                            >
                              {appt.patientName.charAt(0).toUpperCase()}
                            </button>
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => setDrawerPatientId(appt.patientId)}
                                  className="font-bold text-slate-900 dark:text-white hover:text-[#006D77] dark:hover:text-[#83C5BE] transition-colors cursor-pointer text-left"
                                >
                                  {appt.patientName}
                                </button>
                                {(appt.patientAge || appt.patientGender) && (
                                  <span className="rounded bg-slate-100 dark:bg-[#112a44] px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                    {appt.patientAge ? `${appt.patientAge}y` : ""}
                                    {appt.patientAge && appt.patientGender ? " · " : ""}
                                    {appt.patientGender ? appt.patientGender.charAt(0) : ""}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 dark:text-slate-400">
                                {appt.patientPhone ? (
                                  <span className="inline-flex items-center gap-1">
                                    <Phone className="h-2.5 w-2.5 text-[#006D77] dark:text-[#83C5BE]" />
                                    {appt.patientPhone}
                                  </span>
                                ) : (
                                  <span className="truncate max-w-[160px]">{appt.patientEmail}</span>
                                )}
                                {appt.trustCard?.phoneVerified && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                    Verified
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-block font-bold ${
                              smartDate.isToday
                                ? "text-[#006D77] dark:text-[#83C5BE]"
                                : "text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            {smartDate.label}
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            {appt.time}
                          </p>
                        </td>

                        {/* Pre-Visit Vitals */}
                        <td className="px-4 py-4">
                          {appt.latestVitals ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {appt.latestVitals.bloodPressure && (
                                  <span
                                    className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                      (appt.latestVitals.systolicBp || 0) >= 140
                                        ? "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60"
                                        : "bg-slate-100 dark:bg-[#112a44] text-slate-700 dark:text-slate-300"
                                    }`}
                                  >
                                    BP {appt.latestVitals.bloodPressure}
                                  </span>
                                )}
                                {appt.latestVitals.spO2 && (
                                  <span className="inline-flex items-center rounded-md bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                                    SpO2 {appt.latestVitals.spO2}%
                                  </span>
                                )}
                              </div>
                              {appt.latestVitals.notes && (
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 max-w-[180px] truncate">
                                  {appt.latestVitals.notes}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No vitals logged</span>
                          )}
                        </td>

                        {/* Status & Fee */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                              isPending
                                ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                : isConfirmed
                                ? "bg-teal-50 dark:bg-teal-950/50 text-[#006D77] dark:text-[#83C5BE] border border-teal-200 dark:border-teal-800"
                                : isCompleted
                                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                : "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                            }`}
                          >
                            {appt.status}
                          </span>
                          <p className="mt-1 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            ₹{appt.fee} · {appt.paymentStatus === "SUCCESS" ? "Paid" : appt.paymentStatus}
                          </p>
                        </td>

                        {/* Prescription */}
                        <td className="px-4 py-4">
                          {appt.hasPrescription ? (
                            <button
                              type="button"
                              onClick={() =>
                                setRxModalTarget({
                                  appointmentId: appt.id,
                                  patientId: appt.patientId,
                                  patientName: appt.patientName,
                                  patientMeta: `${appt.patientAge ? `${appt.patientAge}y · ` : ""}${appt.patientGender || ""}`,
                                  existingPrescription: appt.prescription,
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Rx Issued
                            </button>
                          ) : !isCancelled ? (
                            <button
                              type="button"
                              onClick={() =>
                                setRxModalTarget({
                                  appointmentId: appt.id,
                                  patientId: appt.patientId,
                                  patientName: appt.patientName,
                                  patientMeta: `${appt.patientAge ? `${appt.patientAge}y · ` : ""}${appt.patientGender || ""}`,
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[#006D77]/50 dark:border-[#83C5BE]/50 px-2.5 py-1 text-[11px] font-semibold text-[#006D77] dark:text-[#83C5BE] hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors cursor-pointer"
                            >
                              <FileText className="h-3 w-3" />
                              Write Rx
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">—</span>
                          )}
                        </td>

                        {/* Clinical Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end flex-wrap">
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(appt.id, "CONFIRMED")}
                                  className="inline-flex items-center gap-1 rounded-lg bg-[#006D77] hover:bg-[#00565e] px-2.5 py-1.5 text-[11px] font-bold text-white shadow-xs transition-colors cursor-pointer"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Accept
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(appt.id, "CANCELLED")}
                                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-2.5 py-1.5 text-[11px] font-semibold text-red-700 dark:text-red-300 hover:bg-red-100 transition-colors cursor-pointer"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Decline
                                </button>
                              </>
                            )}

                            {isConfirmed && (
                              <>
                                <Link
                                  href={`/consultation/${appt.id}`}
                                  className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#006D77] to-[#0D9488] hover:brightness-110 text-white px-3 py-1.5 text-[11px] font-bold shadow-xs transition-all"
                                >
                                  <Video className="h-3.5 w-3.5" />
                                  Join Call
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(appt.id, "COMPLETED")}
                                  title="Mark visit completed"
                                  className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-1.5 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(appt.id, "CANCELLED")}
                                  title="Cancel visit"
                                  className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-500 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}

                            {isCancelled && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(appt.id, "CONFIRMED")}
                                className="rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1.5 text-[11px] font-semibold text-[#006D77] dark:text-[#83C5BE] hover:bg-teal-100 cursor-pointer"
                              >
                                Restore
                              </button>
                            )}

                            {/* Quick EHR Drawer Trigger */}
                            <button
                              type="button"
                              onClick={() => setDrawerPatientId(appt.patientId)}
                              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#112a44] px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-[#006D77] hover:text-[#006D77] dark:hover:text-[#83C5BE] transition-colors cursor-pointer"
                            >
                              Chart
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 6. BOTTOM WORKSPACE: PATIENT REGISTRY (LEFT) & TODAY'S TIMELINE (RIGHT) ── */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Patient Registry & Risk Triage (8 cols) */}
        <section id="patients" className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#0B1F33] dark:text-white">
                Patient Registry & Risk Triage
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect chronic conditions, triage priorities, and longitudinal EHR histories.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-full sm:w-52">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Search patients or condition..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1F33] pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006D77]"
                />
              </div>

              {/* Risk Triage Filter */}
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-[#071320] p-1">
                {(["ALL", "High", "Moderate", "Low"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setRiskFilter(level)}
                    className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                      riskFilter === level
                        ? "bg-white dark:bg-[#112a44] text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {level === "ALL" ? "All" : level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B1F33] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-[#071320] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Patient</th>
                    <th className="px-4 py-3.5">Condition / Diagnosis</th>
                    <th className="px-4 py-3.5">Triage Risk</th>
                    <th className="px-5 py-3.5 text-right">EHR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                        No patients matching search or risk filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((patient) => {
                      const isHigh = patient.riskLevel === "High";
                      const isMod = patient.riskLevel === "Moderate";

                      return (
                        <tr
                          key={patient.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-[#112a44]/40 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-slate-900 dark:text-white">
                              {patient.name}
                              {patient.age ? (
                                <span className="ml-1.5 text-[10px] font-medium text-slate-500">
                                  ({patient.age}y {patient.gender ? `· ${patient.gender.charAt(0)}` : ""})
                                </span>
                              ) : null}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {patient.phone || patient.email} · {patient.totalVisits}{" "}
                              {patient.totalVisits === 1 ? "visit" : "visits"}
                            </p>
                          </td>
                          <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 max-w-[230px]">
                            <p className="truncate font-medium">{patient.primaryCondition}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Last: {patient.lastVisit}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isHigh
                                  ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                  : isMod
                                  ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                  : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isHigh ? "bg-rose-500" : isMod ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                              />
                              {patient.riskLevel} Risk
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setDrawerPatientId(patient.id)}
                                className="text-xs font-bold text-[#006D77] dark:text-[#83C5BE] hover:underline cursor-pointer"
                              >
                                Quick View
                              </button>
                              <span className="text-slate-300 dark:text-slate-700">·</span>
                              <Link
                                href={`/doctor-dashboard/patients/${patient.id}`}
                                className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                              >
                                Full EHR <ChevronRight className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Right Sidebar: Today's Clinical Timeline & Quick Tools (4 cols) */}
        <aside id="schedule" className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B1F33] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0B1F33] dark:text-white">
                  Today&apos;s Clinical Timeline
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickBookOpen(true)}
                className="rounded-lg bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 text-[11px] font-bold text-[#006D77] dark:text-[#83C5BE] hover:bg-teal-100 transition-colors cursor-pointer"
              >
                + Add Slot
              </button>
            </div>

            {todayQueue.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center space-y-2">
                <Calendar className="h-6 w-6 mx-auto text-slate-400" />
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  No active visits remaining today
                </p>
                <button
                  type="button"
                  onClick={() => setQuickBookOpen(true)}
                  className="text-xs font-bold text-[#006D77] dark:text-[#83C5BE] hover:underline cursor-pointer"
                >
                  Schedule a walk-in patient →
                </button>
              </div>
            ) : (
              <div className="space-y-3 relative before:absolute before:left-[15px] before:top-3 before:bottom-3 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                {todayQueue.map((slot) => (
                  <div key={slot.id} className="relative pl-9">
                    <span
                      className={`absolute left-2.5 top-2.5 h-3 w-3 rounded-full border-2 border-white dark:border-[#0B1F33] ${
                        slot.status === "CONFIRMED"
                          ? "bg-[#006D77]"
                          : slot.status === "PENDING"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                    />
                    <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#112a44]/60 p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono font-bold text-[#006D77] dark:text-[#83C5BE]">
                          {slot.time}
                        </span>
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                            slot.status === "CONFIRMED"
                              ? "bg-teal-100/80 dark:bg-teal-950 text-[#006D77] dark:text-[#83C5BE]"
                              : slot.status === "PENDING"
                              ? "bg-amber-100/80 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                              : "bg-emerald-100/80 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                          }`}
                        >
                          {slot.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {slot.patientName}
                      </p>
                      <div className="flex items-center gap-2 pt-0.5">
                        {slot.status === "CONFIRMED" ? (
                          <Link
                            href={`/consultation/${slot.id}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#006D77] hover:bg-[#00565e] px-2.5 py-1 text-[10px] font-bold text-white transition-colors"
                          >
                            <Video className="h-3 w-3" /> Join Call
                          </Link>
                        ) : slot.status === "PENDING" ? (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(slot.id, "CONFIRMED")}
                            className="inline-flex items-center gap-1 rounded-lg bg-amber-600 hover:bg-amber-700 px-2.5 py-1 text-[10px] font-bold text-white transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="h-3 w-3" /> Accept Slot
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setDrawerPatientId(slot.patientId)}
                          className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:text-[#006D77] dark:hover:text-[#83C5BE] cursor-pointer"
                        >
                          View Chart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Clinician Tools Card */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B1F33] p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
              Clinician Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <Link
                href="/messages"
                className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#006D77] hover:text-[#006D77] dark:hover:text-[#83C5BE] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#006D77] dark:text-[#83C5BE]" />
                  Patient Follow-Up Messages
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
              <button
                type="button"
                onClick={() => setSettingsModalOpen(true)}
                className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#006D77] hover:text-[#006D77] dark:hover:text-[#83C5BE] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-[#006D77] dark:text-[#83C5BE]" />
                  Update Consultation Fees & Modes
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ── WORKING INTERACTIVE MODALS & SLIDE-OVER DRAWER ── */}
      <QuickRxModal
        isOpen={Boolean(rxModalTarget)}
        onClose={() => setRxModalTarget(null)}
        appointmentId={rxModalTarget?.appointmentId || ""}
        patientId={rxModalTarget?.patientId || ""}
        patientName={rxModalTarget?.patientName || ""}
        patientMeta={rxModalTarget?.patientMeta}
        existingPrescription={rxModalTarget?.existingPrescription}
        onSuccess={() => {
          showToast("Digital e-Prescription signed & synced to patient records!");
          fetchDashboardData();
        }}
      />

      <QuickPatientChartDrawer
        patientId={drawerPatientId}
        onClose={() => setDrawerPatientId(null)}
        onWriteRx={(apptId, pId, pName, existingRx) => {
          setDrawerPatientId(null);
          setRxModalTarget({
            appointmentId: apptId,
            patientId: pId,
            patientName: pName,
            existingPrescription: existingRx,
          });
        }}
      />

      <PracticeSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        initialData={{
          specialization: stats.specialization,
          consultationFee: stats.consultationFee,
          city: stats.city,
          consultationModes: stats.consultationModes,
          bio: stats.bio,
          experienceYears: stats.experienceYears,
        }}
        onSuccess={() => {
          showToast("Practice profile & fees updated successfully!");
          fetchDashboardData();
        }}
      />

      <QuickBookModal
        isOpen={quickBookOpen}
        onClose={() => setQuickBookOpen(false)}
        onSuccess={() => {
          showToast("Walk-in / follow-up patient scheduled and video room generated!");
          fetchDashboardData();
        }}
      />
    </div>
  );
}
