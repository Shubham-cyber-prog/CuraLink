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
  Menu,
  X,
  Plus,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { api } from "@/lib/api";

export interface NavLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PATIENT_NAV: NavLink[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
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
        // Silent
      }
    };
    fetchUser();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 40);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitchRole = async (targetRole: "DOCTOR" | "PATIENT") => {
    try {
      const res = await api.post("/auth/switch-role", { role: targetRole });
      if (res?.success && res.data?.token) {
        localStorage.setItem("curalink_token", res.data.token);
      }
      setProfileOpen(false);
      setMobileMenuOpen(false);
      window.location.href = targetRole === "DOCTOR" ? "/doctor-dashboard" : "/dashboard";
    } catch (err) {
      console.error("Role switch failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout").catch(() => { });
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
    <header className="sticky top-0 z-40 w-full h-16 bg-white dark:bg-[#0B1F33] border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* LEFT: Brand Logo + Single-Line Enterprise Navigation */}
        <div className="flex items-center gap-6 min-w-0">
          <div className="shrink-0">
            <Logo href={isDoctor ? "/doctor-dashboard" : "/dashboard"} size="sm" />
          </div>

          <nav className="hidden lg:flex items-center gap-1 h-16 shrink-0" aria-label="Main navigation">
            {navLinks.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  target="_self"
                  id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`inline-flex h-16 items-center px-3 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                    active
                      ? "border-[#006D77] dark:border-[#83C5BE] text-[#006D77] dark:text-[#83C5BE]"
                      : "border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* RIGHT: Search Bar, Messages, Notifications, Theme, Book CTA, Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search Trigger / Input */}
          <div className="relative shrink-0">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search doctors, records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  onBlur={() => !searchQuery && setSearchOpen(false)}
                  className="h-9 w-56 xl:w-64 rounded-lg border border-[#006D77] bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006D77]/20"
                />
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 40);
                }}
                className="hidden md:flex h-9 w-48 xl:w-64 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-sm text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 items-center justify-between gap-2 whitespace-nowrap overflow-hidden transition-colors shrink-0 cursor-pointer"
                aria-label="Search doctors and records"
              >
                <span className="flex items-center gap-2 min-w-0 overflow-hidden">
                  <Search className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="xl:hidden truncate">Search...</span>
                  <span className="hidden xl:inline truncate">Search doctors, records...</span>
                </span>
                <kbd className="shrink-0 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[11px] font-mono leading-none text-slate-400">
                  ⌘K
                </kbd>
              </button>
            )}

            {!searchOpen && (
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 40);
                }}
                className="md:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Messages */}
          <Link
            href="/messages"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
              pathname === "/messages"
                ? "bg-slate-100 dark:bg-slate-800 text-[#006D77] dark:text-[#83C5BE]"
                : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
            aria-label="Messages"
            title="Messages"
          >
            <MessageSquare className="h-4 w-4" />
          </Link>

          {/* Notifications */}
          <div className="relative shrink-0" ref={notifRef}>
            <button
              type="button"
              id="navbar-notification-btn"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#006D77] dark:bg-[#83C5BE]" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1F33] p-4 shadow-lg z-50">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Notifications
                  </h3>
                  <Link
                    href="/notifications"
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs font-medium text-[#006D77] dark:text-[#83C5BE] hover:underline"
                  >
                    View all
                  </Link>
                </div>

                <div className="py-3 space-y-2.5">
                  <div className="flex items-start gap-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5 border border-slate-100 dark:border-slate-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-medium text-slate-900 dark:text-white">Appointment Confirmed</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        Your video consultation with Dr. Priya Sharma is ready for today at 10:30 AM IST.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5 border border-slate-100 dark:border-slate-800">
                    <FileText className="h-4 w-4 text-[#006D77] dark:text-[#83C5BE] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-medium text-slate-900 dark:text-white">Prescription Uploaded</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        Your latest digital e-Rx is available in Health Records.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <div className="shrink-0">
            <ThemeToggle />
          </div>

          {/* Primary Book Appointment CTA */}
          {!isDoctor && (
            <Link
              href="/find-doctor"
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#006D77] hover:bg-[#005a63] text-white text-sm font-medium whitespace-nowrap shrink-0 transition-colors"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>Book Appointment</span>
            </Link>
          )}

          {/* Compact User Profile Dropdown */}
          <div className="relative shrink-0" ref={profileRef}>
            <button
              type="button"
              id="navbar-profile-menu-btn"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-1.5 rounded-lg p-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              aria-label="Account menu"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#006D77] text-white font-semibold text-xs">
                {userInitial}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block shrink-0" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1F33] p-1.5 shadow-lg z-50">
                <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {userName || "CuraLink Account"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {userEmail || "patient@curalink.health"}
                  </p>
                </div>

                <div className="py-1 space-y-0.5">
                  {userRole === "ADMIN" && (
                    <Link
                      href="/admin-dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    <span>Profile &amp; Details</span>
                  </Link>
                  <Link
                    href="/vitals"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                  >
                    <Activity className="h-4 w-4 text-slate-400" />
                    <span>Health Vitals</span>
                  </Link>
                  <Link
                    href="/records"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                  >
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span>Health Records &amp; e-Rx</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Settings</span>
                  </Link>
                  <Link
                    href="/help"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                  >
                    <HelpCircle className="h-4 w-4 text-slate-400" />
                    <span>Help &amp; Support</span>
                  </Link>

                  <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                    {userRole === "DOCTOR" ? (
                      <button
                        type="button"
                        onClick={() => handleSwitchRole("PATIENT")}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#006D77] dark:text-[#83C5BE] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                      >
                        <User className="h-4 w-4" />
                        <span>Switch to Patient Portal</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSwitchRole("DOCTOR")}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#006D77] dark:text-[#83C5BE] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                      >
                        <Stethoscope className="h-4 w-4" />
                        <span>Switch to Doctor Portal</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1F33] px-4 py-4 space-y-3 shadow-md">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search doctors, records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-9 pr-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#006D77]"
            />
          </form>

          <div className="flex flex-col space-y-1">
            {navLinks.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                    active
                      ? "bg-slate-100 dark:bg-slate-800 text-[#006D77] dark:text-[#83C5BE]"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
