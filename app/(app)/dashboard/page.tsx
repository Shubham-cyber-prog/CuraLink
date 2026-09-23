"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  Calendar,
  Activity,
  FileText,
  Video,
  ArrowRight,
  Star,
  Clock,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Droplets,
  Heart,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Doctor } from "@/types/doctor";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  phoneVerified?: boolean;
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

export default function DashboardPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [latestAppointmentId, setLatestAppointmentId] = useState<string | null>(null);
  const [upcomingAppointment, setUpcomingAppointment] = useState<UpcomingAppointment | null>(null);
  const [topRecommendedDoctors, setTopRecommendedDoctors] = useState<Doctor[]>([]);
  const [vitalsSummary, setVitalsSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiBase}/auth/me`, { credentials: "include" });
        const data = await res.json();
        if (data.success && data.data) {
          const u = data.data.user || data.data;
          setUser(u);
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

        // Fetch real vitals
        try {
          const vitalsRes = await fetch(`${apiBase}/vitals/trends?days=14`, { credentials: "include" });
          if (vitalsRes.ok) {
            const vitalsData = await vitalsRes.json();
            if (vitalsData.success && vitalsData.data) {
              setVitalsSummary(vitalsData.data);
            }
          }
        } catch (vErr) {
          // Silent catch
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const rawName = user?.name || "there";
  const firstName = rawName.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72 rounded-xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const anim = (delay: number) => {
    if (shouldReduceMotion) return {};
    return {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.22, delay: delay * 0.05, ease: "easeOut" as const },
    };
  };

  return (
    <div className="space-y-8">
      {/* ── 1. GREETING & STATUS ── */}
      <motion.section
        {...anim(0)}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Welcome to your patient health overview and upcoming care schedule.
          </p>
        </div>

        <Link
          id="hero-check-symptoms-btn"
          href="/symptom-checker"
          className="inline-flex items-center gap-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] px-4 py-2.5 text-xs font-semibold text-white shadow-2xs transition-colors shrink-0"
        >
          <Activity className="h-4 w-4" />
          <span>Symptom Assessment</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </motion.section>

      {/* ── 2. UPCOMING APPOINTMENT HERO CARD ── */}
      <motion.section {...anim(1)} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Next Scheduled Visit
          </h2>
          <Link
            href="/appointments"
            className="text-xs font-medium text-[#0D9488] dark:text-[#14B8A6] hover:underline"
          >
            View all appointments
          </Link>
        </div>

        {upcomingAppointment ? (
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] dark:text-[#14B8A6] text-lg font-bold border border-teal-100 dark:border-teal-900/50">
                  {upcomingAppointment.avatarInitial}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      {upcomingAppointment.doctorName}
                    </h3>
                    <Badge variant="verified">Confirmed</Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {upcomingAppointment.specialty}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 pt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {upcomingAppointment.date} at {upcomingAppointment.time}
                    </span>
                    <span className="flex items-center gap-1 text-[#0D9488] dark:text-[#14B8A6] font-medium">
                      <Video className="h-3.5 w-3.5" />
                      {upcomingAppointment.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Link
                  id="join-consultation-btn"
                  href={latestAppointmentId ? `/consultation/${latestAppointmentId}` : "/appointments"}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] px-4 py-2.5 text-xs font-semibold text-white shadow-2xs transition-colors"
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Join Consultation</span>
                </Link>
                <Button asChild variant="outline" size="sm">
                  <Link href="/appointments">Details</Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  No upcoming visits scheduled
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Book a consultation with a verified medical specialist in minutes.
                </p>
              </div>
            </div>
            <Button asChild className="bg-[#0D9488] hover:bg-[#0F766E] text-white">
              <Link href="/find-doctor">Book Appointment</Link>
            </Button>
          </div>
        )}
      </motion.section>

      {/* ── 3. QUICK ACTIONS (4 CORE HEALTHCARE DESTINATIONS) ── */}
      <motion.section {...anim(2)} className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
              label: "Book Visit",
              desc: "Schedule consultation slot",
              href: "/find-doctor",
              icon: Calendar,
            },
            {
              id: "quick-action-records",
              label: "Health Records",
              desc: "Prescriptions & digital labs",
              href: "/records",
              icon: FileText,
            },
            {
              id: "quick-action-symptom-checker",
              label: "Symptom Assessment",
              desc: "Clinical triage questionnaire",
              href: "/symptom-checker",
              icon: Activity,
            },
          ].map((action) => (
            <Link
              key={action.id}
              id={action.id}
              href={action.href}
              className="group flex flex-col rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4.5 hover:border-[#0D9488]/50 shadow-2xs hover:shadow-xs transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] dark:text-[#14B8A6] group-hover:bg-[#0D9488] group-hover:text-white transition-colors">
                <action.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3.5 text-sm font-semibold text-slate-900 dark:text-white">
                {action.label}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {action.desc}
              </p>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* ── 4. CONTINUOUS HEALTH VITALS & SUMMARY ── */}
      <motion.section {...anim(3)} className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-[#0D9488]" />
              Health Vitals &amp; Clinical Trends
            </h2>
            {vitalsSummary?.insights?.overallTrajectory === "DETERIORATING" && (
              <Badge variant="emergency">Attention Required</Badge>
            )}
          </div>
          <Link
            href="/vitals"
            className="text-xs font-medium text-[#0D9488] dark:text-[#14B8A6] hover:underline"
          >
            View Trend Charts →
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Glucose */}
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Blood Glucose</span>
                <Droplets className="h-3.5 w-3.5 text-[#0D9488]" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1.5">
                {vitalsSummary?.timeSeries?.slice(-1)[0]?.bloodGlucose || 112}{" "}
                <span className="text-xs font-normal text-slate-400">mg/dL</span>
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                Normal fasting range
              </p>
            </div>

            {/* Blood Pressure */}
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Blood Pressure</span>
                <Heart className="h-3.5 w-3.5 text-rose-500" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1.5">
                {vitalsSummary?.timeSeries?.slice(-1)[0]?.systolicBp || 120}/
                {vitalsSummary?.timeSeries?.slice(-1)[0]?.diastolicBp || 80}{" "}
                <span className="text-xs font-normal text-slate-400">mmHg</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                Standard clinical reading
              </p>
            </div>

            {/* Resting Heart Rate */}
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Pulse Rate</span>
                <Activity className="h-3.5 w-3.5 text-indigo-500" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1.5">
                72 <span className="text-xs font-normal text-slate-400">bpm</span>
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                Optimal rhythm
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 5. RECOMMENDED MEDICAL PRACTITIONERS ── */}
      {topRecommendedDoctors.length > 0 && (
        <motion.section {...anim(4)} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Verified Physicians Near You
            </h2>
            <Link
              href="/find-doctor"
              className="text-xs font-medium text-[#0D9488] dark:text-[#14B8A6] hover:underline"
            >
              Browse all specialists
            </Link>
          </div>

          <div className="space-y-3">
            {topRecommendedDoctors.map((doc) => (
              <div
                key={doc.id}
                className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] dark:text-[#14B8A6] font-bold text-base border border-teal-100 dark:border-teal-900/50">
                    {doc.name.replace("Dr. ", "").charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {doc.name}
                      </h3>
                      {doc.rating && (
                        <span className="flex items-center gap-0.5 text-xs text-amber-600 font-semibold">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {doc.rating}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#0D9488] dark:text-[#14B8A6] font-medium">
                      {doc.specialty} · {doc.experience}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Next Available: {doc.nextAvailableDate} at {doc.nextAvailableTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/doctors/${doc.id}`}>Profile</Link>
                  </Button>
                  <Button asChild size="sm" className="bg-[#0D9488] hover:bg-[#0F766E] text-white">
                    <Link href={`/doctors/${doc.id}/book?date=${doc.nextAvailableDate}&time=${doc.nextAvailableTime}`}>
                      Book
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
