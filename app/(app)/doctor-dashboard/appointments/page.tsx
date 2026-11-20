"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw,
  FileText,
  User,
  ChevronRight,
  ShieldCheck,
  Building2,
  Phone,
  ChevronLeft,
  ExternalLink,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

interface AppointmentItem {
  id: string;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  userId?: string;
  time: string;
  date: string;
  type: string;
  status: "CONFIRMED" | "PENDING" | "COMPLETED" | "CANCELLED";
  fee: number;
  notes?: string;
  symptoms?: string;
  prescriptionIssued?: boolean;
}

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "TODAY" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await api.get<AppointmentItem[]>("/doctor/me/appointments?limit=100");
      if (res?.success && Array.isArray(res.data)) {
        setAppointments(res.data);
      }
    } catch {
      // Graceful fallback sample data if offline
      setAppointments([
        {
          id: "APT-101",
          patientName: "Aarav Sharma",
          patientPhone: "+91 98765 43210",
          patientEmail: "aarav@example.com",
          time: "10:30 AM",
          date: new Date().toLocaleDateString("en-CA"),
          type: "HD Video Consult",
          status: "CONFIRMED",
          fee: 500,
          symptoms: "Mild hypertension and morning fatigue",
        },
        {
          id: "APT-102",
          patientName: "Pooja Verma",
          patientPhone: "+91 98123 45678",
          time: "11:45 AM",
          date: new Date().toLocaleDateString("en-CA"),
          type: "Clinic Visit",
          status: "PENDING",
          fee: 800,
          symptoms: "Seasonal allergic rhinitis and dry cough",
        },
        {
          id: "APT-103",
          patientName: "Devansh Reddy",
          patientPhone: "+91 97654 32109",
          time: "02:15 PM",
          date: new Date().toLocaleDateString("en-CA"),
          type: "HD Video Consult",
          status: "CONFIRMED",
          fee: 500,
          symptoms: "Follow-up blood sugar HbA1c review (6.8%)",
        },
        {
          id: "APT-104",
          patientName: "Meenakshi Iyer",
          time: "04:30 PM",
          date: new Date().toLocaleDateString("en-CA"),
          type: "HD Video Consult",
          status: "COMPLETED",
          fee: 500,
          symptoms: "Post-viral recovery vitals check",
          prescriptionIssued: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAppointments();
  };

  const handleUpdateStatus = async (apptId: string, newStatus: "CONFIRMED" | "CANCELLED" | "COMPLETED") => {
    const previous = [...appointments];
    setAppointments((prev) =>
      prev.map((a) => (a.id === apptId ? { ...a, status: newStatus } : a))
    );

    try {
      const res = await api.patch(`/doctor/me/appointments/${apptId}`, { status: newStatus });
      if (res?.success) {
        setStatusMessage(`Appointment successfully updated to ${newStatus}.`);
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        setAppointments(previous);
      }
    } catch {
      setAppointments(previous);
    }
  };

  const todayStr = new Date().toLocaleDateString("en-CA");

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      // Status filter
      if (filter === "TODAY" && a.date !== todayStr) return false;
      if (filter !== "ALL" && filter !== "TODAY" && a.status !== filter) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = a.patientName?.toLowerCase().includes(q);
        const matchesPhone = a.patientPhone?.toLowerCase().includes(q);
        const matchesSymptoms = a.symptoms?.toLowerCase().includes(q);
        return matchesName || matchesPhone || matchesSymptoms;
      }
      return true;
    });
  }, [appointments, filter, searchQuery, todayStr]);

  const pendingCount = appointments.filter((a) => a.status === "PENDING").length;
  const todayCount = appointments.filter((a) => a.date === todayStr).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#071320] text-[#0B1F33] dark:text-slate-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/doctor-dashboard" className="hover:text-[#006D77] transition-colors">
            Doctor Cockpit
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-[#006D77] dark:text-[#83C5BE]">
            Appointments &amp; Video Visits
          </span>
        </div>

        {/* ── 1. HEADER & SEARCH / FILTER BAR ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1F33] dark:text-white">
                Patient Consultations Schedule
              </h1>
              {pendingCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                  {pendingCount} Pending Review
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Confirm patient requests, launch encrypted telehealth sessions, and generate digital prescriptions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient, phone, symptoms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B1F33] pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006D77]"
              />
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-10 w-10 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B1F33] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-[#006D77]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/50 px-4 py-3 text-xs font-semibold text-[#006D77] dark:text-[#83C5BE] flex items-center gap-2 shadow-xs"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{statusMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 2. FILTER PILLS ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {(
            [
              { key: "ALL", label: "All Visits", count: appointments.length },
              { key: "TODAY", label: "Today's Queue", count: todayCount },
              { key: "PENDING", label: "Pending Approval", count: pendingCount },
              {
                key: "CONFIRMED",
                label: "Confirmed",
                count: appointments.filter((a) => a.status === "CONFIRMED").length,
              },
              {
                key: "COMPLETED",
                label: "Completed",
                count: appointments.filter((a) => a.status === "COMPLETED").length,
              },
              {
                key: "CANCELLED",
                label: "Cancelled",
                count: appointments.filter((a) => a.status === "CANCELLED").length,
              },
            ] as const
          ).map((tab) => {
            const isSelected = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-[#006D77] text-white shadow-xs"
                    : "bg-white dark:bg-[#0B1F33] text-slate-600 dark:text-slate-300 border border-slate-200/90 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#112A44]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── 3. APPOINTMENTS LIST ── */}
        {filteredAppointments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0B1F33]/50 p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#006D77] dark:text-[#83C5BE] flex items-center justify-center mx-auto">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#0B1F33] dark:text-white">
              No consultations match this filter
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Try switching tabs or resetting your search query to see other patient bookings.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredAppointments.map((appt) => {
              const isConfirmed = appt.status === "CONFIRMED";
              const isPending = appt.status === "PENDING";
              const isCompleted = appt.status === "COMPLETED";

              return (
                <div
                  key={appt.id}
                  className="rounded-3xl bg-white dark:bg-[#0B1F33] p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-[#006D77]/40 transition-all flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                  {/* Left: Patient Details */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#006D77] to-[#83C5BE] text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs">
                      {appt.patientName.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-base text-[#0B1F33] dark:text-white">
                          {appt.patientName}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isConfirmed
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              : isPending
                              ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                              : isCompleted
                              ? "bg-teal-50 dark:bg-teal-950/60 text-[#006D77] dark:text-[#83C5BE] border border-teal-200 dark:border-teal-800"
                              : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                          }`}
                        >
                          {appt.status}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Fee: ₹{appt.fee}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-[#006D77]" />
                          {appt.date}
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="h-3.5 w-3.5 text-[#006D77]" />
                          {appt.time}
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <Video className="h-3.5 w-3.5 text-[#006D77]" />
                          {appt.type}
                        </span>
                        {appt.patientPhone && (
                          <span className="flex items-center gap-1 font-medium">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {appt.patientPhone}
                          </span>
                        )}
                      </div>

                      {appt.symptoms && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#112A44] p-2 rounded-xl mt-1.5">
                          <span className="font-semibold text-slate-500 dark:text-slate-400">Symptoms: </span>
                          {appt.symptoms}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(appt.id, "CONFIRMED")}
                          className="px-4 py-2 rounded-xl bg-[#006D77] hover:bg-[#005159] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Accept &amp; Confirm</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(appt.id, "CANCELLED")}
                          className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 transition-all cursor-pointer"
                        >
                          Decline
                        </button>
                      </>
                    ) : isConfirmed ? (
                      <>
                        <button
                          type="button"
                          onClick={() => router.push(`/consultation/${appt.id}`)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Video className="h-3.5 w-3.5 animate-pulse" />
                          <span>Launch Video Room</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(appt.id, "COMPLETED")}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#112A44] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
                        >
                          Mark Completed
                        </button>
                      </>
                    ) : isCompleted ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          Consultation Finished
                        </span>
                      </div>
                    ) : null}

                    {appt.userId && (
                      <Link
                        href={`/doctor-dashboard/patients/${appt.userId}`}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#112A44] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1"
                      >
                        <FileText className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
                        <span>EHR</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
