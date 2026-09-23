"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Video,
  XCircle,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { Doctor } from "@/types/doctor";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Appointment {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  status: string;
  createdAt: string;
  type?: string;
  doctor?: {
    id: string;
    name: string;
    specialty?: string;
    specialization?: string;
    photoUrl?: string;
  };
}

type TabType = "upcoming" | "completed" | "cancelled";

export default function AppointmentsPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorMap, setDoctorMap] = useState<Record<string, Doctor>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Cancellation Modal State
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchAppointmentsAndDoctors = async () => {
      try {
        // Fetch doctor directory for fallback lookup
        const docRes = await fetch(`${API_BASE}/doctors/verified`);
        if (docRes.ok) {
          const docData = await docRes.json();
          if (docData.success && Array.isArray(docData.data)) {
            const map: Record<string, Doctor> = {};
            for (const d of docData.data) {
              map[d.id] = d;
              if (d.userId) map[d.userId] = d;
              if (d.profileId) map[d.profileId] = d;
            }
            setDoctorMap(map);
          }
        }

        const res = await fetch(`${API_BASE}/appointments/my-appointments`, {
          credentials: "include",
        });

        if (res.status === 401) {
          router.replace("/login?redirect=/appointments");
          return;
        }
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch appointments");
        }

        setAppointments(data.data || []);
      } catch (err: any) {
        setError(err.message || "An error occurred");
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
      const res = await fetch(`${API_BASE}/appointments/${appointmentToCancel.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to cancel appointment");
      }

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointmentToCancel.id ? { ...a, status: "CANCELLED" } : a
        )
      );

      setStatusMessage("Appointment was successfully cancelled.");
      setTimeout(() => setStatusMessage(null), 4000);
      setAppointmentToCancel(null);
    } catch (err: any) {
      alert(err.message || "Could not cancel appointment. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const status = apt.status?.toUpperCase();
      if (activeTab === "upcoming") {
        return status === "CONFIRMED" || status === "PENDING";
      }
      if (activeTab === "completed") {
        return status === "COMPLETED";
      }
      if (activeTab === "cancelled") {
        return status === "CANCELLED";
      }
      return true;
    });
  }, [appointments, activeTab]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl py-8 px-4 sm:px-6 space-y-6">
        <Skeleton className="h-9 w-60 rounded-xl" />
        <Skeleton className="h-10 w-80 rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((n) => (
            <Skeleton key={n} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center px-4">
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 p-6 max-w-md w-full border border-rose-200 dark:border-rose-900/40">
          <p className="text-rose-600 dark:text-rose-400 font-semibold mb-2">Unable to Load Visits</p>
          <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
        </div>
      </div>
    );
  }

  const tabs: { key: TabType; label: string; count: number }[] = [
    {
      key: "upcoming",
      label: "Upcoming",
      count: appointments.filter((a) => a.status === "CONFIRMED" || a.status === "PENDING").length,
    },
    {
      key: "completed",
      label: "Completed",
      count: appointments.filter((a) => a.status === "COMPLETED").length,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      count: appointments.filter((a) => a.status === "CANCELLED").length,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl py-6 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Appointments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review your upcoming video visits, clinical records, and consultation history.
          </p>
        </div>

        <Button asChild className="bg-[#0D9488] hover:bg-[#0F766E] text-white self-start sm:self-auto">
          <Link href="/find-doctor">Book New Visit</Link>
        </Button>
      </div>

      {statusMessage && (
        <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 p-3.5 text-xs font-medium text-[#0D9488] dark:text-teal-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {statusMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "text-[#0D9488] dark:text-[#14B8A6]"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  isActive
                    ? "bg-teal-100 dark:bg-teal-950/60 text-[#0D9488] dark:text-teal-300"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}
              >
                {tab.count}
              </span>

              {/* Framer motion sliding underline */}
              {isActive && (
                <motion.div
                  layoutId="active-appointment-tab"
                  className="absolute bottom-0 inset-x-0 h-0.5 bg-[#0D9488] dark:bg-[#14B8A6]"
                  transition={{ duration: 0.2, ease: "easeOut" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Appointment Cards List */}
      <AnimatePresence mode="wait">
        {filteredAppointments.length === 0 ? (
          <motion.div
            key={`empty-${activeTab}`}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-16 text-center px-4"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] dark:text-[#14B8A6]">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              No {activeTab} appointments
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {activeTab === "upcoming"
                ? "You have no upcoming consultations scheduled. Book a visit with a verified specialist."
                : `No ${activeTab} visits recorded in your patient profile.`}
            </p>
            {activeTab === "upcoming" && (
              <Button asChild className="mt-4 bg-[#0D9488] hover:bg-[#0F766E] text-white">
                <Link href="/find-doctor">Find a Specialist</Link>
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`list-${activeTab}`}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {filteredAppointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                doctorFallback={doctorMap[apt.doctorId]}
                onCancel={(toCancel) => setAppointmentToCancel(toCancel as any)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={Boolean(appointmentToCancel)}
        onClose={() => setAppointmentToCancel(null)}
        title="Cancel Appointment?"
        description={
          appointmentToCancel
            ? `Scheduled with ${
                appointmentToCancel.doctor?.name || "the specialist"
              } on ${appointmentToCancel.date} at ${appointmentToCancel.time}.`
            : undefined
        }
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Are you sure you want to release this consultation slot? Your doctor will be notified immediately.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              disabled={isCancelling}
              onClick={() => setAppointmentToCancel(null)}
            >
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              disabled={isCancelling}
              onClick={handleConfirmCancel}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Appointment"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
