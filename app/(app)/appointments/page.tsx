"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Plus,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { AppointmentCard, AppointmentData } from "@/components/appointments/AppointmentCard";
import { Doctor } from "@/types/doctor";
import { api } from "@/lib/api";
import { formatDateIST, formatDoctorName } from "@/lib/clinical-formatters";

type TabType = "upcoming" | "pending" | "completed" | "cancelled";

export default function AppointmentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [doctorMap, setDoctorMap] = useState<Record<string, Doctor>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [appointmentToCancel, setAppointmentToCancel] = useState<AppointmentData | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchAppointmentsAndDoctors = async () => {
      try {
        const [docRes, aptRes] = await Promise.all([
          api.get("/doctors/verified").catch(() => null),
          api.get("/appointments/my-appointments"),
        ]);

        if (docRes?.success && Array.isArray(docRes.data)) {
          const map: Record<string, Doctor> = {};
          for (const d of docRes.data) {
            map[d.id] = d;
            if ((d as any).userId) map[(d as any).userId] = d;
            if ((d as any).profileId) map[(d as any).profileId] = d;
          }
          setDoctorMap(map);
        }

        if (!aptRes?.success) {
          throw new Error(aptRes?.message || "Failed to fetch appointments");
        }

        setAppointments(aptRes.data || []);
      } catch (err: any) {
        if (err?.status === 401) {
          router.replace("/login?redirect=/appointments");
          return;
        }
        setError(err.message || "Unable to load appointments.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointmentsAndDoctors();
  }, [router]);

  const handleConfirmCancel = async () => {
    if (!appointmentToCancel) return;

    try {
      setIsCancelling(true);
      setCancelError(null);

      const data = await api.patch(`/appointments/${appointmentToCancel.id}/status`, {
        status: "CANCELLED",
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to cancel appointment");
      }

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointmentToCancel.id ? { ...a, status: "CANCELLED" } : a
        )
      );

      setStatusMessage("Appointment cancelled. Your doctor has been notified.");
      setTimeout(() => setStatusMessage(null), 4000);
      setAppointmentToCancel(null);
    } catch (err: any) {
      setCancelError(err.message || "Could not cancel appointment. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const counts = useMemo(() => {
    return {
      confirmed: appointments.filter((a) => a.status?.toUpperCase() === "CONFIRMED").length,
      pending: appointments.filter((a) => a.status?.toUpperCase() === "PENDING").length,
      completed: appointments.filter((a) => a.status?.toUpperCase() === "COMPLETED").length,
      cancelled: appointments.filter((a) => a.status?.toUpperCase() === "CANCELLED").length,
    };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const status = apt.status?.toUpperCase();
      if (activeTab === "upcoming") return status === "CONFIRMED";
      if (activeTab === "pending") return status === "PENDING";
      if (activeTab === "completed") return status === "COMPLETED";
      if (activeTab === "cancelled") return status === "CANCELLED";
      return true;
    });
  }, [appointments, activeTab]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-12 w-60 rounded-2xl" />
          <Skeleton className="h-10 w-44 rounded-full" />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2].map((n) => (
            <Skeleton key={n} className="h-56 w-full rounded-[22px]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-6 max-w-md w-full text-center">
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">
            Unable to Load Appointments
          </p>
          <p className="text-xs text-rose-600 dark:text-rose-300 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: "upcoming", label: "Upcoming", count: counts.confirmed },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "completed", label: "Completed", count: counts.completed },
    { key: "cancelled", label: "Cancelled", count: counts.cancelled },
  ];

  return (
    <div className="space-y-7">
      {/* Classic Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#006D77] dark:text-[#83C5BE] mb-1">
            Care Schedule
          </p>
          <h1 className="font-serif text-3xl sm:text-[36px] leading-tight font-normal tracking-[-0.015em] text-[#0B1F33] dark:text-white">
            My Appointments
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Manage your upcoming video visits, clinician approvals, and completed consultations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/records"
            className="inline-flex items-center gap-2 h-10 px-4.5 rounded-full border border-slate-200/90 dark:border-white/[0.12] bg-white dark:bg-[#0B1F33] text-sm font-medium text-[#0B1F33] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors"
          >
            <FileText className="h-4 w-4 text-[#006D77] dark:text-[#83C5BE]" />
            <span>Prescriptions</span>
          </Link>

          <Link
            href="/find-doctor"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#006D77] hover:bg-[#005860] text-sm font-medium text-white shadow-[0_6px_18px_-4px_rgba(0,109,119,0.45)] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Book Appointment</span>
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Curved Segmented Pill Tabs */}
      <div className="inline-flex flex-wrap items-center gap-1 rounded-full bg-white dark:bg-[#0B1F33] p-1.5 border border-slate-200/80 dark:border-white/[0.08] shadow-2xs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[#006D77] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-[#0B1F33] dark:hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-white/[0.08] text-slate-500 dark:text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Appointments Grid */}
      {filteredAppointments.length === 0 ? (
        <div className="rounded-[24px] border border-slate-200/75 dark:border-white/[0.08] bg-white dark:bg-[#0B1F33] py-16 px-4 text-center shadow-[0_2px_16px_-4px_rgba(11,31,51,0.05)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4F7F8] dark:bg-white/[0.06] text-[#006D77] dark:text-[#83C5BE] mx-auto mb-3">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-xl text-[#0B1F33] dark:text-white">
            No {activeTab} appointments
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {activeTab === "upcoming"
              ? "You have no confirmed upcoming consultations. Book a slot with a verified doctor."
              : `No ${activeTab} consultations found in your account.`}
          </p>
          {(activeTab === "upcoming" || activeTab === "pending") && (
            <Link
              href="/find-doctor"
              className="mt-5 inline-flex items-center h-10 px-5 rounded-full bg-[#006D77] hover:bg-[#005860] text-sm font-medium text-white shadow-sm transition-all"
            >
              Book Appointment
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredAppointments.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              doctorFallback={doctorMap[apt.doctorId]}
              onCancel={(toCancel) => setAppointmentToCancel(toCancel)}
            />
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      <Modal
        isOpen={Boolean(appointmentToCancel)}
        onClose={() => {
          setAppointmentToCancel(null);
          setCancelError(null);
        }}
        title="Cancel Appointment"
        description={
          appointmentToCancel
            ? `Scheduled with ${formatDoctorName(
                appointmentToCancel.doctor?.name
              )} on ${formatDateIST(appointmentToCancel.date)} at ${appointmentToCancel.time} IST.`
            : undefined
        }
      >
        <div className="space-y-4 pt-2">
          {cancelError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 text-xs text-rose-700 dark:text-rose-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{cancelError}</span>
            </div>
          )}

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to cancel this appointment? Your doctor will be notified immediately.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              disabled={isCancelling}
              onClick={() => {
                setAppointmentToCancel(null);
                setCancelError(null);
              }}
              className="rounded-full"
            >
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              disabled={isCancelling}
              onClick={handleConfirmCancel}
              className="rounded-full"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Cancelling...
                </>
              ) : (
                "Cancel Appointment"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
