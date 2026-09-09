"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  Bell,
  Check,
  Loader2,
  ShieldCheck,
  Monitor,
  Smartphone,
  Key,
  Palette,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

type TabType = "general" | "security" | "notifications" | "appearance";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("general");

  // Form State
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Functional Toggle States (persisted in localStorage)
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [marketingUpdates, setMarketingUpdates] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load persisted preferences if available
    const savedApptReminders = localStorage.getItem("curalink_notif_appt");
    if (savedApptReminders !== null) {
      setAppointmentReminders(savedApptReminders === "true");
    }
    const savedMarketing = localStorage.getItem("curalink_notif_mkt");
    if (savedMarketing !== null) {
      setMarketingUpdates(savedMarketing === "true");
    }
    const saved2FA = localStorage.getItem("curalink_2fa");
    if (saved2FA !== null) {
      setTwoFactorAuth(saved2FA === "true");
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include",
        });
        
        if (res.status === 401) {
          router.replace("/login?redirect=/profile");
          return;
        }
        const data = await res.json();

        if (res.ok && data.success) {
          setProfile(data.data);
          setFormData({
            name: data.data.name || "Subham Nayak",
            email: data.data.email || "sn343555@gmail.com",
          });
        }
      } catch (err) {
        console.error("Profile page fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const csrfRes = await fetch(`${API_BASE}/auth/csrf-token`);
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.token;

      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile settings");
      }

      setProfile(data.data);
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAppointmentReminders = () => {
    const nextVal = !appointmentReminders;
    setAppointmentReminders(nextVal);
    localStorage.setItem("curalink_notif_appt", String(nextVal));
  };

  const toggleMarketingUpdates = () => {
    const nextVal = !marketingUpdates;
    setMarketingUpdates(nextVal);
    localStorage.setItem("curalink_notif_mkt", String(nextVal));
  };

  const toggle2FA = () => {
    const nextVal = !twoFactorAuth;
    setTwoFactorAuth(nextVal);
    localStorage.setItem("curalink_2fa", String(nextVal));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#0F9D8C] dark:text-[#14B8A6]" />
      </div>
    );
  }

  const nameInitial = formData.name
    ? formData.name.charAt(0).toUpperCase()
    : "S";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#263049] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
            Settings
          </h1>
          <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">
            Manage your account settings, security options, appearance, and notifications.
          </p>
        </div>

        {/* HIPAA Trust Badge */}
        <div className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-full border border-teal-200/80 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-950/40 px-3 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300">
          <ShieldCheck className="h-3.5 w-3.5 text-[#0F9D8C] dark:text-[#14B8A6]" />
          <span>HIPAA-aligned Account</span>
        </div>
      </div>

      {/* Settings Navigation Tabs & Content Layout */}
      <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
        {/* Tabs sidebar */}
        <aside className="w-full md:w-56 shrink-0">
          <nav
            className="flex space-x-2 md:flex-col md:space-x-0 md:space-y-1 overflow-x-auto pb-2 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            aria-label="Settings categories"
          >
            <button
              id="settings-tab-general"
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "general"
                  ? "bg-white dark:bg-[#151B2E] text-[#0F172A] dark:text-[#F1F5F9] border border-[#E2E8F0] dark:border-[#263049] shadow-xs font-semibold"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-200/50 dark:hover:bg-[#1C2338] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]"
              }`}
            >
              <User className="h-4 w-4" />
              General
            </button>

            <button
              id="settings-tab-appearance"
              onClick={() => setActiveTab("appearance")}
              className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "appearance"
                  ? "bg-white dark:bg-[#151B2E] text-[#0F172A] dark:text-[#F1F5F9] border border-[#E2E8F0] dark:border-[#263049] shadow-xs font-semibold"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-200/50 dark:hover:bg-[#1C2338] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]"
              }`}
            >
              <Palette className="h-4 w-4" />
              Appearance
            </button>

            <button
              id="settings-tab-security"
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "security"
                  ? "bg-white dark:bg-[#151B2E] text-[#0F172A] dark:text-[#F1F5F9] border border-[#E2E8F0] dark:border-[#263049] shadow-xs font-semibold"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-200/50 dark:hover:bg-[#1C2338] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]"
              }`}
            >
              <Shield className="h-4 w-4" />
              Security
            </button>

            <button
              id="settings-tab-notifications"
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "notifications"
                  ? "bg-white dark:bg-[#151B2E] text-[#0F172A] dark:text-[#F1F5F9] border border-[#E2E8F0] dark:border-[#263049] shadow-xs font-semibold"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-200/50 dark:hover:bg-[#1C2338] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]"
              }`}
            >
              <Bell className="h-4 w-4" />
              Notifications
            </button>
          </nav>
        </aside>

        {/* Right Content Panel */}
        <main className="flex-1 min-w-0">
          {/* GENERAL TAB */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] shadow-xs overflow-hidden transition-colors duration-200">
                <div className="border-b border-[#E2E8F0] dark:border-[#263049] px-6 py-5">
                  <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    Profile Information
                  </h2>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                    Update your account details and registered email address.
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex items-center gap-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/60 font-bold text-[#0F9D8C] dark:text-[#14B8A6] text-2xl border border-teal-200 dark:border-teal-800/60">
                      {nameInitial}
                    </div>
                    <div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#1C2338] px-3 py-1.5 text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#263049] cursor-pointer"
                        >
                          Upload avatar
                        </button>
                        <button
                          type="button"
                          className="rounded-xl px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1.5">
                        JPG, PNG or GIF up to 2MB.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="profile-name-input"
                        className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9]"
                      >
                        Full Name
                      </label>
                      <input
                        id="profile-name-input"
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          setHasChanges(true);
                          setSaveSuccess(false);
                        }}
                        className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#263049] bg-[#F8FAFC] dark:bg-[#0B1120] px-3.5 py-2 text-sm text-[#0F172A] dark:text-[#F1F5F9] focus:border-[#0F9D8C] dark:focus:border-[#14B8A6] focus:bg-white dark:focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#0F9D8C]/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="profile-email-input"
                        className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9]"
                      >
                        Email Address
                      </label>
                      <input
                        id="profile-email-input"
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          setHasChanges(true);
                          setSaveSuccess(false);
                        }}
                        className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#263049] bg-[#F8FAFC] dark:bg-[#0B1120] px-3.5 py-2 text-sm text-[#0F172A] dark:text-[#F1F5F9] focus:border-[#0F9D8C] dark:focus:border-[#14B8A6] focus:bg-white dark:focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#0F9D8C]/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] dark:bg-[#1C2338] px-6 py-4 border-t border-[#E2E8F0] dark:border-[#263049] flex items-center justify-between flex-wrap gap-3 transition-colors duration-200">
                  <div>
                    {saveError ? (
                      <p className="text-xs font-medium text-red-600 dark:text-red-400">
                        {saveError}
                      </p>
                    ) : saveSuccess ? (
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Saved successfully
                      </p>
                    ) : (
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                        Changes will be saved to your patient profile.
                      </p>
                    )}
                  </div>
                  <button
                    id="save-profile-btn"
                    onClick={handleSaveProfile}
                    disabled={!hasChanges || isSaving}
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-[#0F9D8C] dark:bg-[#14B8A6] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0C8577] dark:hover:bg-teal-500 disabled:opacity-50 transition-colors active:scale-[0.97] cursor-pointer"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    Save Changes
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] shadow-xs overflow-hidden transition-colors duration-200">
                <div className="border-b border-[#E2E8F0] dark:border-[#263049] px-6 py-5">
                  <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    Theme & Visual Preferences
                  </h2>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                    Choose how CuraLink looks to you. Preferences automatically persist across devices and browser sessions.
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Light Option */}
                    <div
                      id="theme-option-light"
                      onClick={() => setTheme("light")}
                      className={`group relative flex flex-col justify-between rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                        mounted && theme === "light"
                          ? "border-[#0F9D8C] bg-teal-50/20 dark:border-[#14B8A6]"
                          : "border-[#E2E8F0] dark:border-[#263049] hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                          <Sun className="h-5 w-5" />
                        </div>
                        <span
                          className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                            mounted && theme === "light"
                              ? "border-[#0F9D8C] bg-[#0F9D8C]"
                              : "border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {mounted && theme === "light" && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                          Light Mode
                        </p>
                        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                          High contrast, crisp clinic palette.
                        </p>
                      </div>
                    </div>

                    {/* Dark Option */}
                    <div
                      id="theme-option-dark"
                      onClick={() => setTheme("dark")}
                      className={`group relative flex flex-col justify-between rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                        mounted && theme === "dark"
                          ? "border-[#0F9D8C] bg-teal-50/20 dark:border-[#14B8A6] dark:bg-teal-950/20"
                          : "border-[#E2E8F0] dark:border-[#263049] hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-teal-400">
                          <Moon className="h-5 w-5" />
                        </div>
                        <span
                          className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                            mounted && theme === "dark"
                              ? "border-[#0F9D8C] dark:border-[#14B8A6] bg-[#0F9D8C] dark:bg-[#14B8A6]"
                              : "border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {mounted && theme === "dark" && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                          Dark Mode
                        </p>
                        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                          Deep navy #0B1120, gentle on the eyes.
                        </p>
                      </div>
                    </div>

                    {/* System Option */}
                    <div
                      id="theme-option-system"
                      onClick={() => setTheme("system")}
                      className={`group relative flex flex-col justify-between rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                        mounted && theme === "system"
                          ? "border-[#0F9D8C] bg-teal-50/20 dark:border-[#14B8A6] dark:bg-teal-950/20"
                          : "border-[#E2E8F0] dark:border-[#263049] hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                          <Laptop className="h-5 w-5" />
                        </div>
                        <span
                          className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                            mounted && theme === "system"
                              ? "border-[#0F9D8C] dark:border-[#14B8A6] bg-[#0F9D8C] dark:bg-[#14B8A6]"
                              : "border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {mounted && theme === "system" && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                          System Sync
                        </p>
                        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                          Follows your device OS appearance.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 dark:border-[#263049] bg-slate-50/60 dark:bg-[#0B1120] p-4 text-xs text-[#64748B] dark:text-[#94A3B8]">
                    <p>
                      Active mode: <strong className="text-[#0F172A] dark:text-[#F1F5F9] capitalize">{theme || "system"}</strong>
                      {theme === "system" && (
                        <span> (resolving to {systemTheme || "light"})</span>
                      )}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] shadow-xs overflow-hidden transition-colors duration-200">
                <div className="border-b border-[#E2E8F0] dark:border-[#263049] px-6 py-5">
                  <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    Change Password
                  </h2>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                    Ensure your account is using a long, random password to stay secure.
                  </p>
                </div>
                <div className="p-6 space-y-4 max-w-md">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#263049] bg-[#F8FAFC] dark:bg-[#0B1120] px-3 py-2 text-sm text-[#0F172A] dark:text-[#F1F5F9] focus:border-[#0F9D8C] dark:focus:border-[#14B8A6] focus:bg-white dark:focus:bg-[#0B1120] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#263049] bg-[#F8FAFC] dark:bg-[#0B1120] px-3 py-2 text-sm text-[#0F172A] dark:text-[#F1F5F9] focus:border-[#0F9D8C] dark:focus:border-[#14B8A6] focus:bg-white dark:focus:bg-[#0B1120] focus:outline-none"
                    />
                  </div>
                  <div className="pt-2">
                    <button className="min-h-[40px] rounded-xl bg-[#0F172A] dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer active:scale-[0.97] transition-all">
                      Update Password
                    </button>
                  </div>
                </div>
              </section>

              {/* Two-Factor Authentication Toggle */}
              <section className="rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] shadow-xs overflow-hidden transition-colors duration-200">
                <div className="p-6 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                      Two-Factor Authentication (2FA)
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                      Add an extra layer of security using an authenticator app.
                    </p>
                  </div>

                  <button
                    type="button"
                    id="toggle-2fa-btn"
                    onClick={toggle2FA}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-out focus:outline-none ${
                      twoFactorAuth ? "bg-[#0F9D8C] dark:bg-[#14B8A6]" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                    role="switch"
                    aria-checked={twoFactorAuth}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-[#F1F5F9] shadow-sm ring-0 transition-transform duration-200 ease-out ${
                        twoFactorAuth ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] shadow-xs overflow-hidden transition-colors duration-200">
                <div className="border-b border-[#E2E8F0] dark:border-[#263049] px-6 py-5">
                  <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    Email Notification Preferences
                  </h2>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                    Choose what health updates and appointment reminders you receive.
                  </p>
                </div>

                <div className="divide-y divide-[#E2E8F0] dark:divide-[#263049]">
                  {/* Appointment Reminders Toggle */}
                  <div className="p-6 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                        Appointment Reminders
                      </h3>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                        Receive SMS and email reminders 24 hours prior to scheduled visits.
                      </p>
                    </div>

                    <button
                      type="button"
                      id="toggle-appointment-reminders"
                      onClick={toggleAppointmentReminders}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-out focus:outline-none ${
                        appointmentReminders ? "bg-[#0F9D8C] dark:bg-[#14B8A6]" : "bg-slate-200 dark:bg-slate-700"
                      }`}
                      role="switch"
                      aria-checked={appointmentReminders}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-[#F1F5F9] shadow-sm ring-0 transition-transform duration-200 ease-out ${
                          appointmentReminders ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Marketing Updates Toggle */}
                  <div className="p-6 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                        Marketing & Health Tips
                      </h3>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                        Receive preventive health insights and promotional updates.
                      </p>
                    </div>

                    <button
                      type="button"
                      id="toggle-marketing-updates"
                      onClick={toggleMarketingUpdates}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-out focus:outline-none ${
                        marketingUpdates ? "bg-[#0F9D8C] dark:bg-[#14B8A6]" : "bg-slate-200 dark:bg-slate-700"
                      }`}
                      role="switch"
                      aria-checked={marketingUpdates}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-[#F1F5F9] shadow-sm ring-0 transition-transform duration-200 ease-out ${
                          marketingUpdates ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
