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
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

type TabType = "general" | "security" | "notifications";

export default function ProfileSettingsPage() {
  const router = useRouter();
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
        const token =
          localStorage.getItem("curalink_token") ||
          sessionStorage.getItem("curalink_token");
        if (!token) {
          router.replace("/login?redirect=/profile");
          return;
        }

        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
      const token =
        localStorage.getItem("curalink_token") ||
        sessionStorage.getItem("curalink_token");
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile settings");
      }

      setProfile(data.data);
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setSaveError(err.message || "An error occurred while saving profile");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAppointmentReminders = () => {
    const val = !appointmentReminders;
    setAppointmentReminders(val);
    localStorage.setItem("curalink_notif_appt", String(val));
  };

  const toggleMarketingUpdates = () => {
    const val = !marketingUpdates;
    setMarketingUpdates(val);
    localStorage.setItem("curalink_notif_mkt", String(val));
  };

  const toggle2FA = () => {
    const val = !twoFactorAuth;
    setTwoFactorAuth(val);
    localStorage.setItem("curalink_2fa", String(val));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#0F9D8C]" />
      </div>
    );
  }

  const nameInitial = formData.name
    ? formData.name.charAt(0).toUpperCase()
    : "S";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Settings
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Manage your account settings, security options, and email preferences.
          </p>
        </div>

        {/* HIPAA Trust Badge */}
        <div className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
          <ShieldCheck className="h-3.5 w-3.5 text-[#0F9D8C]" />
          <span>HIPAA-aligned Account</span>
        </div>
      </div>

      {/* Settings Navigation Tabs & Content Layout */}
      <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
        {/* Tabs sidebar - sits directly on light #F8FAFC bg */}
        <aside className="w-full md:w-56 shrink-0">
          <nav
            className="flex space-x-2 md:flex-col md:space-x-0 md:space-y-1 overflow-x-auto pb-2 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            aria-label="Settings categories"
          >
            <button
              id="settings-tab-general"
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "general"
                  ? "bg-white text-[#0F172A] border border-[#E2E8F0] shadow-xs font-semibold"
                  : "text-[#64748B] hover:bg-slate-200/50 hover:text-[#0F172A]"
              }`}
            >
              <User className="h-4 w-4" />
              General
            </button>

            <button
              id="settings-tab-security"
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "security"
                  ? "bg-white text-[#0F172A] border border-[#E2E8F0] shadow-xs font-semibold"
                  : "text-[#64748B] hover:bg-slate-200/50 hover:text-[#0F172A]"
              }`}
            >
              <Shield className="h-4 w-4" />
              Security
            </button>

            <button
              id="settings-tab-notifications"
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "notifications"
                  ? "bg-white text-[#0F172A] border border-[#E2E8F0] shadow-xs font-semibold"
                  : "text-[#64748B] hover:bg-slate-200/50 hover:text-[#0F172A]"
              }`}
            >
              <Bell className="h-4 w-4" />
              Notifications
            </button>
          </nav>
        </aside>

        {/* Right Content Panel - pure white card on #F8FAFC */}
        <main className="flex-1 min-w-0">
          {/* GENERAL TAB */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
                <div className="border-b border-[#E2E8F0] px-6 py-5">
                  <h2 className="text-base font-bold text-[#0F172A]">
                    Profile Information
                  </h2>
                  <p className="text-xs text-[#64748B] mt-1">
                    Update your account details and registered email address.
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex items-center gap-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 font-bold text-[#0F9D8C] text-2xl border border-teal-200">
                      {nameInitial}
                    </div>
                    <div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
                        >
                          Upload avatar
                        </button>
                        <button
                          type="button"
                          className="rounded-xl px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-1.5">
                        JPG, PNG or GIF up to 2MB.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="profile-name-input"
                        className="text-xs font-semibold text-[#0F172A]"
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
                        className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-sm text-[#0F172A] focus:border-[#0F9D8C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F9D8C]/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="profile-email-input"
                        className="text-xs font-semibold text-[#0F172A]"
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
                        className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-sm text-[#0F172A] focus:border-[#0F9D8C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F9D8C]/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-between flex-wrap gap-3">
                  <div>
                    {saveError ? (
                      <p className="text-xs font-medium text-red-600">
                        {saveError}
                      </p>
                    ) : saveSuccess ? (
                      <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Saved successfully
                      </p>
                    ) : (
                      <p className="text-xs text-[#64748B]">
                        Changes will be saved to your patient profile.
                      </p>
                    )}
                  </div>
                  <button
                    id="save-profile-btn"
                    onClick={handleSaveProfile}
                    disabled={!hasChanges || isSaving}
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-[#0F9D8C] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0C8577] disabled:opacity-50 transition-colors"
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

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
                <div className="border-b border-[#E2E8F0] px-6 py-5">
                  <h2 className="text-base font-bold text-[#0F172A]">
                    Change Password
                  </h2>
                  <p className="text-xs text-[#64748B] mt-1">
                    Ensure your account is using a long, random password to stay secure.
                  </p>
                </div>
                <div className="p-6 space-y-4 max-w-md">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0F172A]">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm text-[#0F172A] focus:border-[#0F9D8C] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0F172A]">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm text-[#0F172A] focus:border-[#0F9D8C] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="pt-2">
                    <button className="min-h-[40px] rounded-xl bg-[#0F172A] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                      Update Password
                    </button>
                  </div>
                </div>
              </section>

              {/* Two-Factor Authentication Toggle */}
              <section className="rounded-2xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
                <div className="p-6 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">
                      Two-Factor Authentication (2FA)
                    </h3>
                    <p className="text-xs text-[#64748B] mt-1">
                      Add an extra layer of security using an authenticator app.
                    </p>
                  </div>

                  <button
                    type="button"
                    id="toggle-2fa-btn"
                    onClick={toggle2FA}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      twoFactorAuth ? "bg-[#0F9D8C]" : "bg-slate-200"
                    }`}
                    role="switch"
                    aria-checked={twoFactorAuth}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
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
              <section className="rounded-2xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
                <div className="border-b border-[#E2E8F0] px-6 py-5">
                  <h2 className="text-base font-bold text-[#0F172A]">
                    Email Notification Preferences
                  </h2>
                  <p className="text-xs text-[#64748B] mt-1">
                    Choose what health updates and appointment reminders you receive.
                  </p>
                </div>

                <div className="divide-y divide-[#E2E8F0]">
                  {/* Appointment Reminders Toggle */}
                  <div className="p-6 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A]">
                        Appointment Reminders
                      </h3>
                      <p className="text-xs text-[#64748B] mt-1">
                        Receive SMS and email reminders 24 hours prior to scheduled visits.
                      </p>
                    </div>

                    <button
                      type="button"
                      id="toggle-appointment-reminders"
                      onClick={toggleAppointmentReminders}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        appointmentReminders ? "bg-[#0F9D8C]" : "bg-slate-200"
                      }`}
                      role="switch"
                      aria-checked={appointmentReminders}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          appointmentReminders
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Marketing Updates Toggle */}
                  <div className="p-6 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A]">
                        Marketing & Health Tips
                      </h3>
                      <p className="text-xs text-[#64748B] mt-1">
                        Receive preventive health insights and promotional updates.
                      </p>
                    </div>

                    <button
                      type="button"
                      id="toggle-marketing-updates"
                      onClick={toggleMarketingUpdates}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        marketingUpdates ? "bg-[#0F9D8C]" : "bg-slate-200"
                      }`}
                      role="switch"
                      aria-checked={marketingUpdates}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
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
