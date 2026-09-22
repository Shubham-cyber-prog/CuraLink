"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface DoctorStats {
  todayAppointments: number;
  totalPatients: number;
  pendingRequests: number;
  completedConsultations: number;
  consultationFee: number;
  specialization: string;
  verificationStatus: string;
}

interface TrustCardData {
  phoneVerified: boolean;
  profileCompleted: boolean;
  accountAgeInDays: number;
  memberSinceMonths: number;
  totalPastAppointments: number;
  noShowCount: number;
}

interface AppointmentItem {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  date: string;
  time: string;
  status: string;
  roomName: string;
  roomUrl: string;
  fee: number;
  paymentStatus: string;
  hasPrescription: boolean;
  trustCard?: TrustCardData;
}

interface PatientItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  lastVisit: string;
  lastVisitDate: string;
  lastStatus: string;
  primaryCondition: string;
  riskLevel: "Low" | "Moderate" | "High";
  totalVisits: number;
  trustCard?: TrustCardData;
}

// Clean clinical initial state
const INITIAL_STATS: DoctorStats = {
  todayAppointments: 0,
  totalPatients: 0,
  pendingRequests: 0,
  completedConsultations: 0,
  consultationFee: 0,
  specialization: "General Practice",
  verificationStatus: "APPROVED",
};

const INITIAL_APPOINTMENTS: AppointmentItem[] = [];

