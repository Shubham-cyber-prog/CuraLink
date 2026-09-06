"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  User,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Calendar,
  FileText,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { LocationSelector } from "@/components/layout/LocationSelector";

interface TopNavbarProps {
  onMobileMenuToggle?: () => void;
}

export function TopNavbar({ onMobileMenuToggle }: TopNavbarProps) {
  const router = useRouter();
  const [userName, setUserName] = useState("Subham Nayak");
  const [userEmail, setUserEmail] = useState("sn343555@gmail.com");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch real user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/me`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        if (data.success && data.data) {
          setUserName(data.data.name || "Subham Nayak");
          setUserEmail(data.data.email || "sn343555@gmail.com");
        }
      } catch (err) {
        console.error("Failed to fetch top navbar user profile:", err);
      }
    };
    fetchUser();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(e.target as Node)
      ) {
        setNotificationsOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const csrfRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/csrf-token`);
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.token;

      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/logout`, {
        method: "POST",
        headers: { "X-CSRF-Token": csrfToken },
        credentials: "include",
      });
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

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#E2E8F0] bg-white px-4 sm:px-6 lg:px-8 shadow-xs">
      {/* ---- Left: Logo & Mobile Drawer Toggle ---- */}
      <div className="flex items-center gap-3">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none md:hidden"
            aria-label="Open menu"
            id="top-navbar-mobile-menu-btn"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <Logo href="/dashboard" />
      </div>

      {/* ---- Center: Location & Doctor Search Bar ---- */}
      <div className="hidden flex-1 max-w-xl mx-4 md:flex items-center gap-3">
        <LocationSelector />

        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            id="doctor-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctors, specialties, or symptoms..."
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-4 py-2 text-sm text-[#0F172A] placeholder:text-[#64748B] transition-colors focus:border-[#0F9D8C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F9D8C]/20"
          />
        </form>
      </div>

      {/* ---- Right: Actions (Location, Trust badge, Notifications, Profile) ---- */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Location selector (Mobile screen) */}
        <div className="md:hidden">
          <LocationSelector />
        </div>
        {/* Search Toggle icon (Mobile only) */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* HIPAA Trust Signal Badge */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-teal-200/80 bg-teal-50/80 px-3 py-1 text-xs font-medium text-teal-800">
          <ShieldCheck className="h-3.5 w-3.5 text-[#0F9D8C]" />
          <span>HIPAA-aligned</span>
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            id="navbar-notification-btn"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#0F9D8C] ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-lg ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#0F172A]">
                    Notifications
                  </h3>
                  <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                    2 new
                  </span>
                </div>
                <Link
                  href="/notifications"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs font-medium text-[#0F9D8C] hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-[#F8FAFC]">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-[#0F9D8C]">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#0F172A]">
                      Upcoming Appointment Today
                    </p>
                    <p className="text-xs text-[#64748B]">
                      Dr. Ananya Sharma • 4:30 PM
                    </p>
                    <span className="mt-1 block text-[10px] text-slate-400">
                      10 mins ago
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-[#F8FAFC]">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#0F172A]">
                      New Lab Report Available
                    </p>
                    <p className="text-xs text-[#64748B]">
                      Complete Blood Count (CBC) analysis uploaded.
                    </p>
                    <span className="mt-1 block text-[10px] text-slate-400">
                      1 hour ago
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            id="navbar-profile-avatar-btn"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 rounded-xl border border-[#E2E8F0] p-1.5 pr-2.5 transition-colors hover:bg-slate-50 focus:outline-none"
            aria-label="User Profile menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 font-medium text-[#0F9D8C]">
              {userName ? userName.charAt(0).toUpperCase() : "S"}
            </div>
            <span className="hidden text-sm font-medium text-[#0F172A] sm:inline-block max-w-[120px] truncate">
              {userName}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:inline-block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-lg ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 duration-150">
              <div className="border-b border-[#E2E8F0] px-3 pb-3 pt-1">
                <p className="text-sm font-semibold text-[#0F172A] truncate">
                  {userName}
                </p>
                <p className="text-xs text-[#64748B] truncate">{userEmail}</p>
              </div>

              <div className="mt-2 space-y-1">
                <Link
                  id="profile-dropdown-settings-link"
                  href="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
                >
                  <User className="h-4 w-4 text-slate-500" />
                  Account Settings
                </Link>
                <button
                  id="profile-dropdown-logout-btn"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- Mobile Search Expand Drawer ---- */}
      {searchOpen && (
        <div className="absolute inset-x-0 top-full z-40 border-b border-[#E2E8F0] bg-white p-3 shadow-md md:hidden">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctors, specialties..."
              className="flex-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm text-[#0F172A] focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="rounded-xl bg-[#0F9D8C] px-4 py-2 text-sm font-medium text-white"
            >
              Search
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
