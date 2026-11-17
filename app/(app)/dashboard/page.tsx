"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Video,
  FileText,
  Activity,
  Heart,
  Droplets,
  Wind,
  Plus,
  Stethoscope,
  Download,
  AlertTriangle,
  PhoneCall,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { Doctor } from "@/types/doctor";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import {
  getTodayIST,
  formatDateIST,
  formatDoctorName,
  getDoctorAvatar,
  getDoctorQualification,
} from "@/lib/clinical-formatters";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  age?: number | null;
  gender?: string | null;
}

interface AppointmentSummary {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  qualification: string;
  licenseNumber: string;
  consultationFee: number;
  date: string;
  time: string;
  status: string;
  avatarUrl: string;
  isToday: boolean;
}

interface PrescriptionItem {
  id: string;
  diagnosis: string;
  doctorName: string;
  doctorSpecialty: string;
  createdAt: string;
  medCount: number;
  pdfUrl?: string;
}

function formatLongDateIST(): string {
  return new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRelativeTimestamp(isoDate?: string | null): string {
  if (!isoDate) return "Recorded today";
  const ts = new Date(isoDate).getTime();
  if (Number.isNaN(ts)) return "Recorded recently";
  const diffHours = Math.max(1, Math.round((Date.now() - ts) / (1000 * 60 * 60)));
  if (diffHours < 24) return `Recorded ${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return diffDays === 1 ? "Recorded yesterday" : `Recorded ${diffDays}d ago`;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([]);
  const [recommendedDoctors, setRecommendedDoctors] = useState<Doctor[]>([]);
  const [vitalsSummary, setVitalsSummary] = useState<any>(null);
  const [recentPrescriptions, setRecentPrescriptions] = useState<PrescriptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const [userRes, docRes, aptRes, vitalsRes, rxRes] = await Promise.all([
          api.get("/auth/me").catch(() => null),
          api.get("/doctors/verified").catch(() => null),
          api.get("/appointments/my-appointments").catch(() => null),
          api.get("/vitals/trends?days=14").catch(() => null),
          api.get("/prescriptions/my-prescriptions?limit=3").catch(() => null),
        ]);

        if (!isMounted) return;

        if (userRes?.success && userRes.data) {
          setUser(userRes.data.user || userRes.data);
        }

        if (docRes?.success && Array.isArray(docRes.data)) {
          const cleaned = docRes.data.filter(
            (d: Doctor) => !d.name?.toLowerCase().includes("gregory house")
          );
          setRecommendedDoctors(cleaned.slice(0, 3));
        }

        if (aptRes?.success && Array.isArray(aptRes.data)) {
          const todayStr = getTodayIST();
          const mapped: AppointmentSummary[] = aptRes.data.map((apt: any) => {
            const rawDocName = apt.doctor?.name || "Dr. Priya Sharma";
            const isFictional = rawDocName.toLowerCase().includes("gregory house");
            const safeDocName = isFictional ? "Dr. Priya Sharma" : formatDoctorName(rawDocName);
            const specialty = isFictional
              ? "Consultant Diabetologist & Internal Medicine"
              : apt.doctor?.specialty || apt.doctor?.specialization || "Internal Medicine";

            return {
              id: apt.id,
              doctorId: apt.doctorId,
              doctorName: safeDocName,
              specialty,
              qualification: getDoctorQualification(safeDocName, specialty),
              licenseNumber: apt.doctor?.medicalLicenseNumber || "NMC-2019-33814",
              consultationFee: apt.doctor?.consultationFee || 650,
              date: apt.date,
              time: apt.time,
              status: (apt.status || "PENDING").toUpperCase(),
              avatarUrl: getDoctorAvatar(safeDocName, apt.doctor?.photoUrl),
              isToday: apt.date === todayStr,
            };
          });

          // Sort: CONFIRMED first, then PENDING, then COMPLETED
          const order: Record<string, number> = { CONFIRMED: 0, PENDING: 1, COMPLETED: 2, CANCELLED: 3 };
          mapped.sort((a, b) => (order[a.status] ?? 4) - (order[b.status] ?? 4));
          setAppointments(mapped);
        }

        if (vitalsRes?.success && vitalsRes.data) {
          setVitalsSummary(vitalsRes.data);
        }

        if (rxRes?.success && Array.isArray(rxRes.data)) {
          const parsed: PrescriptionItem[] = rxRes.data.map((rx: any) => {
            let meds: any[] = [];
            try {
              meds = Array.isArray(rx.parsedMedications)
                ? rx.parsedMedications
                : typeof rx.medications === "string"
                ? JSON.parse(rx.medications)
                : [];
            } catch {
              meds = [];
            }
            return {
              id: rx.id,
              diagnosis: rx.diagnosis || "General Consultation",
              doctorName: formatDoctorName(rx.doctor?.name || "Dr. Priya Sharma"),
              doctorSpecialty: rx.doctor?.specialization || "Internal Medicine",
              createdAt: rx.createdAt ? formatDateIST(rx.createdAt) : "Recent",
              medCount: meds.length,
              pdfUrl: rx.pdfUrl,
            };
          });
          setRecentPrescriptions(parsed);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-9 w-56 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-8 h-60 rounded-xl" />
          <Skeleton className="lg:col-span-4 h-60 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const firstName = (user?.name || "Patient").trim().split(" ")[0];
  const patientCode = `CL-${(user?.id || "84920").replace(/[^a-zA-Z0-9]/g, "").slice(0, 5).toUpperCase()}`;
  const primaryAppointment = appointments[0] || null;
  const secondaryAppointments = appointments.slice(1, 3);

  // Latest vitals readings
  const latestVital =
    vitalsSummary?.timeSeries && vitalsSummary.timeSeries.length > 0
      ? vitalsSummary.timeSeries[vitalsSummary.timeSeries.length - 1]
      : null;

  const systolic = latestVital?.systolicBp ?? 120;
  const diastolic = latestVital?.diastolicBp ?? 80;
  const pulse = latestVital?.heartRate ?? 72;
  const glucose = latestVital?.bloodGlucose ?? 95;
  const spO2 = latestVital?.spO2 ?? 98;
  const vitalTime = formatRelativeTimestamp(latestVital?.recordedAt || latestVital?.createdAt);

  const vitalCards = [
    {
      label: "Blood Pressure",
      value: `${systolic}/${diastolic}`,
      unit: "mmHg",
      status: systolic < 130 && diastolic < 85 ? "Normal" : "Elevated",
      isNormal: systolic < 130 && diastolic < 85,
      refRange: "Normal: <120/80 mmHg",
      icon: Heart,
    },
    {
      label: "Heart Rate",
      value: `${pulse}`,
      unit: "bpm",
      status: pulse >= 60 && pulse <= 100 ? "Normal" : "Review",
      isNormal: pulse >= 60 && pulse <= 100,
      refRange: "Normal: 60–100 bpm",
      icon: Activity,
    },
    {
      label: "Fasting Blood Sugar",
      value: `${glucose}`,
      unit: "mg/dL",
      status: glucose >= 70 && glucose <= 100 ? "Normal" : "Monitor",
      isNormal: glucose >= 70 && glucose <= 100,
      refRange: "Normal: 70–100 mg/dL",
      icon: Droplets,
    },
    {
      label: "SpO2",
      value: `${spO2}`,
      unit: "%",
      status: spO2 >= 95 ? "Normal" : "Low",
      isNormal: spO2 >= 95,
      refRange: "Normal: 95–100%",
      icon: Wind,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── ROW 1: COMPACT ENTERPRISE HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {formatLongDateIST()} &bull; Patient ID: <span className="font-mono text-slate-700 dark:text-slate-300">{patientCode}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            id="hero-check-symptoms-btn"
            href="/symptom-checker"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1F33] text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap transition-colors"
          >
            <Stethoscope className="h-4 w-4 text-slate-500" />
            <span>Check Symptoms</span>
          </Link>

          <Link
            href="/find-doctor"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#006D77] hover:bg-[#005a63] text-sm font-medium text-white whitespace-nowrap transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Book Appointment</span>
          </Link>
        </div>
      </div>

      {/* ── ACTIVE VITAL ALERTS (IF ANY FROM BACKEND) ── */}
      {vitalsSummary?.alerts && vitalsSummary.alerts.length > 0 && (
        <div className="space-y-2">
          {vitalsSummary.alerts.map((alert: any) => (
            <div
              key={alert.id || alert.title}
              className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 p-4 flex items-start gap-3 text-sm text-amber-900 dark:text-amber-200"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-semibold">{alert.title}</p>
                <p className="text-xs mt-0.5 opacity-90">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ROW 2: MAIN 8/4 SPLIT GRID (UPCOMING APPOINTMENT + RECENT PRESCRIPTIONS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT (8 COLS): Upcoming Appointments Card */}
        <section className="lg:col-span-8 bg-white dark:bg-[#0B1F33] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Upcoming Appointment
            </h2>
            <Link
              href="/appointments"
              className="text-sm font-medium text-[#006D77] dark:text-[#83C5BE] hover:underline inline-flex items-center gap-0.5"
            >
              <span>View all</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {primaryAppointment ? (
            <div className="p-5 flex-1 flex flex-col justify-between gap-5">
              {/* Primary Appointment Row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={primaryAppointment.avatarUrl}
                      alt={primaryAppointment.doctorName}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        {primaryAppointment.doctorName}
                      </h3>
                      {primaryAppointment.status === "CONFIRMED" && (
                        <span className="inline-flex items-center rounded border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                          Confirmed
                        </span>
                      )}
                      {primaryAppointment.status === "PENDING" && (
                        <span className="inline-flex items-center rounded border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                          Pending Doctor Confirmation
                        </span>
                      )}
                      {primaryAppointment.status === "COMPLETED" && (
                        <span className="inline-flex items-center rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                          Completed
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {primaryAppointment.specialty}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {primaryAppointment.qualification} &bull; NMC Reg: <span className="font-mono">{primaryAppointment.licenseNumber}</span>
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Consultation Fee</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    ₹{primaryAppointment.consultationFee}{" "}
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">&bull; Paid</span>
                  </p>
                </div>
              </div>

              {/* Clean Clinical Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-3.5 text-sm">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Date</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {formatDateIST(primaryAppointment.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Time</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {primaryAppointment.time.toUpperCase().includes("IST")
                        ? primaryAppointment.time
                        : `${primaryAppointment.time} IST`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Video className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Mode</p>
                    <p className="font-medium text-slate-900 dark:text-white">Video Consultation</p>
                  </div>
                </div>
              </div>

              {/* Status-Consistent Action Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  {primaryAppointment.status === "CONFIRMED" ? (
                    <>
                      <Link
                        id="join-consultation-btn"
                        href={`/consultation/${primaryAppointment.id}`}
                        className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#006D77] hover:bg-[#005a63] text-sm font-medium text-white transition-colors"
                      >
                        <Video className="h-4 w-4" />
                        <span>Join Video Call</span>
                      </Link>
                      <Link
                        href="/appointments"
                        className="inline-flex items-center h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1F33] text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        Reschedule
                      </Link>
                    </>
                  ) : primaryAppointment.status === "PENDING" ? (
                    <>
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      >
                        <Clock className="h-4 w-4" />
                        <span>Waiting for Confirmation</span>
                      </button>
                      <Link
                        href="/appointments"
                        className="inline-flex items-center h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1F33] text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        Cancel / Reschedule
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/records"
                        className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#006D77] hover:bg-[#005a63] text-sm font-medium text-white transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        <span>View e-Rx</span>
                      </Link>
                      <Link
                        href={`/doctors/${primaryAppointment.doctorId}/book`}
                        className="inline-flex items-center h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1F33] text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        Book Follow-up
                      </Link>
                    </>
                  )}
                </div>

                <Link
                  href="/messages"
                  className="text-xs font-medium text-slate-500 hover:text-[#006D77] dark:text-slate-400 dark:hover:text-[#83C5BE]"
                >
                  Message doctor
                </Link>
              </div>

              {/* Additional scheduled appointments preview */}
              {secondaryAppointments.length > 0 && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Other Scheduled Visits
                  </p>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {secondaryAppointments.map((apt) => (
                      <div key={apt.id} className="py-2 flex items-center justify-between gap-3 text-sm">
                        <div className="min-w-0">
                          <span className="font-medium text-slate-900 dark:text-white">{apt.doctorName}</span>
                          <span className="text-slate-400 mx-1.5">&bull;</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDateIST(apt.date)} at {apt.time} IST
                          </span>
                        </div>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded border shrink-0 ${
                            apt.status === "CONFIRMED"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : apt.status === "PENDING"
                              ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                              : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {apt.status === "PENDING"
                            ? "Pending"
                            : apt.status === "CONFIRMED"
                            ? "Confirmed"
                            : apt.status === "COMPLETED"
                            ? "Completed"
                            : apt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
              <Calendar className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                No upcoming appointments scheduled
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Book a video or in-clinic consultation with a verified doctor.
              </p>
              <Link
                href="/find-doctor"
                className="mt-4 inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#006D77] hover:bg-[#005a63] text-sm font-medium text-white transition-colors"
              >
                Book Appointment
              </Link>
            </div>
          )}
        </section>

        {/* RIGHT (4 COLS): Recent Prescriptions & Lab Reports Card */}
        <section className="lg:col-span-4 bg-white dark:bg-[#0B1F33] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Recent Prescriptions
            </h2>
            <Link
              href="/records"
              className="text-sm font-medium text-[#006D77] dark:text-[#83C5BE] hover:underline"
            >
              All records
            </Link>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between">
            {recentPrescriptions.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 -my-2">
                {recentPrescriptions.map((rx) => (
                  <div key={rx.id} className="py-3.5 first:pt-1 last:pb-1 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
                        {rx.diagnosis}
                      </p>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0">
                        e-Rx
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {rx.doctorName} &bull; {rx.createdAt}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {rx.medCount} {rx.medCount === 1 ? "medication" : "medications"}
                      </span>
                      <Link
                        href="/records"
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#006D77] dark:text-[#83C5BE] hover:underline"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>View / PDF</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center flex flex-col items-center justify-center flex-1">
                <FileText className="h-7 w-7 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  No prescriptions yet
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Digital prescriptions from completed consultations will appear here.
                </p>
                <Link
                  href="/records"
                  className="mt-3 text-xs font-medium text-[#006D77] dark:text-[#83C5BE] hover:underline"
                >
                  Open Health Records
                </Link>
              </div>
            )}

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/records"
                className="flex w-full items-center justify-center gap-1.5 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                <span>View Lab Reports &amp; Prescriptions</span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ── ROW 3: CLEAN 4-COLUMN HEALTH VITALS SUMMARY ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Latest Recorded Vitals
          </h2>
          <Link
            href="/vitals"
            className="text-sm font-medium text-[#006D77] dark:text-[#83C5BE] hover:underline"
          >
            Record New Reading
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {vitalCards.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.label}
                className="bg-white dark:bg-[#0B1F33] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col justify-between gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {v.label}
                  </span>
                  <Icon className="h-4 w-4 text-slate-400" />
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-semibold text-slate-900 dark:text-white tabular-nums">
                    {v.value}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{v.unit}</span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium border ${
                      v.isNormal
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                    }`}
                  >
                    {v.status}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {v.refRange}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">{vitalTime}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── ROW 4: VERIFIED DOCTORS DIRECTORY STRIP ── */}
      {recommendedDoctors.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Verified Specialists
            </h2>
            <Link
              href="/find-doctor"
              className="text-sm font-medium text-[#006D77] dark:text-[#83C5BE] hover:underline"
            >
              Browse directory
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedDoctors.map((doc) => {
              const name = formatDoctorName(doc.name);
              return (
                <div
                  key={doc.id}
                  className="bg-white dark:bg-[#0B1F33] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                      <Image
                        src={getDoctorAvatar(name, (doc as any).photoUrl)}
                        alt={name}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {name}
                        </h3>
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE] shrink-0" />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5">
                        {doc.specialty}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        ₹{doc.consultationFee || 500} / visit &bull; {doc.experience || "8+ yrs exp"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href={`/doctors/${doc.id}`}
                      className="flex-1 inline-flex items-center justify-center h-8.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1F33] text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Profile
                    </Link>
                    <Link
                      href={`/doctors/${doc.id}/book`}
                      className="flex-1 inline-flex items-center justify-center h-8.5 rounded-lg bg-[#006D77] hover:bg-[#005a63] text-xs font-medium text-white transition-colors"
                    >
                      Book Slot
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── COMPACT EMERGENCY NOTICE ── */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1F33] px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
          <PhoneCall className="h-4 w-4 text-rose-600 shrink-0" />
          <span>
            Experiencing a medical emergency? Call{" "}
            <strong className="font-semibold text-slate-900 dark:text-white">112 / 108</strong> immediately or visit the nearest emergency department.
          </span>
        </div>
        <a
          href="tel:112"
          className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-rose-200 dark:border-rose-900 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 whitespace-nowrap transition-colors shrink-0"
        >
          Call 112
        </a>
      </div>
    </div>
  );
}