const INITIAL_PATIENTS: PatientItem[] = [];

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DoctorStats>(INITIAL_STATS);
  const [appointments, setAppointments] = useState<AppointmentItem[]>(INITIAL_APPOINTMENTS);
  const [patients, setPatients] = useState<PatientItem[]>(INITIAL_PATIENTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [apptFilter, setApptFilter] = useState<"ALL" | "CONFIRMED" | "COMPLETED" | "CANCELLED">("ALL");
  const [patientSearch, setPatientSearch] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch Stats
      const statsData = await api.get<DoctorStats>("/doctor/me/dashboard-stats").catch(() => null);
      if (statsData?.success && statsData.data) {
        setStats(statsData.data);
      }

      // 2. Fetch Appointments
      const apptsData = await api.get<AppointmentItem[]>("/doctor/me/appointments").catch(() => null);
      if (apptsData?.success && Array.isArray(apptsData.data)) {
        setAppointments(apptsData.data);
      } else {
        setAppointments([]);
      }

      // 3. Fetch Patients
      const patientsData = await api.get<PatientItem[]>("/doctor/me/patients").catch(() => null);
      if (patientsData?.success && Array.isArray(patientsData.data)) {
        setPatients(patientsData.data);
      } else {
        setPatients([]);
      }
    } catch (err) {
      console.warn("Error fetching doctor dashboard data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateStatus = async (apptId: string, newStatus: "CONFIRMED" | "CANCELLED" | "COMPLETED") => {
    try {
      const res = await api.patch(`/doctor/me/appointments/${apptId}`, { status: newStatus }).catch(() => null);

      if (res?.success) {
        setStatusMessage(`Appointment marked as ${newStatus.toLowerCase()}.`);
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      console.error("Status update error:", err);
    }

    // Optimistically update local state
    setAppointments((prev) =>
      prev.map((a) => (a.id === apptId ? { ...a, status: newStatus } : a))
    );
  };

  const filteredAppointments = appointments.filter((a) => {
    if (apptFilter === "ALL") return true;
    return a.status === apptFilter;
  });

  const filteredPatients = patients.filter((p) => {
    const q = patientSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.primaryCondition.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8 pb-12">
      {/* ── HEADER & PRACTICE INFO ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Clinical Practice Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 px-2 py-0.5 text-xs font-semibold text-[#085041] dark:text-teal-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Clinician
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Welcome back, Doctor. Manage your patient consultations, vitals reviews, and e-prescriptions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151B2E] px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <div className="rounded-lg bg-[#085041] text-white px-3.5 py-2 text-xs font-semibold shadow-xs">
            Fee: ₹{stats.consultationFee} / session
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 p-3.5 text-xs font-medium text-[#085041] dark:text-teal-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {statusMessage}
        </div>
      )}

      {/* ── 1. SUMMARY STAT CARDS ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Appointments */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2E] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today&apos;s Visits
            </p>
            <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-[#085041] dark:text-teal-300">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.todayAppointments}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Scheduled for today
            </p>
          </div>
        </div>

        {/* Total Patients */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2E] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Patients
            </p>
            <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-[#085041] dark:text-teal-300">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalPatients}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Under clinical care
            </p>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2E] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pending Action
            </p>
            <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.pendingRequests}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Awaiting session review
            </p>
          </div>
        </div>

        {/* Completed Consultations */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2E] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Completed Visits
            </p>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.completedConsultations}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Prescriptions & records saved
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. APPOINTMENTS SECTION ── */}
      <section id="appointments" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Patient Consultations Schedule
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Accept, cancel, or join real-time encrypted telehealth sessions.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-[#070b14] p-1">
            {(["ALL", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setApptFilter(filterKey)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  apptFilter === filterKey
                    ? "bg-white dark:bg-[#151B2E] text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {filterKey === "ALL" ? "All" : filterKey.charAt(0) + filterKey.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments Table Card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2E] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0f172a] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Patient</th>
                  <th className="px-4 py-3.5">Date & Time</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Prescription</th>
                  <th className="px-5 py-3.5 text-right">Clinical Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-500 dark:text-slate-400">
                      No appointments found matching this filter.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appt) => {
                    const isConfirmed = appt.status === "CONFIRMED";
                    const isCompleted = appt.status === "COMPLETED";
                    const isCancelled = appt.status === "CANCELLED";

                    return (
                      <tr key={appt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        {/* Patient info */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {appt.patientName.charAt(0)}
                            </div>
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Link
                                  href={`/doctor-dashboard/patients/${appt.patientId}`}
                                  className="font-semibold text-slate-900 dark:text-white hover:text-[#085041] dark:hover:text-teal-400 transition-colors"
                                >
                                  {appt.patientName}
                                </Link>
                                <span className="text-[11px] text-slate-400 dark:text-slate-500">·</span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                                  {appt.patientEmail}
                                </span>
                              </div>

                              {/* Compact Patient Trust Card / Verification Indicators */}
                              {appt.trustCard && (
                                <div className="flex items-center gap-1 flex-wrap text-[10px]">
                                  {/* Phone Verification Pill */}
                                  {appt.trustCard.phoneVerified ? (
                                    <span
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                                      title="Phone verified via OTP"
                                    >
                                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                                      Phone Verified
                                    </span>
                                  ) : (
                                    <span
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60"
                                      title="Patient has not verified phone number"
                                    >
                                      <AlertCircle className="h-2.5 w-2.5 text-amber-500" />
                                      Unverified
                                    </span>
                                  )}

                                  {/* Profile Completed Pill */}
                                  {appt.trustCard.profileCompleted ? (
                                    <span
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-medium bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60"
                                      title="Profile Complete (Name, Age, Gender)"
                                    >
                                      <ShieldCheck className="h-2.5 w-2.5 text-[#085041] dark:text-teal-400" />
                                      Complete
                                    </span>
                                  ) : (
                                    <span
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                                      title="Incomplete demographic profile"
                                    >
                                      Incomplete
                                    </span>
                                  )}

                                  {/* Member Duration */}
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-medium bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
                                    {appt.trustCard.memberSinceMonths > 0
                                      ? `Member ${appt.trustCard.memberSinceMonths}mo`
                                      : appt.trustCard.accountAgeInDays > 0
                                      ? `New (${appt.trustCard.accountAgeInDays}d)`
                                      : "New patient"}
                                  </span>

                                  {/* Past platform appointments */}
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                                    {appt.trustCard.totalPastAppointments > 0
                                      ? `${appt.trustCard.totalPastAppointments} past ${
                                          appt.trustCard.totalPastAppointments === 1 ? "visit" : "visits"
                                        }`
                                      : "1st visit"}
                                  </span>

                                  {/* No show warning */}
                                  {appt.trustCard.noShowCount > 0 && (
                                    <span
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-medium bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60"
                                      title="Patient missed scheduled appointments without prior cancellation"
                                    >
                                      <AlertCircle className="h-2.5 w-2.5 text-rose-600" />
                                      {appt.trustCard.noShowCount} missed
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">
                          <p className="font-medium">{appt.date}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{appt.time}</p>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                              isConfirmed
                                ? "bg-teal-50 dark:bg-teal-950/50 text-[#085041] dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                                : isCompleted
                                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                : "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                            }`}
                          >
                            {appt.status}
                          </span>
                        </td>

                        {/* Prescription */}
                        <td className="px-4 py-3.5">
                          {appt.hasPrescription ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Issued
                            </span>
                          ) : (
                            <Link
                              href={`/doctor-dashboard/patients/${appt.patientId}?appointmentId=${appt.id}#prescribe`}
                              className="text-[11px] text-slate-500 hover:text-[#085041] dark:hover:text-teal-400 underline font-medium"
                            >
                              Issue Rx
                            </Link>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {/* Join Telehealth Video Consultation */}
                            {isConfirmed && (
                              <Link
                                href={`/consultation/${appt.id}`}
                                className="inline-flex items-center gap-1 rounded-md bg-[#085041] hover:bg-[#063b30] text-white px-2.5 py-1.5 text-xs font-semibold shadow-xs transition-colors"
                              >
                                <Video className="h-3.5 w-3.5" />
                                Join Call
                              </Link>
                            )}

                            {/* Mark Complete */}
                            {isConfirmed && (
                              <button
                                onClick={() => handleUpdateStatus(appt.id, "COMPLETED")}
                                title="Mark as Completed"
                                className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1C2338] p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              </button>
                            )}

                            {/* Cancel / Reject */}
                            {isConfirmed && (
                              <button
                                onClick={() => handleUpdateStatus(appt.id, "CANCELLED")}
                                title="Cancel consultation"
                                className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1C2338] p-1.5 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-colors cursor-pointer"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {/* Re-accept if cancelled */}
                            {isCancelled && (
                              <button
                                onClick={() => handleUpdateStatus(appt.id, "CONFIRMED")}
                                className="rounded-md border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 px-2 py-1 text-xs font-semibold text-[#085041] dark:text-teal-300 hover:bg-teal-100 cursor-pointer"
                              >
                                Re-activate
                              </button>
                            )}

                            {/* View Patient Detail */}
                            <Link
                              href={`/doctor-dashboard/patients/${appt.patientId}`}
                              className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1C2338] px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                              Chart
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

      {/* ── 3. PATIENTS DIRECTORY ── */}
      <section id="patients" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Patient Registry & Risk Triage
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review assigned patient charts, chronic vitals, and diagnostic histories.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Search patients or conditions..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151B2E] pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#085041]"
            />
          </div>
        </div>

        {/* Patients Table */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2E] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0f172a] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Patient Details</th>
                  <th className="px-4 py-3.5">Last Consultation</th>
                  <th className="px-4 py-3.5">Clinical Condition</th>
                  <th className="px-4 py-3.5">Triage Risk</th>
                  <th className="px-5 py-3.5 text-right">Patient Chart</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-500 dark:text-slate-400">
                      No patients matching search query.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => {
                    const isHigh = patient.riskLevel === "High";
                    const isMod = patient.riskLevel === "Moderate";

                    return (
                      <tr key={patient.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-slate-900 dark:text-white">{patient.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{patient.email}</p>
                          {patient.trustCard && (
                            <div className="flex items-center gap-1 mt-1 flex-wrap text-[10px]">
                              {patient.trustCard.phoneVerified ? (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                                  Phone Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                                  Unverified
                                </span>
                              )}
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {patient.trustCard.memberSinceMonths > 0
                                  ? `${patient.trustCard.memberSinceMonths}mo`
                                  : `${patient.trustCard.accountAgeInDays}d`}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">
                          <p className="font-medium">{patient.lastVisit}</p>
                          <p className="text-[11px] text-slate-400">{patient.totalVisits} total visits</p>
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                          {patient.primaryCondition}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold border ${
                              isHigh
                                ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                                : isMod
                                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isHigh ? "bg-red-500" : isMod ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                            />
                            {patient.riskLevel} Risk
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            href={`/doctor-dashboard/patients/${patient.id}`}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1C2338] px-3 py-1.5 text-xs font-semibold text-[#085041] dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors"
                          >
                            Open Chart
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
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
    </div>
  );
}
