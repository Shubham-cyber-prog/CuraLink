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
          <Skeleton className="h-10 w-60 rounded-lg" />
          <Skeleton className="h-9 w-40 rounded-lg" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((n) => (
            <Skeleton key={n} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-6 max-w-md w-full text-center">
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
    <div className="space-y-6">
      {/* Compact Enterprise Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Appointments
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your upcoming video consultations, pending requests, and past visits.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/records"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1F33] text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <FileText className="h-4 w-4 text-slate-500" />
            <span>Prescriptions</span>
          </Link>

          <Link
            href="/find-doctor"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#006D77] hover:bg-[#005a63] text-sm font-medium text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Book Appointment</span>
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Clean Enterprise Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors cursor-pointer ${
                isActive
                  ? "border-[#006D77] dark:border-[#83C5BE] text-[#006D77] dark:text-[#83C5BE]"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                  isActive
                    ? "bg-slate-100 dark:bg-slate-800 text-[#006D77] dark:text-[#83C5BE]"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1F33] py-14 px-4 text-center">
          <Calendar className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
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
              className="mt-4 inline-flex items-center h-9 px-4 rounded-lg bg-[#006D77] hover:bg-[#005a63] text-sm font-medium text-white transition-colors"
            >
              Find a Doctor
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
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
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 text-xs text-rose-700 dark:text-rose-300">
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
              className="rounded-lg"
            >
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              disabled={isCancelling}
              onClick={handleConfirmCancel}
              className="rounded-lg"
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
