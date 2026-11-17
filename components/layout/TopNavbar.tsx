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
  Sparkles,
  PhoneCall,
  Menu,
  X,
  Plus,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { api } from "@/lib/api";

export interface NavLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const PATIENT_NAV: NavLink[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Find Doctors", href: "/find-doctor", icon: Stethoscope },
  { label: "Appointments", href: "/appointments", icon: Calendar },
  { label: "Health Records", href: "/records", icon: FileText },
  { label: "Symptom Checker", href: "/symptom-checker", icon: Activity, badge: "AI" },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res?.success && res.data && isMounted) {
          const user = res.data.user || res.data;
          setUserName(user.name || "");
          setUserEmail(user.email || "");
          if (user.role) setUserRole(user.role);
          if (res.data.token && typeof window !== "undefined") {
            localStorage.setItem("curalink_token", res.data.token);
          }
        }
      } catch {
        // Handled silently
      }
    };
    fetchUser();
    return () => {
      isMounted = false;
    };
  }, []);

  // Keyboard shortcut (Cmd+K / Ctrl+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
        setMoreOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSwitchRole = async (targetRole: "DOCTOR" | "PATIENT") => {
    try {
      const res = await api.post("/auth/switch-role", { role: targetRole });
      if (res?.success && res.data?.token) {
        localStorage.setItem("curalink_token", res.data.token);
      }
      setProfileOpen(false);
      setMobileMenuOpen(false);
      if (targetRole === "DOCTOR") {
        window.location.href = "/doctor-dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Role switch failed:", err);
    }
  };

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
      await api.post("/auth/logout").catch(() => {});
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
      setMobileMenuOpen(false);
    }
  };

  const isDoctor = userRole === "DOCTOR" || pathname?.startsWith("/doctor-dashboard");
  const navLinks = isDoctor ? DOCTOR_NAV : PATIENT_NAV;

  const isActive = (href: string) => {
    const basePath = href.split("#")[0] || href;
    if (basePath === "/dashboard") return pathname === "/dashboard";
    if (basePath === "/doctor-dashboard") {
      if (!href.includes("#")) return pathname === "/doctor-dashboard";
      return pathname === "/doctor-dashboard" || pathname.startsWith("/doctor-dashboard/");
    }
    return pathname.startsWith(basePath);
  };

  const userInitial = userName ? userName.trim().charAt(0).toUpperCase() : "U";

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#071320]/85 border-b border-slate-200/70 dark:border-white/[0.06] backdrop-blur-2xl transition-all duration-200 shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ── LEFT: CuraLink Brand ── */}
        <div className="flex items-center gap-6">
          <Logo href={isDoctor ? "/doctor-dashboard" : "/dashboard"} size="sm" />
        </div>

        {/* ── CENTER: Role-Adaptive Primary Navigation ── */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                target="_self"
                id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`relative inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium rounded-xl transition-all duration-150 ${
                  active
                    ? "text-[#006D77] dark:text-[#83C5BE] font-semibold bg-teal-500/10 dark:bg-teal-400/10 shadow-2xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-[#006D77] dark:text-[#83C5BE]" : "text-slate-400 dark:text-slate-500"}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="rounded-full bg-gradient-to-r from-[#006D77] to-emerald-500 px-1.5 py-0.2 text-[9px] font-bold text-white shadow-2xs">
                    {item.badge}
                  </span>
                )}
                {active && (
                  <motion.div
                    layoutId="top-nav-active-pill"
                    className="absolute -bottom-1 inset-x-3 h-[2px] bg-[#006D77] dark:bg-[#83C5BE] rounded-full"
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  />
                )}
              </Link>
            );
          })}

          {/* Secondary Clinical Modules (More Dropdown) */}
          {!isDoctor && (
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen(!moreOpen)}
                className={`inline-flex items-center gap-1 px-3 py-2 text-[13px] font-medium rounded-xl transition-all duration-150 ${
                  moreOpen
                    ? "text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                }`}
              >
                <span>More</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${moreOpen ? "rotate-180 text-[#0D9488]" : "text-slate-400"}`} />
              </button>

              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2 w-52 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl z-50 backdrop-blur-md"
                  >
                    <Link
                      href="/vitals"
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-[#0D9488] rounded-xl transition-colors"
                    >
                      <Activity className="h-4 w-4 text-[#0D9488]" />
                      <div>
                        <p className="font-semibold">Vitals &amp; Trends</p>
                        <p className="text-[10px] text-slate-400">BP, Sugar &amp; Pulse tracking</p>
                      </div>
                    </Link>
                    <Link
                      href="/health-risk"
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-emerald-600 rounded-xl transition-colors"
                    >
                      <ShieldAlert className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="font-semibold">Health Risk Score</p>
                        <p className="text-[10px] text-slate-400">Cardiovascular &amp; Diabetes AI</p>
                      </div>
                    </Link>
                    <Link
                      href="/help"
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <HelpCircle className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="font-semibold">Patient Support</p>
                        <p className="text-[10px] text-slate-400">FAQs &amp; Telehealth Guide</p>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>

        {/* ── RIGHT: Search Trigger, Messages, Notifications, CTA, Profile ── */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Search Bar Trigger */}
          <div className="relative">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search doctors, specialties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  onBlur={() => !searchQuery && setSearchOpen(false)}
                  className="h-8.5 w-48 sm:w-64 rounded-xl border border-teal-500/50 bg-slate-50 dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 transition-all"
                />
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 50);
                }}
                className="hidden lg:flex items-center gap-2 h-8.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 px-3 text-xs text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Search directory"
              >
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <span>Search doctors, symptoms...</span>
                <kbd className="ml-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                  ⌘K
                </kbd>
              </button>
            )}

            {!searchOpen && (
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 50);
                }}
                className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Messages link */}
          <Link
            href="/messages"
            className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
              pathname === "/messages"
                ? "text-[#0D9488] bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/50"
                : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
            aria-label="Messages"
            title="Messages"
          >
            <MessageSquare className="h-4 w-4" />
          </Link>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              id="navbar-notification-btn"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#0D9488] ring-2 ring-white dark:ring-slate-900" />
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl z-50 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Medical Notifications
                      </h3>
                      <p className="text-[11px] text-slate-400">Real-time consultation &amp; vital alerts</p>
                    </div>
                    <span className="text-[10px] font-semibold text-[#0D9488] bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200/50">
                      Live
                    </span>
                  </div>

                  <div className="py-4 space-y-2.5">
                    <div className="p-2.5 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 flex items-start gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold text-slate-900 dark:text-white">Telehealth Account Ready</p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                          Your profile is encrypted and ready for secure consultations.
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold text-slate-900 dark:text-white">Continuous Health Monitoring</p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                          Log daily blood pressure &amp; glucose in the Vitals section.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-2 text-center">
                    <Link
                      href="/notifications"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs font-semibold text-[#0D9488] hover:text-[#0F766E] transition-colors"
                    >
                      View all notifications →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Quick Booking CTA for Patients (Desktop) */}
          {!isDoctor && (
            <Link
              href="/find-doctor"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#006D77] to-[#0A8896] hover:from-[#005a63] hover:to-[#08727e] px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-teal-700/20 transition-all shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Book Visit</span>
            </Link>
          )}

          {/* Profile / Account Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              id="navbar-profile-menu-btn"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-xl p-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Profile and account"
            >
              <div className="relative flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-bold text-xs shadow-2xs">
                {userInitial}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900" />
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-68 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 backdrop-blur-md"
                >
                  <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {userName || "CuraLink User"}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {userEmail || "patient@curalink.health"}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/50 px-2 py-0.5 text-[10px] font-semibold text-teal-800 dark:text-teal-300">
                        <ShieldCheck className="h-3 w-3 text-teal-600" />
                        {userRole === "ADMIN"
                          ? "System Administrator"
                          : userRole === "DOCTOR"
                          ? "Licensed Clinician"
                          : "Verified Patient"}
                      </span>
                    </div>
                  </div>

                  <div className="py-1 space-y-0.5">
                    {userRole === "ADMIN" && (
                      <Link
                        href="/admin-dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-colors"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <span>Admin Control Center</span>
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      <span>Account Profile</span>
                    </Link>
                    <Link
                      href="/records"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span>E-Prescriptions &amp; Records</span>
                    </Link>
                    <Link
                      href="/vitals"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <Activity className="h-4 w-4 text-slate-400" />
                      <span>Vitals &amp; Health Charts</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <Settings className="h-4 w-4 text-slate-400" />
                      <span>Preferences &amp; Security</span>
                    </Link>
                    <Link
                      href="/help"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <HelpCircle className="h-4 w-4 text-slate-400" />
                      <span>Help &amp; Support</span>
                    </Link>

                    {/* Role Quick Toggle */}
                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      {userRole === "DOCTOR" ? (
                        <button
                          type="button"
                          onClick={() => handleSwitchRole("PATIENT")}
                          className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <User className="h-4 w-4 text-teal-600" />
                            <span>Switch to Patient View</span>
                          </span>
                          <span className="text-[10px] text-teal-500">Active</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSwitchRole("DOCTOR")}
                          className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-teal-600" />
                            <span>Switch to Doctor Practice</span>
                          </span>
                          <span className="text-[10px] text-teal-500">Toggle</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── MOBILE SLIDE-DOWN DRAWER ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] px-4 py-4 space-y-3"
          >
            {/* Mobile Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search doctors, specialties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
              />
            </form>

            {/* Mobile Nav Links */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {navLinks.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      active
                        ? "bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] dark:text-[#14B8A6] border border-teal-200/50"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Secondary Modules */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <Link
                href="/vitals"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-600 dark:text-slate-400 font-medium hover:text-[#0D9488]"
              >
                Vitals Charts
              </Link>
              <Link
                href="/health-risk"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-600 dark:text-slate-400 font-medium hover:text-[#0D9488]"
              >
                Risk AI
              </Link>
              <Link
                href="/help"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-600 dark:text-slate-400 font-medium hover:text-[#0D9488]"
              >
                Help Desk
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
