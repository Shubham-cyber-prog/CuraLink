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
import { api } from "@/lib/api";

export interface NavLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PATIENT_NAV: NavLink[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Appointments", href: "/appointments", icon: Calendar },
  { label: "Health Records", href: "/records", icon: FileText },
];

const DOCTOR_NAV: NavLink[] = [
  { label: "Dashboard", href: "/doctor-dashboard", icon: Home },
  { label: "Appointments", href: "/doctor-dashboard#appointments", icon: Calendar },
  { label: "Patients", href: "/doctor-dashboard#patients", icon: User },
  { label: "Schedule", href: "/doctor-dashboard#schedule", icon: Clock },
  { label: "Messages", href: "/messages", icon: MessageSquare },
];

const ADMIN_NAV: NavLink[] = [
  { label: "Admin Dashboard", href: "/admin-dashboard", icon: ShieldCheck },
];

export function TopNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
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
          setUserAvatar(user.avatarUrl || null);
          if (user.role) setUserRole(String(user.role).toUpperCase());
          if (res.data.token && typeof window !== "undefined") {
            localStorage.setItem("curalink_token", res.data.token);
          }
        }
      } catch {
        // Silent
      }
    };
    fetchUser();

    const handleProfileUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && isMounted) {
        const u = customEvent.detail;
        if (u.name !== undefined) setUserName(u.name || "");
        if (u.email !== undefined) setUserEmail(u.email || "");
        if ("avatarUrl" in u) setUserAvatar(u.avatarUrl || null);
      }
    };

    window.addEventListener("curalink-profile-updated", handleProfileUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener("curalink-profile-updated", handleProfileUpdated);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k" && userRole === "PATIENT") {
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
  }, [userRole]);

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
    if (searchQuery.trim() && userRole === "PATIENT") {
      router.push(`/find-doctor?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const isAdmin = userRole === "ADMIN";
  const isDoctor = userRole === "DOCTOR";
  const isPatient = !isAdmin && !isDoctor;

  const homeHref = isAdmin ? "/admin-dashboard" : isDoctor ? "/doctor-dashboard" : "/dashboard";
  const navLinks = isAdmin ? ADMIN_NAV : isDoctor ? DOCTOR_NAV : PATIENT_NAV;

  const isActive = (href: string) => {
    const basePath = href.split("#")[0] || href;
    if (basePath === "/dashboard") return pathname === "/dashboard";
    if (basePath === "/admin-dashboard") return pathname.startsWith("/admin-dashboard");
    if (basePath === "/doctor-dashboard") {
      if (!href.includes("#")) return pathname === "/doctor-dashboard";
      return pathname === "/doctor-dashboard" || pathname.startsWith("/doctor-dashboard/");
    }
    return pathname.startsWith(basePath);
  };

  const userInitial = userName ? userName.trim().charAt(0).toUpperCase() : "U";

  return (
    <header className="sticky top-0 z-40 w-full h-[68px] bg-white/90 dark:bg-[#0B1F33]/90 backdrop-blur-xl border-b border-slate-200/75 dark:border-white/[0.08] shadow-[0_1px_16px_-6px_rgba(11,31,51,0.08)]">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* LEFT: Brand Logo + Role-Locked Curved Pill Navigation */}
        <div className="flex items-center gap-7 min-w-0">
          <div className="shrink-0">
            <Logo href={homeHref} size="sm" />
          </div>

          <nav
            className="hidden lg:flex items-center gap-1 rounded-full bg-slate-100/70 dark:bg-white/[0.05] p-1 border border-slate-200/60 dark:border-white/[0.06] shrink-0"
            aria-label="Main navigation"
          >
            {navLinks.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  target="_self"
                  id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`inline-flex items-center px-4 py-1.5 text-sm font-medium whitespace-nowrap shrink-0 rounded-full transition-all duration-150 ${
                    active
                      ? "bg-white dark:bg-[#006D77] text-[#006D77] dark:text-white shadow-[0_1px_6px_rgba(11,31,51,0.08)] font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-[#0B1F33] dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* RIGHT: Role-Specific Actions & Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Patient-only Search Bar */}
          {isPatient && (
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
                    className="h-10 w-56 xl:w-64 rounded-full border border-[#006D77] bg-white dark:bg-[#071320] px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006D77]/20"
                  />
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(true);
                    setTimeout(() => searchInputRef.current?.focus(), 40);
                  }}
                  className="hidden md:flex h-10 w-48 xl:w-64 px-4 rounded-full border border-slate-200/80 dark:border-white/[0.1] bg-slate-100/65 dark:bg-white/[0.05] text-sm text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.18] items-center justify-between gap-2 whitespace-nowrap overflow-hidden transition-all shrink-0 cursor-pointer"
                  aria-label="Search doctors and records"
                >
                  <span className="flex items-center gap-2 min-w-0 overflow-hidden">
                    <Search className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="xl:hidden truncate">Search...</span>
                    <span className="hidden xl:inline truncate">Search doctors, records...</span>
                  </span>
                  <kbd className="shrink-0 rounded-full border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#0B1F33] px-2 py-0.5 text-[10px] font-mono leading-none text-slate-400">
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
                  className="md:hidden flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Messages (Patient & Doctor) */}
          {!isAdmin && (
            <Link
              href="/messages"
              className={`flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full border transition-all ${
                pathname === "/messages"
                  ? "border-[#006D77]/30 bg-[#006D77]/10 text-[#006D77] dark:text-[#83C5BE]"
                  : "border-transparent text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.08]"
              }`}
              aria-label="Messages"
              title="Messages"
            >
              <MessageSquare className="h-4 w-4" />
            </Link>
          )}

          {/* Notifications */}
          <div className="relative shrink-0" ref={notifRef}>
            <button
              type="button"
              id="navbar-notification-btn"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-[#006D77] dark:bg-[#83C5BE]" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200/80 dark:border-white/[0.1] bg-white dark:bg-[#0B1F33] p-4 shadow-[0_16px_40px_-10px_rgba(11,31,51,0.16)] z-50">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                  <h3 className="font-serif text-lg text-[#0B1F33] dark:text-white">
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
                  <div className="flex items-start gap-3 rounded-xl bg-[#F4F7F8] dark:bg-white/[0.04] p-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-[#0B1F33] dark:text-white">Account Active</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Signed in as {isAdmin ? "System Administrator" : isDoctor ? "Verified Clinician" : "Patient"}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Patient-only Book Appointment CTA */}
          {isPatient && (
            <Link
              href="/find-doctor"
              className="hidden sm:inline-flex items-center gap-1.5 h-10 px-4.5 rounded-full bg-[#006D77] hover:bg-[#005860] text-white text-sm font-medium whitespace-nowrap shrink-0 shadow-[0_4px_14px_-3px_rgba(0,109,119,0.45)] hover:shadow-[0_6px_18px_-3px_rgba(0,109,119,0.55)] transition-all"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>Book Appointment</span>
            </Link>
          )}

          {/* Profile Menu with Real Uploaded Avatar */}
          <div className="relative shrink-0" ref={profileRef}>
            <button
              type="button"
              id="navbar-profile-menu-btn"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-1.5 rounded-full p-1 pr-2 border border-slate-200/80 dark:border-white/[0.1] bg-white dark:bg-white/[0.05] text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-white/[0.2] transition-all shrink-0 cursor-pointer"
              aria-label="Account menu"
            >
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0B1F33] dark:bg-[#006D77] text-white font-semibold text-xs">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName || "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{userInitial}</span>
                )}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block shrink-0" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-slate-200/80 dark:border-white/[0.1] bg-white dark:bg-[#0B1F33] p-2 shadow-[0_16px_40px_-10px_rgba(11,31,51,0.16)] z-50">
                <div className="px-3 py-2.5 border-b border-slate-100 dark:border-white/[0.08]">
                  <p className="text-sm font-semibold text-[#0B1F33] dark:text-white truncate">
                    {userName || "CuraLink Account"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {userEmail || "account@curalink.health"}
                  </p>
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#006D77]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#006D77] dark:text-[#83C5BE]">
                    <ShieldCheck className="h-3 w-3" />
                    {isAdmin ? "Admin Portal" : isDoctor ? "Doctor Portal" : "Patient Portal"}
                  </span>
                </div>

                <div className="py-1.5 space-y-0.5">
                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.06] rounded-xl"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    <span>My Profile &amp; Photo</span>
                  </Link>

                  {isPatient && (
                    <>
                      <Link
                        href="/vitals"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.06] rounded-xl"
                      >
                        <Activity className="h-4 w-4 text-slate-400" />
                        <span>Health Vitals</span>
                      </Link>
                      <Link
                        href="/records"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.06] rounded-xl"
                      >
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span>Health Records &amp; e-Rx</span>
                      </Link>
                    </>
                  )}

                  {isDoctor && (
                    <Link
                      href="/settings?tab=practice"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.06] rounded-xl"
                    >
                      <Stethoscope className="h-4 w-4 text-slate-400" />
                      <span>Practice Settings</span>
                    </Link>
                  )}

                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.06] rounded-xl"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Settings</span>
                  </Link>
                  <Link
                    href="/help"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.06] rounded-xl"
                  >
                    <HelpCircle className="h-4 w-4 text-slate-400" />
                    <span>Help &amp; Support</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 dark:border-white/[0.08] pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl cursor-pointer"
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
            className="lg:hidden flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.08] cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-white/[0.08] bg-white/95 dark:bg-[#0B1F33]/95 backdrop-blur-xl px-4 py-4 space-y-3 shadow-lg">
          {isPatient && (
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search doctors, records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 rounded-full border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-white/[0.05] pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#006D77]"
              />
            </form>
          )}

          <div className="flex flex-col space-y-1">
            {navLinks.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-medium ${
                    active
                      ? "bg-[#006D77]/10 text-[#006D77] dark:text-[#83C5BE] font-semibold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.06]"
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
