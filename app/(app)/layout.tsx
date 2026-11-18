"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { FloatingMobileNav } from "@/components/layout/FloatingMobileNav";
import { PageTransition } from "@/components/layout/PageTransition";
import { MotionProvider } from "@/components/motion/MotionProvider";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type AppRole = "PATIENT" | "DOCTOR" | "ADMIN";

const PATIENT_ONLY_PREFIXES = [
  "/dashboard",
  "/find-doctor",
  "/doctors",
  "/appointments",
  "/records",
  "/vitals",
  "/symptom-checker",
  "/health-risk",
];

const DOCTOR_ONLY_PREFIXES = ["/doctor-dashboard"];
const ADMIN_ONLY_PREFIXES = ["/admin-dashboard"];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function getHomeRouteForRole(role: AppRole): string {
  if (role === "ADMIN") return "/admin-dashboard";
  if (role === "DOCTOR") return "/doctor-dashboard";
  return "/dashboard";
}

function isRouteAllowedForRole(pathname: string, role: AppRole): boolean {
  if (!pathname) return true;

  if (role === "PATIENT") {
    if (matchesPrefix(pathname, DOCTOR_ONLY_PREFIXES)) return false;
    if (matchesPrefix(pathname, ADMIN_ONLY_PREFIXES)) return false;
    return true;
  }

  if (role === "DOCTOR") {
    if (matchesPrefix(pathname, ADMIN_ONLY_PREFIXES)) return false;
    if (matchesPrefix(pathname, PATIENT_ONLY_PREFIXES)) return false;
    return true;
  }

  if (role === "ADMIN") {
    if (matchesPrefix(pathname, DOCTOR_ONLY_PREFIXES)) return false;
    if (matchesPrefix(pathname, PATIENT_ONLY_PREFIXES)) return false;
    return true;
  }

  return false;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState(false);
  const [userRole, setUserRole] = useState<AppRole | null>(null);

  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("curalink_token") || sessionStorage.getItem("curalink_token")
            : null;
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/auth/me`, {
          headers,
          credentials: "include",
        });
        if (!res.ok) throw new Error("Not auth");
        const json = await res.json().catch(() => null);
        if (json?.data?.token && typeof window !== "undefined") {
          localStorage.setItem("curalink_token", json.data.token);
        }
        const user = json?.data?.user || json?.data;
        const rawRole = String(user?.role || "PATIENT").toUpperCase();
        const resolvedRole: AppRole =
          rawRole === "ADMIN" ? "ADMIN" : rawRole === "DOCTOR" ? "DOCTOR" : "PATIENT";

        if (mounted) {
          setUserRole(resolvedRole);
          setIsAuthed(true);
        }
      } catch {
        if (mounted) router.replace("/login");
      }
    };
    checkAuth();
    return () => {
      mounted = false;
    };
  }, [router]);

  const routeAllowed = userRole ? isRouteAllowedForRole(pathname || "", userRole) : false;

  useEffect(() => {
    if (isAuthed && userRole && !routeAllowed) {
      router.replace(getHomeRouteForRole(userRole));
    }
  }, [isAuthed, userRole, routeAllowed, router]);

  if (!isAuthed || !userRole || !routeAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F7F8] dark:bg-[#06101B]">
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-teal-500/20 blur-lg"
            />
            <motion.div
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full h-full"
            >
              <Image
                src="/logo.png"
                alt="CuraLink"
                width={56}
                height={56}
                className="w-full h-full object-contain drop-shadow"
                priority
              />
            </motion.div>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-base font-semibold text-[#0B1F33] dark:text-white">
              Cura<span className="text-[#006D77] dark:text-[#83C5BE]">Link</span>
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isAuthed && userRole && !routeAllowed
                ? "Redirecting to your portal..."
                : "Loading your health portal..."}
            </span>
          </div>
          <div className="w-32 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#006D77] to-transparent rounded-full"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <MotionProvider>
      <div className="min-h-screen bg-[#F4F7F8] dark:bg-[#06101B] text-[#0B1F33] dark:text-slate-100 transition-colors duration-150">
        {/* Premium Sticky Top Navigation */}
        <div className="print:hidden">
          <TopNavbar />
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 flex min-h-[calc(100vh-68px)] flex-col">
          <main className="flex-1 px-4 py-7 sm:px-6 lg:px-8 sm:py-8 pb-24 md:pb-12 print:p-0">
            <div className="mx-auto max-w-7xl print:max-w-none">
              <PageTransition>{children}</PageTransition>
            </div>
          </main>
        </div>

        {/* Role-Aware Mobile Bottom Navigation Bar (< 768px) */}
        <div className="print:hidden">
          <FloatingMobileNav role={userRole} />
        </div>
      </div>
    </MotionProvider>
  );
}
