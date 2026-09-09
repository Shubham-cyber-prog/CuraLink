"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, User, Stethoscope, Video } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Doctor } from "@/types/doctor";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Appointment {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  status: string;
  createdAt: string;
  doctor?: {
    id: string;
    name: string;
    specialty?: string;
    specialization?: string;
    photoUrl?: string;
  };
}

export default function AppointmentsPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorMap, setDoctorMap] = useState<Record<string, Doctor>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl py-8 px-4 sm:px-6 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-9 w-60 rounded-xl" />
          <Skeleton className="h-5 w-96 rounded-lg" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="rounded-3xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-6 space-y-5"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-7 w-36 rounded-lg" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-40 rounded-md" />
                  <Skeleton className="h-4 w-28 rounded-md" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Skeleton className="h-11 flex-1 rounded-xl" />
                <Skeleton className="h-11 w-28 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center px-4">
        <div className="rounded-2xl bg-red-50 dark:bg-red-950/40 p-6 max-w-md w-full border border-red-100 dark:border-red-900/40">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">Error</p>
          <p className="text-sm text-red-500 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl py-8 px-4 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#F1F5F9] mb-3">
          My Appointments
        </h1>
        <p className="text-base sm:text-lg text-[#64748B] dark:text-[#94A3B8] max-w-2xl">
          Manage your upcoming medical consultations and view your appointment history.
        </p>
      </div>

      {appointments.length === 0 ? (
        <motion.div 
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-[#263049] bg-slate-50/50 dark:bg-[#151B2E]/60 py-24 text-center px-4"
        >
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 shadow-inner">
            <Calendar className="h-10 w-10" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">No appointments yet</h2>
          <p className="mb-8 max-w-md text-[#64748B] dark:text-[#94A3B8] text-sm">
            You don&apos;t have any upcoming appointments scheduled. When you book a consultation, it will appear here.
          </p>
          <Button asChild className="h-12 px-8 rounded-full bg-[#0F9D8C] dark:bg-[#14B8A6] hover:bg-[#0C8577] dark:hover:bg-teal-500 text-base font-semibold shadow-md active:scale-[0.97]">
            <Link href="/find-doctor">Find a Doctor</Link>
          </Button>
        </motion.div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {appointments.map((apt, index) => {
            const doc = apt.doctor || doctorMap[apt.doctorId];
            const doctorName = doc?.name || "Dr. Medical Specialist";
            const doctorSpecialty = doc?.specialty || (doc as any)?.specialization || "Telehealth Consultation";
            const photoUrl = (doc as any)?.photoUrl;
            
            return (
              <motion.div
                key={apt.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.25, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="group relative overflow-hidden rounded-3xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-6 shadow-xs dark:shadow-black/20 transition-all hover:shadow-md dark:hover:border-slate-700"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
                    apt.status === "CONFIRMED" 
                      ? "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800/60" 
                      : "bg-slate-100 dark:bg-[#1C2338] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#263049]"
                  }`}>
                    {apt.status}
                  </span>
                  
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#1C2338] px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#263049]">
                      <Calendar className="h-3.5 w-3.5 text-[#0F9D8C] dark:text-[#14B8A6]" />
                      {apt.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#1C2338] px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#263049]">
                      <Clock className="h-3.5 w-3.5 text-[#0F9D8C] dark:text-[#14B8A6]" />
                      {apt.time}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-teal-50 dark:bg-teal-950/60 ring-2 ring-teal-100/50 dark:ring-teal-900/50">
                    {photoUrl ? (
                      <Image src={photoUrl} alt={doctorName} width={64} height={64} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-16 w-16 p-4 text-[#0F9D8C] dark:text-[#14B8A6]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                      {doctorName}
                    </p>
                    <p className="flex items-center gap-1.5 truncate text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mt-1">
                      <Stethoscope className="h-3.5 w-3.5 text-[#0F9D8C] dark:text-[#14B8A6]" />
                      {doctorSpecialty}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {apt.status === "CONFIRMED" && (
                    <Button asChild className="flex-1 rounded-xl h-11 font-semibold bg-[#0F9D8C] dark:bg-[#14B8A6] hover:bg-[#0C8577] dark:hover:bg-teal-500 text-white shadow-sm active:scale-[0.97]">
                      <Link href={`/consultation/${apt.id}`}>
                        <Video className="h-4 w-4 mr-2" />
                        Join Consultation
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" className="rounded-xl h-11 px-4 font-semibold text-[#0F172A] dark:text-[#F1F5F9] border-[#E2E8F0] dark:border-[#263049] dark:bg-[#1C2338] hover:bg-slate-50 dark:hover:bg-[#263049] active:scale-[0.97]">
                    Reschedule
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
