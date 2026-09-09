"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  Calendar,
  Bot,
  FileText,
  Video,
  ArrowRight,
  ShieldCheck,
  Star,
  Clock,
  UserCheck,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Doctor } from "@/types/doctor";
import { Skeleton } from "@/components/ui/Skeleton";

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

interface UpcomingAppointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: string;
  avatarInitial: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [latestAppointmentId, setLatestAppointmentId] = useState<string | null>(null);
  const [upcomingAppointment, setUpcomingAppointment] = useState<UpcomingAppointment | null>(null);
  const [topRecommendedDoctors, setTopRecommendedDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiBase}/auth/me`, { credentials: "include" });
        const data = await res.json();
        if (data.success && data.data) {
          setUser(data.data);
        }

        // Fetch real verified doctors
        const docRes = await fetch(`${apiBase}/doctors/verified`);
        if (docRes.ok) {
          const docData = await docRes.json();
          if (docData.success && Array.isArray(docData.data)) {
            setTopRecommendedDoctors(docData.data.slice(0, 3));
          }
        }

        // Fetch real user appointments
        const aptRes = await fetch(`${apiBase}/appointments/my-appointments`, { credentials: "include" });
        if (aptRes.ok) {
          const aptData = await aptRes.json();
          if (aptData.success && Array.isArray(aptData.data) && aptData.data.length > 0) {
            const confirmedApt = aptData.data.find((a: any) => a.status === "CONFIRMED") || aptData.data[0];
            setLatestAppointmentId(confirmedApt.id);
            setUpcomingAppointment({
              id: confirmedApt.id,
              doctorName: confirmedApt.doctor?.name || "Dr. Medical Specialist",
              specialty: confirmedApt.doctor?.specialty || confirmedApt.doctor?.specialization || "Telehealth Consultation",
              date: confirmedApt.date,
              time: confirmedApt.time,
              type: "Video Consultation",
              avatarInitial: confirmedApt.doctor?.name
                ? confirmedApt.doctor.name.replace("Dr. ", "").charAt(0)
                : "D",
            });
          }
        }
      } catch (err) {
        console.error("Dashboard profile/appointments fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const rawName = user?.name || "Subham";
  const firstName = rawName.split(" ")[0];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Shimmer Skeleton Loading State
  if (isLoading) {
    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Hero Banner Skeleton */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-6 sm:p-8 space-y-4">
          <Skeleton className="h-6 w-56 rounded-full" />
          <Skeleton className="h-8 w-72 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>

        {/* Appointment Skeleton */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-44 rounded-lg" />
            <Skeleton className="h-4 w-28 rounded-lg" />
          </div>
          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex gap-4 items-center">
              <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40 rounded-lg" />
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3.5 w-48 rounded-md" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-11 w-36 rounded-xl" />
              <Skeleton className="h-11 w-24 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-5 space-y-3">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-3.5 w-32 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const animationProps = (delayIndex: number) => {
    if (shouldReduceMotion) return {};
    return {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: {
        duration: 0.25,
        delay: delayIndex * 0.05,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    };
  };

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------------------------- */}
      {/* 1. Hero Greeting & Symptom Checker CTA */}
      {/* ------------------------------------------------------------------- */}
      <motion.section
        {...animationProps(0)}
        className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-6 sm:p-8 shadow-xs transition-colors duration-200"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/80 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-950/40 px-3 py-1 text-xs font-semibold text-[#0F9D8C] dark:text-[#14B8A6]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>HIPAA-aligned • Verified Healthcare Providers</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-base text-[#64748B] dark:text-[#94A3B8]">
              How are you feeling today? Check symptoms or book a doctor.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              id="hero-check-symptoms-btn"
              href="/symptom-checker"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#0F9D8C] dark:bg-[#14B8A6] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#0C8577] dark:hover:bg-teal-500 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-[#0F9D8C]/20 active:scale-[0.97]"
            >
              <Bot className="h-4 w-4" />
              <span>🤖 Check your symptoms</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ------------------------------------------------------------------- */}
      {/* 2. Upcoming Appointment Card */}
      {/* ------------------------------------------------------------------- */}
      <motion.section {...animationProps(1)} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
            Upcoming Appointment
          </h2>
          <Link
            href="/appointments"
            className="text-xs font-semibold text-[#0F9D8C] dark:text-[#14B8A6] hover:underline"
          >
            View all appointments
          </Link>
        </div>

        {upcomingAppointment ? (
          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-6 shadow-xs transition-all hover:shadow-sm dark:shadow-black/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 font-bold text-xl text-[#0F9D8C] dark:text-[#14B8A6]">
                  {upcomingAppointment.avatarInitial}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                      {upcomingAppointment.doctorName}
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" />
                      Confirmed
                    </span>
                  </div>
                  <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                    {upcomingAppointment.specialty}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-[#0F9D8C] dark:text-[#14B8A6]" />
                      {upcomingAppointment.date} • {upcomingAppointment.time}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Video className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                      {upcomingAppointment.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 sm:pt-0">
                <Link
                  id="join-consultation-btn"
                  href={latestAppointmentId ? `/consultation/${latestAppointmentId}` : "/appointments"}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#0F9D8C] dark:bg-[#14B8A6] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0C8577] dark:hover:bg-teal-500 transition-colors shadow-sm active:scale-[0.97]"
                >
                  <Video className="h-4 w-4" />
                  Join Consultation
                </Link>
                <Link
                  id="appointment-details-btn"
                  href="/appointments"
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#1C2338] px-4 py-2.5 text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#263049] transition-colors active:scale-[0.97]"
                >
                  Details
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-6 text-center shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#0F9D8C] dark:text-[#14B8A6]">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                  No upcoming appointments scheduled
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Connect with a verified specialist in minutes for a video or clinic consultation.
                </p>
              </div>
            </div>
            <Link
              href="/find-doctor"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#0F9D8C] dark:bg-[#14B8A6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0C8577] dark:hover:bg-teal-500 transition-colors shrink-0"
            >
              Book Consultation
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </motion.section>

      {/* ------------------------------------------------------------------- */}
      {/* 3. Quick Actions */}
      {/* ------------------------------------------------------------------- */}
      <motion.section {...animationProps(2)} className="space-y-3">
        <h2 className="text-lg font-semibold text-[#0F172A] dark:text-[#F1F5F9]">Quick Actions</h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Link
            id="quick-action-find-doctor"
            href="/find-doctor"
            className="group flex flex-col items-start rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-5 shadow-xs transition-all hover:border-[#0F9D8C]/40 dark:hover:border-[#14B8A6]/40 hover:bg-teal-50/30 dark:hover:bg-[#1C2338] active:scale-[0.97]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0F9D8C] dark:text-[#14B8A6] transition-colors group-hover:bg-[#0F9D8C] group-hover:text-white">
              <Stethoscope className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
              Find Doctor
            </h3>
            <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
              Browse 50+ verified specialists
            </p>
          </Link>

          <Link
            id="quick-action-book-appointment"
            href="/find-doctor"
            className="group flex flex-col items-start rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-5 shadow-xs transition-all hover:border-[#0F9D8C]/40 dark:hover:border-[#14B8A6]/40 hover:bg-teal-50/30 dark:hover:bg-[#1C2338] active:scale-[0.97]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 transition-colors group-hover:bg-blue-600 group-hover:text-white">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
              Book Appointment
            </h3>
            <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
              Instant video or clinic slot
            </p>
          </Link>

          <Link
            id="quick-action-ai-checker"
            href="/symptom-checker"
            className="group flex flex-col items-start rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-5 shadow-xs transition-all hover:border-[#0F9D8C]/40 dark:hover:border-[#14B8A6]/40 hover:bg-teal-50/30 dark:hover:bg-[#1C2338] active:scale-[0.97]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
              <Bot className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
              AI Checker
            </h3>
            <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
              Evaluate symptoms in 2 mins
            </p>
          </Link>

          <Link
            id="quick-action-my-reports"
            href="/records"
            className="group flex flex-col items-start rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-5 shadow-xs transition-all hover:border-[#0F9D8C]/40 dark:hover:border-[#14B8A6]/40 hover:bg-teal-50/30 dark:hover:bg-[#1C2338] active:scale-[0.97]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 transition-colors group-hover:bg-purple-600 group-hover:text-white">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
              My Reports
            </h3>
            <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
              Access lab tests & history
            </p>
          </Link>
        </div>
      </motion.section>

      {/* ------------------------------------------------------------------- */}
      {/* 4. Recommended Doctors */}
      {/* ------------------------------------------------------------------- */}
      <motion.section {...animationProps(3)} className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
              Recommended Doctors
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Top-rated medical practitioners available today
            </p>
          </div>
          <Link
            href="/find-doctor"
            className="text-xs font-semibold text-[#0F9D8C] dark:text-[#14B8A6] hover:underline"
          >
            See all doctors
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {topRecommendedDoctors.map((doc, idx) => (
            <motion.div
              key={doc.id}
              {...(shouldReduceMotion
                ? {}
                : {
                    initial: { opacity: 0, y: 8 },
                    animate: { opacity: 1, y: 0 },
                    transition: {
                      duration: 0.25,
                      delay: 0.15 + idx * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  })}
              className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-5 shadow-xs transition-all hover:shadow-md dark:shadow-black/30"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-lg font-bold text-[#0F9D8C] dark:text-[#14B8A6]">
                      {doc.name.replace("Dr. ", "").charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                        {doc.name}
                      </h3>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{doc.specialty}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{doc.rating}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                  <p className="flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    {doc.experience}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    Next Slot: {doc.nextAvailableDate} • {doc.nextAvailableTime}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-[#E2E8F0] dark:border-[#263049] pt-4">
                <Link
                  id={`book-doc-${doc.id}`}
                  href={`/doctors/${doc.id}`}
                  className="flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[#0F9D8C] dark:bg-[#14B8A6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0C8577] dark:hover:bg-teal-500 transition-colors active:scale-[0.97]"
                >
                  Book Appointment
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
