"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Stethoscope,
  User,
  ClipboardList,
  VideoIcon,
  ArrowRight,
  Sparkles,
  Clock,
  HeartPulse,
  Loader2,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { MotionButton } from "@/components/motion/MotionButton";
import { MOCK_DOCTORS } from "@/lib/mock-data";
import {
  getMotionVariants,
  staggerContainer,
  cardReveal,
  fadeInUp,
} from "@/components/motion/variants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
}

interface Appointment {
  id: string;
  doctorId: string;
  date: string; // e.g. "2026-09-06"
  time: string; // e.g. "10:30 AM"
  status: "CONFIRMED" | "PENDING" | "CANCELLED" | "COMPLETED";
}

interface ProcessedAppointment extends Appointment {
  doctorName: string;
  specialty: string;
}

interface DashboardStats {
  upcomingCount: number;
  completedCount: number;
  prescriptionsCount: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <motion.div
      variants={cardReveal}
      className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-900/5"
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </motion.div>
  );
}

function AppointmentCard({ appt }: { appt: ProcessedAppointment }) {
  const statusColors: Record<ProcessedAppointment["status"], string> = {
    CONFIRMED: "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
    PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    CANCELLED: "bg-red-50 text-red-600 ring-1 ring-red-200",
    COMPLETED: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  };

  return (
    <motion.div
      variants={cardReveal}
      className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm shadow-slate-900/5"
    >
      {/* Coloured top stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 to-cyan-400" />

      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Doctor info */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
              <Stethoscope className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{appt.doctorName}</p>
              <p className="text-sm text-slate-500">{appt.specialty}</p>
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`self-start rounded-full px-3 py-1 text-xs font-semibold ${statusColors[appt.status]}`}
          >
            {appt.status.charAt(0) + appt.status.slice(1).toLowerCase()}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
            {appt.date}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="h-4 w-4 shrink-0 text-slate-400" />
            {appt.time}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <VideoIcon className="h-4 w-4 shrink-0 text-slate-400" />
            Video
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <MotionButton className="flex-1 sm:flex-none">
            <Button className="w-full sm:w-auto" id="join-call-btn">
              <VideoIcon className="h-4 w-4 mr-2" />
              Join call
            </Button>
          </MotionButton>
          <MotionButton className="flex-1 sm:flex-none">
            <Button
              variant="outline"
              asChild
              className="w-full sm:w-auto"
              id="view-appointment-btn"
            >
              <Link href="/appointments">View details</Link>
            </Button>
          </MotionButton>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyAppointmentState() {
  return (
    <motion.div
      variants={cardReveal}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
        <CalendarDays className="h-6 w-6 text-teal-600" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">
        No upcoming appointments
      </h3>
      <p className="mt-1 max-w-xs text-sm text-slate-500">
        Connect with a licensed doctor in minutes — no insurance required.
      </p>
      <MotionButton className="mt-5">
        <Button asChild id="book-appointment-btn">
          <Link href="/find-doctor">
            Book an appointment
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </MotionButton>
    </motion.div>
  );
}

function QuickActionCard({
  href,
  icon,
  label,
  description,
  id,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  id: string;
}) {
  return (
    <motion.div variants={cardReveal}>
      <MotionButton className="w-full">
        <Link
          id={id}
          href={href}
          className="group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-900/5 transition-colors hover:border-teal-300 hover:bg-teal-50/30 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 transition-colors group-hover:bg-teal-600 group-hover:text-white">
            {icon}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-slate-900">{label}</p>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-teal-600" />
        </Link>
      </MotionButton>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const router = useRouter();
  const reduceMotion = Boolean(useReducedMotion());
  const variants = getMotionVariants(reduceMotion);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({ upcomingCount: 0, completedCount: 0, prescriptionsCount: 2 });
  const [nextAppointment, setNextAppointment] = useState<ProcessedAppointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("curalink_token") || sessionStorage.getItem("curalink_token");
        if (!token) {
          router.replace("/login");
          return;
        }

        // 1. Fetch User Profile
        const profileRes = await fetch(`${API_BASE}/auth/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        if (profileData.success) {
          setUser(profileData.data);
        }

        // 2. Fetch Appointments
        const apptsRes = await fetch(`${API_BASE}/appointments/my-appointments`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const apptsData = await apptsRes.json();
        
        if (apptsData.success) {
          const allAppts: Appointment[] = apptsData.data;
          
          // Calculate Stats
          let upcomingCount = 0;
          let completedCount = 0;
          
          allAppts.forEach(a => {
            if (a.status === "CONFIRMED" || a.status === "PENDING") {
              upcomingCount++;
            } else if (a.status === "COMPLETED") {
              completedCount++;
            }
          });
          
          setStats(s => ({ ...s, upcomingCount, completedCount }));

          // Find Next Appointment (first upcoming)
          const upcoming = allAppts.find(a => a.status === "CONFIRMED" || a.status === "PENDING");
          if (upcoming) {
            const doctor = MOCK_DOCTORS.find(d => d.id === upcoming.doctorId);
            setNextAppointment({
              ...upcoming,
              doctorName: doctor?.name || "Unknown Doctor",
              specialty: doctor?.specialty || "General"
            });
          }
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    );
  }

  const firstName = user?.name.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      {/* Greeting */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={variants.container}
          className="mb-10"
        >
          <motion.div variants={fadeInUp} className="flex flex-col gap-1">
            <div className="inline-flex items-center gap-1.5 self-start rounded-full border border-teal-200/80 bg-white/70 px-3 py-1 text-xs font-medium text-teal-800 shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Patient Portal
            </div>
            <h1 className="mt-3 text-3xl font-normal tracking-tight text-slate-900 sm:text-4xl">
              {greeting},{" "}
              <span className="font-display italic text-teal-800">
                {firstName}
              </span>
              .
            </h1>
            <p className="text-base text-slate-500">
              Here&apos;s a summary of your health activity.
            </p>
          </motion.div>
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Stats cards */}
        {/* ---------------------------------------------------------------- */}
        <motion.section
          aria-label="Health summary"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <StatCard
            icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
            label="Upcoming appointments"
            value={stats.upcomingCount}
            accent="bg-teal-100 text-teal-700"
          />
          <StatCard
            icon={<ClipboardList className="h-5 w-5" aria-hidden="true" />}
            label="Completed visits"
            value={stats.completedCount}
            accent="bg-cyan-100 text-cyan-700"
          />
          <StatCard
            icon={<HeartPulse className="h-5 w-5" aria-hidden="true" />}
            label="Active prescriptions"
            value={stats.prescriptionsCount}
            accent="bg-violet-100 text-violet-700"
          />
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        {/* Upcoming appointment */}
        {/* ---------------------------------------------------------------- */}
        <motion.section
          aria-label="Next appointment"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mb-10"
        >
          <motion.h2
            variants={fadeInUp}
            className="mb-4 text-lg font-semibold text-slate-800"
          >
            Next appointment
          </motion.h2>
          {nextAppointment ? (
            <AppointmentCard appt={nextAppointment} />
          ) : (
            <EmptyAppointmentState />
          )}
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        {/* Quick actions */}
        {/* ---------------------------------------------------------------- */}
        <motion.section
          aria-label="Quick actions"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeInUp}
            className="mb-4 text-lg font-semibold text-slate-800"
          >
            Quick actions
          </motion.h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <QuickActionCard
              id="quick-action-find-doctor"
              href="/find-doctor"
              icon={<Stethoscope className="h-5 w-5" aria-hidden="true" />}
              label="Find a Doctor"
              description="Browse specialists and book a visit"
            />
            <QuickActionCard
              id="quick-action-appointments"
              href="/appointments"
              icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
              label="My Appointments"
              description="View history and upcoming sessions"
            />
            <QuickActionCard
              id="quick-action-profile"
              href="/profile"
              icon={<User className="h-5 w-5" aria-hidden="true" />}
              label="My Profile"
              description="Manage account and health records"
            />
          </div>
        </motion.section>
    </>
  );
}
