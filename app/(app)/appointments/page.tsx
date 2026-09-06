"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ChevronRight, User, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MOCK_DOCTORS } from "@/lib/mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Appointment {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  status: string;
  createdAt: string;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("curalink_token") || sessionStorage.getItem("curalink_token");
        if (!token) {
          router.replace("/login?redirect=/appointments");
          return;
        }

        const res = await fetch(`${API_BASE}/appointments/my-appointments`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch appointments");
        }

        setAppointments(data.data);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-teal-600 mb-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-slate-500 font-medium">Loading your appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center px-4">
        <div className="rounded-2xl bg-red-50 p-6 max-w-md w-full border border-red-100">
          <p className="text-red-600 font-semibold mb-2">Error</p>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl py-8 px-4 sm:px-6">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-3">My Appointments</h1>
        <p className="text-lg text-slate-500 max-w-2xl">
          Manage your upcoming medical consultations and view your appointment history.
        </p>
      </div>

      {appointments.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 py-24 text-center px-4"
        >
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-teal-100 text-teal-600 shadow-inner">
            <Calendar className="h-10 w-10" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-slate-900">No appointments yet</h2>
          <p className="mb-8 max-w-md text-slate-500">
            You don't have any upcoming or past appointments scheduled. When you book a consultation, it will appear here.
          </p>
          <Button asChild className="h-12 px-8 rounded-full bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 text-base font-semibold transition-transform hover:scale-105 active:scale-95">
            <Link href="/find-doctor">Find a Doctor</Link>
          </Button>
        </motion.div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {appointments.map((apt, index) => {
            const doctor = MOCK_DOCTORS.find(d => d.id === apt.doctorId);
            
            return (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/60 backdrop-blur-xl p-6 shadow-sm transition-all hover:shadow-lg hover:border-teal-200"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
                    apt.status === "CONFIRMED" 
                      ? "bg-teal-50 text-teal-700 border border-teal-100" 
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}>
                    {apt.status}
                  </span>
                  
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Calendar className="h-4 w-4 text-teal-600" />
                      {apt.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Clock className="h-4 w-4 text-teal-600" />
                      {apt.time}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-teal-50 ring-2 ring-teal-100/50 group-hover:ring-teal-200 transition-all">
                    {doctor?.photoUrl ? (
                      <Image src={doctor.photoUrl} alt={doctor.name} width={64} height={64} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-16 w-16 p-4 text-teal-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {doctor?.name || "Unknown Doctor"}
                    </p>
                    <p className="flex items-center gap-1.5 truncate text-sm font-medium text-slate-500 mt-1">
                      <Stethoscope className="h-3.5 w-3.5" />
                      {doctor?.specialty || "General"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-xl h-11 font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900">
                    Reschedule
                  </Button>
                  <Button variant="ghost" className="rounded-xl h-11 w-11 p-0 text-slate-400 hover:text-teal-700 hover:bg-teal-50">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
