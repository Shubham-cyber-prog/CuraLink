"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  Calendar,
  FileText,
  ChevronDown,
  Home,
  Stethoscope,
  Bot,
  MessageSquare,
  HelpCircle,
  Settings,
  ArrowRight,
  User,
  Activity,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export interface NavLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavLink[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Vitals & Trends", href: "/vitals", icon: Activity },
  { label: "Doctors", href: "/find-doctor", icon: Stethoscope },
  { label: "Appointments", href: "/appointments", icon: Calendar },
  { label: "Records", href: "/records", icon: FileText },
];

const DOCTOR_NAV_ITEMS: NavLink[] = [
  { label: "Dashboard", href: "/doctor-dashboard", icon: Home },
  { label: "Patients", href: "/doctor-dashboard#patients", icon: User },
  { label: "Appointments", href: "/doctor-dashboard#appointments", icon: Calendar },
];

const AI_HEALTH_ITEM: NavLink = {
  label: "AI Health",
  href: "/symptom-checker",
  icon: Bot,
};

export function TopNavbar({ customNavItems }: { customNavItems?: NavLink[] } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/me`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (data.success && data.data) {
          const user = data.data.user || data.data;
          setUserName(user.name || "");
          setUserEmail(user.email || "");
          if (user.role) setUserRole(user.role);
        }
      } catch (err) {
        console.error("Failed to fetch top navbar user profile:", err);
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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    try {
      const csrfRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/csrf-token`
      );
      const csrfData = await csrfRes.json();
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/logout`,
        {
          method: "POST",
          headers: { "X-CSRF-Token": csrfData.token },
          credentials: "include",
        }
      );
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      router.push("/login");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/find-doctor?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const isDoctorRoute = pathname?.startsWith("/doctor-dashboard") || userRole === "DOCTOR";
  const navItems = customNavItems || (isDoctorRoute ? DOCTOR_NAV_ITEMS : NAV_ITEMS);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/doctor-dashboard") return pathname === "/doctor-dashboard";
    return pathname.startsWith(href);
  };

  const allMobileItems = isDoctorRoute
    ? [...DOCTOR_NAV_ITEMS, { label: "Messages", href: "/messages", icon: MessageSquare }]
    : [...NAV_ITEMS, AI_HEALTH_ITEM, { label: "Messages", href: "/messages", icon: MessageSquare }];

  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ── LEFT: Hamburger + Logo + Nav ── */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
            aria-label="Open navigation menu"
            id="top-navbar-mobile-menu-btn"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Logo href={isDoctorRoute ? "/doctor-dashboard" : "/dashboard"} size="sm" />

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  target="_self"
                  id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`relative px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors duration-150 ${
                    active
                      ? "text-[#085041] dark:text-teal-400 bg-teal-50/80 dark:bg-teal-950/40 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {!isDoctorRoute && (
              <Link
                href={AI_HEALTH_ITEM.href}
                target="_self"
                id="nav-ai-health"
                className={`relative flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors duration-150 ${
                  isActive(AI_HEALTH_ITEM.href)
                    ? "text-white bg-[#0F9D8C] dark:bg-teal-600"
                    : "text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-900/40"
                }`}
              >
                <Bot className="h-3.5 w-3.5" />
                AI Health
              </Link>
            )}
          </nav>
        </div>

        {/* ── RIGHT: Search, Messages, Notifications, Theme, Profile ── */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Search icon */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Messages icon with badge */}
          <Link
            href="/messages"
            target="_self"
            className="relative flex h-8 w-8 items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Messages"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0F172A]" />
          </Link>

          {/* Notifications dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              id="navbar-notification-btn"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative flex h-8 w-8 items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#0F9D8C] ring-2 ring-white dark:ring-[#0F172A]" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] p-4 shadow-lg z-50">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Notifications
                  </h3>
                  <Link
                    href="/notifications"
                    target="_self"
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs font-medium text-[#0F9D8C] hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-teal-50 dark:bg-teal-950/40 text-[#0F9D8C]">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        Upcoming Appointment Today
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Dr. Ananya Sharma • 4:30 PM
                      </p>
                      <span className="text-[10px] text-slate-400">10 mins ago</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        New Lab Report Available
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Complete Blood Count (CBC) uploaded.
                      </p>
                      <span className="text-[10px] text-slate-400">1 hour ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Profile avatar dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              id="navbar-profile-avatar-btn"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-1.5 rounded-md p-1 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              aria-label="User Profile menu"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F9D8C] text-xs font-semibold text-white">
                {userName ? userName.charAt(0).toUpperCase() : "U"}
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] p-2 shadow-lg z-50">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{userName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userEmail}</p>
                </div>
                <div className="mt-1 space-y-0.5">
                  <Link
                    id="profile-dropdown-settings-link"
                    href="/settings"
                    target="_self"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    Settings
                  </Link>
                  <Link
                    href="/help"
                    target="_self"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <HelpCircle className="h-4 w-4 text-slate-400" />
                    Help & Support
                  </Link>
                  <button
                    id="profile-dropdown-logout-btn"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Search Bar ── */}
      {searchOpen && (
        <div className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0F172A] px-4 py-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctors, specialties..."
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#0F9D8C] focus:ring-1 focus:ring-[#0F9D8C]/20"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-[#0F9D8C] px-4 py-2 text-sm font-medium text-white hover:bg-[#0E8E7F] transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#0F172A] shadow-xl flex flex-col lg:hidden">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <Logo href="/dashboard" size="sm" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {allMobileItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    target="_self"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-teal-50 dark:bg-teal-950/30 text-[#0F9D8C] dark:text-teal-400"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <Link
                  href="/profile"
                  target="_self"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <Link
                  href="/help"
                  target="_self"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <HelpCircle className="h-4 w-4" />
                  Help & Support
                </Link>
              </div>
            </nav>

            {/* Drawer footer */}
            <div className="border-t border-slate-100 dark:border-slate-800 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F9D8C] text-sm font-semibold text-white">
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{userName}</p>
                  <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 dark:border-slate-700 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
