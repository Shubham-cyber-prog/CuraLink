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
  Sparkles,
  UserCheck,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { MOCK_DOCTORS, Doctor } from "@/lib/mock-data";

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token =
          localStorage.getItem("curalink_token") ||
          sessionStorage.getItem("curalink_token");
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (data.success && data.data) {
          setUser(data.data);
        }
      } catch (err) {
        console.error("Dashboard profile fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const rawName = user?.name || "Subham";
  const firstName = rawName.split(" ")[0];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Upcoming appointment mock data (real doctor info)
  const upcomingAppointment = {
    doctorName: "Dr. Ananya Sharma",
    specialty: "General Physician",
    date: "Today",
    time: "4:30 PM",
    type: "Video Consultation",
    avatarInitial: "A",
  };

  const topRecommendedDoctors = MOCK_DOCTORS.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------------------------- */}
      {/* 1. Hero Greeting & Symptom Checker CTA */}
      {/* ------------------------------------------------------------------- */}
      <section className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            {/* Trust Signal surfaced at hero level */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/80 bg-teal-50 px-3 py-1 text-xs font-semibold text-[#0F9D8C]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>HIPAA-aligned • Verified Healthcare Providers</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-base text-[#64748B]">
              How are you feeling today? Check symptoms or book a doctor.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              id="hero-check-symptoms-btn"
              href="/symptom-checker"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#0F9D8C] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#0C8577] shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-[#0F9D8C]/20"
            >
              <Bot className="h-4 w-4" />
              <span>🤖 Check your symptoms</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 2. Upcoming Appointment Card */}
      {/* ------------------------------------------------------------------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0F172A]">
            Upcoming Appointment
          </h2>
          <Link
            href="/appointments"
            className="text-xs font-semibold text-[#0F9D8C] hover:underline"
          >
            View all appointments
          </Link>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 font-bold text-xl text-[#0F9D8C]">
                {upcomingAppointment.avatarInitial}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#0F172A]">
                    {upcomingAppointment.doctorName}
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Confirmed
                  </span>
                </div>
                <p className="text-sm text-[#64748B]">
                  {upcomingAppointment.specialty}
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-[#0F9D8C]" />
                    {upcomingAppointment.date} • {upcomingAppointment.time}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Video className="h-3.5 w-3.5 text-blue-500" />
                    {upcomingAppointment.type}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 sm:pt-0">
              <Link
                id="join-consultation-btn"
                href="/appointments"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#0F9D8C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0C8577] transition-colors"
              >
                <Video className="h-4 w-4" />
                Join Consultation
              </Link>
              <Link
                id="appointment-details-btn"
                href="/appointments"
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-medium text-[#0F172A] hover:bg-slate-50 transition-colors"
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 3. Quick Actions */}
      {/* ------------------------------------------------------------------- */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#0F172A]">Quick Actions</h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Link
            id="quick-action-find-doctor"
            href="/find-doctor"
            className="group flex flex-col items-start rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition-all hover:border-[#0F9D8C]/40 hover:bg-teal-50/30"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-[#0F9D8C] transition-colors group-hover:bg-[#0F9D8C] group-hover:text-white">
              <Stethoscope className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-[#0F172A]">
              Find Doctor
            </h3>
            <p className="mt-1 text-xs text-[#64748B]">
              Browse 50+ verified specialists
            </p>
          </Link>

          <Link
            id="quick-action-book-appointment"
            href="/find-doctor"
            className="group flex flex-col items-start rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition-all hover:border-[#0F9D8C]/40 hover:bg-teal-50/30"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-[#0F172A]">
              Book Appointment
            </h3>
            <p className="mt-1 text-xs text-[#64748B]">
              Instant video or clinic slot
            </p>
          </Link>

          <Link
            id="quick-action-ai-checker"
            href="/symptom-checker"
            className="group flex flex-col items-start rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition-all hover:border-[#0F9D8C]/40 hover:bg-teal-50/30"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
              <Bot className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-[#0F172A]">
              AI Checker
            </h3>
            <p className="mt-1 text-xs text-[#64748B]">
              Evaluate symptoms in 2 mins
            </p>
          </Link>

          <Link
            id="quick-action-my-reports"
            href="/records"
            className="group flex flex-col items-start rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition-all hover:border-[#0F9D8C]/40 hover:bg-teal-50/30"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-[#0F172A]">
              My Reports
            </h3>
            <p className="mt-1 text-xs text-[#64748B]">
              Access lab tests & history
            </p>
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 4. Recommended Doctors */}
      {/* ------------------------------------------------------------------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">
              Recommended Doctors
            </h2>
            <p className="text-xs text-[#64748B]">
              Top-rated medical practitioners available today
            </p>
          </div>
          <Link
            href="/find-doctor"
            className="text-xs font-semibold text-[#0F9D8C] hover:underline"
          >
            See all doctors
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {topRecommendedDoctors.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-lg font-bold text-[#0F9D8C]">
                      {doc.name.replace("Dr. ", "").charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A]">
                        {doc.name}
                      </h3>
                      <p className="text-xs text-[#64748B]">{doc.specialty}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{doc.rating}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-[#64748B]">
                  <p className="flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                    {doc.experience}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-teal-600" />
                    Next Slot: {doc.nextAvailableDate} • {doc.nextAvailableTime}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-[#E2E8F0] pt-4">
                <Link
                  id={`book-doc-${doc.id}`}
                  href={`/find-doctor?doctor=${doc.id}`}
                  className="flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[#0F9D8C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0C8577] transition-colors"
                >
                  Book Appointment
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
