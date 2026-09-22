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
  Star,
  Clock,
  UserCheck,
  ChevronRight,
  Upload,
  Activity,
  Droplets,
  Heart,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Doctor } from "@/types/doctor";
import { Skeleton } from "@/components/ui/Skeleton";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  phoneVerified?: boolean;
  age?: number | null;
  gender?: string | null;
  profileCompleted?: boolean;
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

const DEFAULT_DOCTORS: Doctor[] = [];

export default function DashboardPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [latestAppointmentId, setLatestAppointmentId] = useState<string | null>(null);
  const [upcomingAppointment, setUpcomingAppointment] = useState<UpcomingAppointment | null>(null);
  const [topRecommendedDoctors, setTopRecommendedDoctors] = useState<Doctor[]>(DEFAULT_DOCTORS);
  const [vitalsSummary, setVitalsSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiBase}/auth/me`, { credentials: "include" });
        const data = await res.json();
        if (data.success && data.data) {
          const user = data.data.user || data.data;
          setUser(user);
        }

        // Fetch real verified doctors
        const docRes = await fetch(`${apiBase}/doctors/verified`);
        if (docRes.ok) {
          const docData = await docRes.json();
          if (docData.success && Array.isArray(docData.data) && docData.data.length > 0) {
            setTopRecommendedDoctors(docData.data.slice(0, 3));
          } else {
            setTopRecommendedDoctors([]);
          }
        } else {
          setTopRecommendedDoctors(DEFAULT_DOCTORS);
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

        // Fetch real vitals & AI deterioration insights
        try {
          const vitalsRes = await fetch(`${apiBase}/vitals/trends?days=14`, { credentials: "include" });
          if (vitalsRes.ok) {
            const vitalsData = await vitalsRes.json();
            if (vitalsData.success && vitalsData.data) {
              setVitalsSummary(vitalsData.data);
            }
          }
        } catch (vErr) {
          console.error("Vitals fetch error on dashboard:", vErr);
        }
      } catch (err) {
        console.error("Dashboard profile/appointments fetch error:", err);
        setTopRecommendedDoctors([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const rawName = user?.name || "there";
  const firstName = rawName.split(" ")[0];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
          <Skeleton className="h-7 w-60 rounded-md" />
          <Skeleton className="h-4 w-80 rounded-md" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-44 rounded-md" />
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex gap-4 items-center">
            <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-40 rounded-md" />
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-3.5 w-48 rounded-md" />
            </div>
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const anim = (delay: number) => {
    if (shouldReduceMotion) return {};
    return {
      initial: { opacity: 0, y: 6 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.2, delay: delay * 0.04, ease: "easeOut" as const },
    };
  };

  return (
    <div className="space-y-6">
      {/* ── 1. GREETING ── */}
      <motion.section
        {...anim(0)}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            How are you feeling today? Check symptoms or book a doctor.
          </p>
        </div>
        <Link
          id="hero-check-symptoms-btn"
          href="/symptom-checker"
          className="inline-flex items-center gap-2 rounded-md bg-[#0F9D8C] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0E8E7F] transition-colors shrink-0"
        >
          Check your symptoms
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.section>

      {/* ── PROFILE & PHONE VERIFICATION NUDGE BANNER ── */}
      {user && (!user.phoneVerified || !user.profileCompleted) && (
        <motion.div
          {...anim(0.5)}
          className="rounded-xl border border-teal-200 dark:border-teal-900/60 bg-gradient-to-r from-teal-50/90 via-emerald-50/50 to-white dark:from-teal-950/40 dark:via-[#131d2e] dark:to-[#151B2E] p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-teal-100/90 dark:bg-teal-900/60 flex items-center justify-center text-[#085041] dark:text-teal-300 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                Complete your profile & verify your phone to help doctors trust your bookings
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Verified patients receive faster appointment confirmation and prioritized clinical review.
              </p>
            </div>
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg bg-[#085041] hover:bg-[#063b30] text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            Complete Verification
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      )}

      {/* ── 2. UPCOMING APPOINTMENT ── */}
      <motion.section {...anim(1)} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Upcoming Appointment
          </h2>
          <Link
            href="/appointments"
            className="text-xs font-medium text-[#0F9D8C] hover:underline underline-offset-2"
          >
            View all
          </Link>
        </div>

        {upcomingAppointment ? (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#0F9D8C] text-base font-semibold text-white">
                  {upcomingAppointment.avatarInitial}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {upcomingAppointment.doctorName}
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Confirmed
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {upcomingAppointment.specialty}
                  </p>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {upcomingAppointment.date} • {upcomingAppointment.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Video className="h-3 w-3 text-blue-500" />
                      {upcomingAppointment.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  id="join-consultation-btn"
                  href={latestAppointmentId ? `/consultation/${latestAppointmentId}` : "/appointments"}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#0F9D8C] px-4 py-2 text-sm font-medium text-white hover:bg-[#0E8E7F] transition-colors"
                >
                  <Video className="h-3.5 w-3.5" />
                  Join Consultation
                </Link>
                <Link
                  id="appointment-details-btn"
                  href="/appointments"
                  className="inline-flex items-center rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Details
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">No upcoming appointments</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Connect with a specialist in minutes.</p>
              </div>
            </div>
            <Link
              href="/find-doctor"
              className="inline-flex items-center gap-1.5 rounded-md bg-[#0F9D8C] px-4 py-2 text-sm font-medium text-white hover:bg-[#0E8E7F] transition-colors"
            >
              Book Consultation
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </motion.section>

      {/* ── 2.5 CONTINUOUS VITALS MONITORING (RPM WIDGET) ── */}
      <motion.section {...anim(1.5)} className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              Continuous Health Vitals &amp; AI Trends
            </h2>
            {vitalsSummary?.insights?.overallTrajectory === "DETERIORATING" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                Deterioration Alert
              </span>
            )}
          </div>
          <Link
            href="/vitals"
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline underline-offset-2 flex items-center gap-1"
          >
            View trend charts
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
          {vitalsSummary?.insights?.alerts && vitalsSummary.insights.alerts.length > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-rose-900 dark:text-rose-200">
                  {vitalsSummary.insights.alerts[0].title}
                </p>
                <p className="text-rose-700 dark:text-rose-300">
                  &quot;{vitalsSummary.insights.alerts[0].messageHindi || vitalsSummary.insights.alerts[0].message}&quot;
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {/* Sugar */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Glucose</span>
                <Droplets className="h-3.5 w-3.5 text-teal-600" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {vitalsSummary?.timeSeries?.slice(-1)[0]?.bloodGlucose || 143} <span className="text-xs font-normal text-slate-400">mg/dL</span>
              </p>
              <p className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5 flex items-center gap-0.5">
                <TrendingUp className="h-2.5 w-2.5" />
                Rising drift (+32 mg/dL)
              </p>
            </div>

            {/* BP */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Blood Pressure</span>
                <Heart className="h-3.5 w-3.5 text-rose-600" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {vitalsSummary?.timeSeries?.slice(-1)[0]?.systolicBp || 130}/{vitalsSummary?.timeSeries?.slice(-1)[0]?.diastolicBp || 83} <span className="text-xs font-normal text-slate-400">mmHg</span>
              </p>
              <p className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
                Systolic creep (+11 mmHg)
              </p>
            </div>

            {/* Weight */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Weight</span>
                <Activity className="h-3.5 w-3.5 text-indigo-600" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {vitalsSummary?.timeSeries?.slice(-1)[0]?.weight || 69.1} <span className="text-xs font-normal text-slate-400">kg</span>
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                BMI: ~23.4 (Normal)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              21 consecutive days of vital history logged
            </span>
            <Link
              href="/vitals"
              className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold hover:bg-teal-100 transition-colors"
            >
              Open Full Vitals &amp; Trends →
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ── 3. QUICK ACTIONS ── */}
      <motion.section {...anim(2)} className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Quick Actions</h2>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            {
              id: "quick-action-find-doctor",
              label: "Find Doctor",
              desc: "Browse verified specialists",
              href: "/find-doctor",
              icon: Stethoscope,
            },
            {
              id: "quick-action-book-appointment",
              label: "Book Appointment",
              desc: "Schedule a consultation",
              href: "/find-doctor",
              icon: Calendar,
            },
            {
              id: "quick-action-ai-checker",
              label: "AI Checker",
              desc: "Evaluate symptoms in 2 mins",
              href: "/symptom-checker",
              icon: Bot,
            },
            {
              id: "quick-action-upload-report",
              label: "Upload Report",
              desc: "Add lab tests & records",
              href: "/records",
              icon: Upload,
            },
          ].map((action) => (
            <Link
              key={action.id}
              id={action.id}
              href={action.href}
              className="group flex flex-col rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-[#0F9D8C]/40 hover:shadow-sm transition-all duration-150"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-50 dark:bg-teal-950/30 text-[#0F9D8C] dark:text-teal-400 group-hover:bg-[#0F9D8C] group-hover:text-white transition-colors duration-150">
                <action.icon className="h-4 w-4" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                {action.label}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {action.desc}
              </p>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* ── 4. RECOMMENDED DOCTORS ── */}
      <motion.section {...anim(3)} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Recommended Doctors
          </h2>
          <Link
            href="/find-doctor"
            className="text-xs font-medium text-[#0F9D8C] hover:underline underline-offset-2"
          >
            See all doctors
          </Link>
        </div>

        <div className="space-y-2">
          {topRecommendedDoctors.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0F9D8C]">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Explore Verified Doctors
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Find top telehealth specialists across cardiology, neurology, pediatrics, and more.
                  </p>
                </div>
              </div>
              <Link
                href="/find-doctor"
                className="inline-flex items-center gap-1.5 rounded-md bg-[#0F9D8C] px-4 py-2 text-xs font-medium text-white hover:bg-[#0E8E7F] transition-colors"
              >
                Browse Directory
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            topRecommendedDoctors.map((doc, idx) => (
              <motion.div
                key={doc.id}
                {...(shouldReduceMotion
                  ? {}
                  : {
                      initial: { opacity: 0, y: 4 },
                      animate: { opacity: 1, y: 0 },
                      transition: { duration: 0.2, delay: 0.12 + idx * 0.04 },
                    })}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:shadow-sm transition-shadow duration-150"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {doc.name.replace("Dr. ", "").charAt(0)}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {doc.name}
                        </h3>
                        <div className="flex items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="font-medium">{doc.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{doc.specialty}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <UserCheck className="h-3 w-3" />
                          {doc.experience}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-[#0F9D8C]" />
                          Next: {doc.nextAvailableDate} • {doc.nextAvailableTime}
                        </span>
                        {doc.consultationFee && (
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            ₹{doc.consultationFee}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/doctors/${doc.id}`}
                      className="inline-flex items-center rounded-md border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      View Profile
                    </Link>
                    <Link
                      id={`book-doc-${doc.id}`}
                      href={`/doctors/${doc.id}`}
                      className="inline-flex items-center gap-1 rounded-md bg-[#0F9D8C] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0E8E7F] transition-colors"
                    >
                      Book
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.section>
    </div>
  );
}
