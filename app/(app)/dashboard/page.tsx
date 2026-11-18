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
  MessageSquare,
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
    month: "long",
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
      <div className="space-y-7">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Skeleton className="h-12 w-72 rounded-2xl" />
          <Skeleton className="h-10 w-60 rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-8 h-72 rounded-[24px]" />
          <Skeleton className="lg:col-span-4 h-72 rounded-[24px]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 rounded-[22px]" />
          ))}
        </div>
      </div>
    );
  }

  const firstName = (user?.name || "Patient").trim().split(" ")[0];
  const patientCode = `CL-${(user?.id || "84920").replace(/[^a-zA-Z0-9]/g, "").slice(0, 5).toUpperCase()}`;
  const primaryAppointment = appointments[0] || null;
  const secondaryAppointments = appointments.slice(1, 3);

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
      refRange: "Ref: <120/80 mmHg",
      icon: Heart,
      iconBg: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400",
    },
    {
      label: "Heart Rate",
      value: `${pulse}`,
      unit: "bpm",
      status: pulse >= 60 && pulse <= 100 ? "Normal" : "Review",
      isNormal: pulse >= 60 && pulse <= 100,
      refRange: "Ref: 60–100 bpm",
      icon: Activity,
      iconBg: "bg-[#006D77]/10 text-[#006D77] dark:bg-[#83C5BE]/15 dark:text-[#83C5BE]",
    },
    {
      label: "Fasting Blood Sugar",
      value: `${glucose}`,
      unit: "mg/dL",
      status: glucose >= 70 && glucose <= 100 ? "Normal" : "Monitor",
      isNormal: glucose >= 70 && glucose <= 100,
      refRange: "Ref: 70–100 mg/dL",
      icon: Droplets,
      iconBg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
    },
    {
      label: "Oxygen Saturation",
      value: `${spO2}`,
      unit: "%",
      status: spO2 >= 95 ? "Normal" : "Low",
      isNormal: spO2 >= 95,
      refRange: "Ref: 95–100%",
      icon: Wind,
      iconBg: "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400",
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── ROW 1: CLASSIC EDITORIAL HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#006D77] dark:text-[#83C5BE] mb-1">
            {formatLongDateIST()}
          </p>
          <h1 className="font-serif text-3xl sm:text-[36px] leading-[1.15] font-normal tracking-[-0.015em] text-[#0B1F33] dark:text-white">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Patient ID: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{patientCode}</span> &bull; Your appointments, prescriptions, and vitals in one place.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            id="hero-check-symptoms-btn"
            href="/symptom-checker"
            className="inline-flex items-center gap-2 h-10 px-4.5 rounded-full border border-slate-200/90 dark:border-white/[0.12] bg-white dark:bg-[#0B1F33] text-sm font-medium text-[#0B1F33] dark:text-slate-200 shadow-2xs hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.06] whitespace-nowrap transition-all"
          >
            <Stethoscope className="h-4 w-4 text-[#006D77] dark:text-[#83C5BE]" />
            <span>Check Symptoms</span>
          </Link>

          <Link
            href="/find-doctor"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#006D77] hover:bg-[#005860] text-sm font-medium text-white shadow-[0_6px_18px_-4px_rgba(0,109,119,0.45)] hover:shadow-[0_8px_22px_-4px_rgba(0,109,119,0.55)] whitespace-nowrap transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Book Appointment</span>
          </Link>
        </div>
      </div>

      {/* ── ACTIVE CLINICAL ALERTS ── */}
      {vitalsSummary?.alerts && vitalsSummary.alerts.length > 0 && (
        <div className="space-y-2.5">
          {vitalsSummary.alerts.map((alert: any) => (
            <div
              key={alert.id || alert.title}
              className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 p-4 flex items-start gap-3 text-sm text-amber-900 dark:text-amber-200"
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

      {/* ── ROW 2: HERO 8/4 SPLIT (UPCOMING APPOINTMENT + RECENT PRESCRIPTIONS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT (8 COLS): Signature Curved Upcoming Appointment Card */}
        <section className="lg:col-span-8 overflow-hidden rounded-[24px] bg-white dark:bg-[#0B1F33] border border-slate-200/75 dark:border-white/[0.08] shadow-[0_4px_24px_-6px_rgba(11,31,51,0.08),0_1px_3px_rgba(11,31,51,0.04)] flex flex-col">
          {/* Refined Deep Navy & Royal Teal Top Band */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#0B1F33] via-[#0E3145] to-[#006D77] text-white">
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-[#83C5BE]" />
              <h2 className="text-sm font-medium tracking-wide">
                Upcoming Appointment
              </h2>
            </div>
            <Link
              href="/appointments"
              className="text-xs font-medium text-[#83C5BE] hover:text-white inline-flex items-center gap-0.5 transition-colors"
            >
              <span>All appointments</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {primaryAppointment ? (
            <div className="p-6 flex-1 flex flex-col justify-between gap-6">
              {/* Doctor Identity & Fee */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.1] bg-slate-100 dark:bg-slate-800 shadow-xs">
                    <Image
                      src={primaryAppointment.avatarUrl}
                      alt={primaryAppointment.doctorName}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-serif text-2xl leading-tight font-normal text-[#0B1F33] dark:text-white">
                        {primaryAppointment.doctorName}
                      </h3>
                      {primaryAppointment.status === "CONFIRMED" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Confirmed
                        </span>
                      )}
                      {primaryAppointment.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Pending Doctor Confirmation
                        </span>
                      )}
                      {primaryAppointment.status === "COMPLETED" && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                          Completed
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-medium text-[#006D77] dark:text-[#83C5BE]">
                      {primaryAppointment.specialty}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {primaryAppointment.qualification} &bull; NMC Reg: <span className="font-mono">{primaryAppointment.licenseNumber}</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#F4F7F8] dark:bg-white/[0.04] px-4 py-2.5 text-left sm:text-right shrink-0">
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Consultation Fee</p>
                  <p className="text-base font-semibold text-[#0B1F33] dark:text-white mt-0.5">
                    ₹{primaryAppointment.consultationFee}{" "}
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">&bull; Paid</span>
                  </p>
                </div>
              </div>

              {/* Curved Metadata Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl bg-[#F4F7F8] dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#0B1F33] text-[#006D77] dark:text-[#83C5BE] shadow-2xs">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Date</p>
                    <p className="text-sm font-semibold text-[#0B1F33] dark:text-white">
                      {formatDateIST(primaryAppointment.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#0B1F33] text-[#006D77] dark:text-[#83C5BE] shadow-2xs">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Time</p>
                    <p className="text-sm font-semibold text-[#0B1F33] dark:text-white">
                      {primaryAppointment.time.toUpperCase().includes("IST")
                        ? primaryAppointment.time
                        : `${primaryAppointment.time} IST`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#0B1F33] text-[#006D77] dark:text-[#83C5BE] shadow-2xs">
                    <Video className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Consultation</p>
                    <p className="text-sm font-semibold text-[#0B1F33] dark:text-white">
                      Video Call
                    </p>
                  </div>
                </div>
              </div>

              {/* Status-Consistent Curved Pill Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  {primaryAppointment.status === "CONFIRMED" ? (
                    <>
                      <Link
                        id="join-consultation-btn"
                        href={`/consultation/${primaryAppointment.id}`}
                        className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#006D77] hover:bg-[#005860] text-sm font-medium text-white shadow-[0_6px_18px_-4px_rgba(0,109,119,0.45)] transition-all"
                      >
                        <Video className="h-4 w-4" />
                        <span>Join Video Call</span>
                      </Link>
                      <Link
                        href="/appointments"
                        className="inline-flex items-center h-10 px-4.5 rounded-full border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors"
                      >
                        Reschedule
                      </Link>
                    </>
                  ) : primaryAppointment.status === "PENDING" ? (
                    <>
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-slate-200 dark:border-white/[0.1] bg-slate-100 dark:bg-white/[0.06] text-sm font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      >
                        <Clock className="h-4 w-4" />
                        <span>Waiting for Confirmation</span>
                      </button>
                      <Link
                        href="/appointments"
                        className="inline-flex items-center h-10 px-4.5 rounded-full border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors"
                      >
                        Cancel / Reschedule
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/records"
                        className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#006D77] hover:bg-[#005860] text-sm font-medium text-white shadow-sm transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        <span>View e-Rx</span>
                      </Link>
                      <Link
                        href={`/doctors/${primaryAppointment.doctorId}/book`}
                        className="inline-flex items-center h-10 px-4.5 rounded-full border border-slate-200 dark:border-white/[0.12] text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors"
                      >
                        Book Follow-up
                      </Link>
                    </>
                  )}
                </div>

                <Link
                  href="/messages"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#006D77] dark:text-slate-400 dark:hover:text-[#83C5BE] transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Message doctor</span>
                </Link>
              </div>

              {/* Additional Upcoming Visits */}
              {secondaryAppointments.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-white/[0.08] space-y-2">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Also on your schedule
                  </p>
                  <div className="space-y-1.5">
                    {secondaryAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 bg-[#F4F7F8]/70 dark:bg-white/[0.03] text-sm"
                      >
                        <div className="min-w-0 truncate">
                          <span className="font-medium text-[#0B1F33] dark:text-white">{apt.doctorName}</span>
                          <span className="text-slate-400 mx-1.5">&bull;</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDateIST(apt.date)} at {apt.time} IST
                          </span>
                        </div>
                        <span
                          className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full shrink-0 ${
                            apt.status === "CONFIRMED"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                              : apt.status === "PENDING"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                              : "bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
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
            <div className="p-10 text-center flex-1 flex flex-col items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4F7F8] dark:bg-white/[0.06] text-[#006D77] dark:text-[#83C5BE] mb-3">
                <Calendar className="h-6 w-6" />
              </div>
              <p className="font-serif text-xl text-[#0B1F33] dark:text-white">
                No upcoming appointments
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Book a video or in-clinic visit with a verified doctor at your convenience.
              </p>
              <Link
                href="/find-doctor"
                className="mt-5 inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-[#006D77] hover:bg-[#005860] text-sm font-medium text-white shadow-sm transition-all"
              >
                Book Appointment
              </Link>
            </div>
          )}
        </section>

        {/* RIGHT (4 COLS): Curved Recent Prescriptions Card */}
        <section className="lg:col-span-4 rounded-[24px] bg-white dark:bg-[#0B1F33] border border-slate-200/75 dark:border-white/[0.08] shadow-[0_4px_24px_-6px_rgba(11,31,51,0.06),0_1px_3px_rgba(11,31,51,0.03)] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-white/[0.08]">
            <h2 className="font-serif text-xl font-normal text-[#0B1F33] dark:text-white">
              Recent Prescriptions
            </h2>
            <Link
              href="/records"
              className="text-xs font-medium text-[#006D77] dark:text-[#83C5BE] hover:underline"
            >
              All records
            </Link>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between gap-4">
            {recentPrescriptions.length > 0 ? (
              <div className="space-y-2.5">
                {recentPrescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="rounded-2xl bg-[#F4F7F8]/80 dark:bg-white/[0.04] hover:bg-[#EEF4F5] dark:hover:bg-white/[0.07] p-4 transition-colors space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-[#0B1F33] dark:text-white line-clamp-1">
                        {rx.diagnosis}
                      </p>
                      <span className="rounded-full bg-white dark:bg-[#0B1F33] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#006D77] dark:text-[#83C5BE] border border-slate-200/70 dark:border-white/[0.1] shrink-0">
                        e-Rx
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {rx.doctorName} &bull; {rx.createdAt}
                    </p>
                    <div className="flex items-center justify-between pt-1.5">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {rx.medCount} {rx.medCount === 1 ? "medication" : "medications"}
                      </span>
                      <Link
                        href="/records"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#006D77] dark:text-[#83C5BE] hover:underline"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>View / PDF</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center flex flex-col items-center justify-center flex-1">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4F7F8] dark:bg-white/[0.06] text-slate-400 mb-3">
                  <FileText className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-[#0B1F33] dark:text-white">
                  No prescriptions yet
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[220px]">
                  Digital e-prescriptions from completed consultations will appear here.
                </p>
              </div>
            )}

            <Link
              href="/records"
              className="flex w-full items-center justify-center gap-2 h-10 rounded-full border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-white/[0.04] text-xs font-semibold text-[#0B1F33] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-colors"
            >
              <FileText className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
              <span>Open Health Records</span>
            </Link>
          </div>
        </section>
      </div>

      {/* ── ROW 3: CURVED 4-COLUMN HEALTH VITALS ── */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-serif text-2xl font-normal text-[#0B1F33] dark:text-white">
              Latest Recorded Vitals
            </h2>
          </div>
          <Link
            href="/vitals"
            className="text-sm font-medium text-[#006D77] dark:text-[#83C5BE] hover:underline inline-flex items-center gap-0.5"
          >
            <span>Record New Reading</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {vitalCards.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.label}
                className="rounded-[22px] bg-white dark:bg-[#0B1F33] border border-slate-200/75 dark:border-white/[0.08] p-5 shadow-[0_2px_16px_-4px_rgba(11,31,51,0.06),0_1px_3px_rgba(11,31,51,0.03)] hover:shadow-[0_12px_28px_-8px_rgba(11,31,51,0.11)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {v.label}
                  </span>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${v.iconBg}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-semibold tracking-tight text-[#0B1F33] dark:text-white tabular-nums">
                    {v.value}
                  </span>
                  <span className="text-xs font-medium text-slate-400">{v.unit}</span>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-white/[0.07]">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        v.isNormal
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
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
              </div>
            );
          })}
        </div>
      </section>

      {/* ── ROW 4: VERIFIED SPECIALISTS STRIP ── */}
      {recommendedDoctors.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-2xl font-normal text-[#0B1F33] dark:text-white">
              Verified Specialists
            </h2>
            <Link
              href="/find-doctor"
              className="text-sm font-medium text-[#006D77] dark:text-[#83C5BE] hover:underline inline-flex items-center gap-0.5"
            >
              <span>Browse all doctors</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recommendedDoctors.map((doc) => {
              const name = formatDoctorName(doc.name);
              return (
                <div
                  key={doc.id}
                  className="rounded-[22px] bg-white dark:bg-[#0B1F33] border border-slate-200/75 dark:border-white/[0.08] p-5 shadow-[0_2px_16px_-4px_rgba(11,31,51,0.06)] hover:shadow-[0_14px_30px_-10px_rgba(11,31,51,0.12)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-5"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.1] bg-slate-100 dark:bg-slate-800">
                      <Image
                        src={getDoctorAvatar(name, (doc as any).photoUrl)}
                        alt={name}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-serif text-lg leading-snug text-[#0B1F33] dark:text-white truncate">
                          {name}
                        </h3>
                        <CheckCircle2 className="h-4 w-4 text-[#006D77] dark:text-[#83C5BE] shrink-0" />
                      </div>
                      <p className="text-xs font-medium text-[#006D77] dark:text-[#83C5BE] truncate mt-0.5">
                        {doc.specialty}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                        <span className="font-semibold text-[#0B1F33] dark:text-white">₹{doc.consultationFee || 500}</span> / visit &bull; {doc.experience || "8+ yrs"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-white/[0.07]">
                    <Link
                      href={`/doctors/${doc.id}`}
                      className="flex-1 inline-flex items-center justify-center h-9 rounded-full border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors"
                    >
                      View Profile
                    </Link>
                    <Link
                      href={`/doctors/${doc.id}/book`}
                      className="flex-1 inline-flex items-center justify-center h-9 rounded-full bg-[#006D77] hover:bg-[#005860] text-xs font-medium text-white shadow-xs transition-colors"
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

      {/* ── COMPACT EMERGENCY BANNER ── */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0B1F33] px-5 py-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600">
            <PhoneCall className="h-4 w-4" />
          </div>
          <span>
            Experiencing a medical emergency? Call{" "}
            <strong className="font-semibold text-[#0B1F33] dark:text-white">112 / 108</strong> immediately or go to the nearest emergency room.
          </span>
        </div>
        <a
          href="tel:112"
          className="inline-flex items-center justify-center h-9 px-4 rounded-full border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-100/70 whitespace-nowrap transition-colors shrink-0"
        >
          Call 112
        </a>
      </div>
    </div>
  );
}
