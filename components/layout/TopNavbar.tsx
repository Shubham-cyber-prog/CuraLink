"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  LogOut,
  ChevronDown,
  Stethoscope,
  Calendar,
  FileText,
  Activity,
  MessageSquare,
  HelpCircle,
  Settings,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Home,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export interface NavLink {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const PATIENT_NAV: NavLink[] = [
  { label: "Find Doctors", href: "/find-doctor", icon: Stethoscope },
  { label: "Appointments", href: "/appointments", icon: Calendar },
  { label: "Health Records", href: "/records", icon: FileText },
  { label: "Symptom Checker", href: "/symptom-checker", icon: Activity },
];

const DOCTOR_NAV: NavLink[] = [
  { label: "Dashboard", href: "/doctor-dashboard", icon: Home },
  { label: "Appointments", href: "/doctor-dashboard#appointments", icon: Calendar },
  { label: "Patients", href: "/doctor-dashboard#patients", icon: User },
  { label: "Schedule", href: "/doctor-dashboard#schedule", icon: Clock },
  { label: "Messages", href: "/messages", icon: MessageSquare },
];

export function TopNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiBase}/auth/me`, { credentials: "include" });
        const data = await res.json();
        if (data.success && data.data) {
          const user = data.data.user || data.data;
          setUserName(user.name || "");
          setUserEmail(user.email || "");
          if (user.role) setUserRole(user.role);
        }
      } catch (err) {
        // Handled silently
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("curalink_token");
      sessionStorage.removeItem("curalink_token");

      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const csrfRes = await fetch(`${apiBase}/auth/csrf-token`, { credentials: "include" });
      const csrfData = await csrfRes.json().catch(() => ({ token: "" }));
      await fetch(`${apiBase}/auth/logout`, {
        method: "POST",
        headers: { "X-CSRF-Token": csrfData?.token || "" },
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("curalink_token");
      sessionStorage.removeItem("curalink_token");
      window.location.href = "/login";
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/find-doctor?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const isDoctor = userRole === "DOCTOR" || pathname?.startsWith("/doctor-dashboard");
  const navLinks = isDoctor ? DOCTOR_NAV : PATIENT_NAV;

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/doctor-dashboard") return pathname === "/doctor-dashboard";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-[#0F172A]/95 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ── LEFT: CuraLink Brand ── */}
        <div className="flex items-center gap-6">
          <Logo href={isDoctor ? "/doctor-dashboard" : "/dashboard"} size="sm" />
        </div>

        {/* ── CENTER: Role-Adaptive Main Navigation ── */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                target="_self"
                id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`relative px-3.5 py-2 text-[13px] font-medium rounded-lg transition-colors duration-150 ${
                  active
                    ? "text-[#0D9488] dark:text-[#14B8A6] font-semibold bg-teal-50/70 dark:bg-teal-950/40"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                {item.label}
                {active && (
                  <motion.div
                    layoutId="top-nav-active-pill"
                    className="absolute bottom-0 inset-x-3.5 h-[2px] bg-[#0D9488] dark:bg-[#14B8A6] rounded-full"
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  />
                )}
              </Link>
            );
          })}

          {/* Secondary Features Dropdown (More) */}
          {!isDoctor && (
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen(!moreOpen)}
                className={`flex items-center gap-1 px-3 py-2 text-[13px] font-medium rounded-lg transition-colors duration-150 ${
                  moreOpen
                    ? "text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <span>More</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${moreOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-1.5 w-48 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-lg z-50"
                  >
                    <Link
                      href="/vitals"
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Activity className="h-4 w-4 text-[#0D9488]" />
                      <span>Vitals & Trends</span>
                    </Link>
                    <Link
                      href="/health-risk"
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>Health Risk Score</span>
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Home className="h-4 w-4 text-slate-500" />
                      <span>Patient Dashboard</span>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>

        {/* ── RIGHT: Search, Messages, Notifications, Theme, Profile ── */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Search */}
          <div className="relative">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  placeholder="Search doctors, specialties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  onBlur={() => !searchQuery && setSearchOpen(false)}
                  className="h-8 w-44 sm:w-56 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                />
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                aria-label="Search doctors"
              >
                <Search className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Messages link */}
          <Link
            href="/messages"
            className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              pathname === "/messages"
                ? "text-[#0D9488] bg-teal-50 dark:bg-teal-950/40"
                : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
            aria-label="Messages"
          >
            <MessageSquare className="h-4 w-4" />
          </Link>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              id="navbar-notification-btn"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#0D9488]" />
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl z-50"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Notifications
                    </h3>
                    <span className="text-[11px] font-medium text-[#0D9488]">All caught up</span>
                  </div>
                  <div className="py-6 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No unread medical alerts or appointment reminders.
                    </p>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-2 text-center">
                    <Link
                      href="/notifications"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs font-medium text-[#0D9488] hover:underline"
                    >
                      View notification history
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Profile / Account Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              id="navbar-profile-menu-btn"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-xl p-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Profile and account"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-950/60 text-[#0D9488] dark:text-[#14B8A6] font-semibold text-xs border border-teal-200/60 dark:border-teal-800/60">
                {userName ? userName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50"
                >
                  <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {userName || "CuraLink User"}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {userEmail || "user@curalink.health"}
                    </p>
                    {userRole && (
                      <span className="mt-1 inline-block rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                        {userRole === "DOCTOR" ? "Licensed Physician" : "Verified Patient"}
                      </span>
                    )}
                  </div>

                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      <span>Account Profile</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Settings className="h-4 w-4 text-slate-400" />
                      <span>Preferences & Security</span>
                    </Link>
                    <Link
                      href="/help"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <HelpCircle className="h-4 w-4 text-slate-400" />
                      <span>Help & Support</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
