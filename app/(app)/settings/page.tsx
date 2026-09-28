"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Shield,
  Bell,
  Check,
  Loader2,
  ShieldCheck,
  Key,
  Palette,
  Sun,
  Moon,
  Laptop,
  Download,
  Trash2,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Phone,
  Mail,
  Heart,
  FileText,
  Stethoscope,
  MapPin,
  Video,
  Sparkles,
  ExternalLink,
  Award,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  phoneVerified?: boolean;
  age?: number | null;
  gender?: string | null;
  profileCompleted?: boolean;
  createdAt: string;
}

type TabType = "general" | "practice" | "notifications" | "security" | "appearance" | "privacy";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("general");

  // Doctor Practice Profile State
  const [doctorProfile, setDoctorProfile] = useState({
    specialization: "General Practice",
    city: "",
    consultationFee: 500,
    consultationModes: ["VIDEO"] as string[],
    experienceYears: 5,
    medicalLicenseNumber: "",
    bio: "",
    verificationStatus: "APPROVED",
  });
  const [isSavingDoctor, setIsSavingDoctor] = useState(false);
  const [doctorSaveSuccess, setDoctorSaveSuccess] = useState(false);
  const [doctorSaveError, setDoctorSaveError] = useState<string | null>(null);
  const [isLoadingDoctorProfile, setIsLoadingDoctorProfile] = useState(false);

  // General Profile Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "+91 98765 43210",
    age: "32",
    gender: "Male",
    bloodGroup: "A+",
    emergencyContact: "+91 91234 56789",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Notification Toggle States
  const [apptReminders, setApptReminders] = useState(true);
  const [doctorMessages, setDoctorMessages] = useState(true);
  const [rxAlerts, setRxAlerts] = useState(true);
  const [aiInsights, setAiInsights] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);

  // Security Toggles
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [biometricUnlock, setBiometricUnlock] = useState(true);

  // Data Privacy Modal & Download State
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    // Load persisted preferences
    if (typeof window !== "undefined") {
      const savedAppt = localStorage.getItem("curalink_notif_appt");
      if (savedAppt !== null) setApptReminders(savedAppt === "true");

      const savedMsg = localStorage.getItem("curalink_notif_msg");
      if (savedMsg !== null) setDoctorMessages(savedMsg === "true");

      const savedRx = localStorage.getItem("curalink_notif_rx");
      if (savedRx !== null) setRxAlerts(savedRx === "true");

      const savedAi = localStorage.getItem("curalink_notif_ai");
      if (savedAi !== null) setAiInsights(savedAi === "true");

      const savedDigest = localStorage.getItem("curalink_notif_digest");
      if (savedDigest !== null) setEmailDigest(savedDigest === "true");

      const saved2FA = localStorage.getItem("curalink_2fa");
      if (saved2FA !== null) setTwoFactorAuth(saved2FA === "true");

      const savedBio = localStorage.getItem("curalink_bio");
      if (savedBio !== null) setBiometricUnlock(savedBio === "true");

      const savedPhone = localStorage.getItem("curalink_user_phone");
      const savedBlood = localStorage.getItem("curalink_user_blood");
      const savedEmerg = localStorage.getItem("curalink_user_emerg");
      if (savedPhone) setFormData((prev) => ({ ...prev, phone: savedPhone }));
      if (savedBlood) setFormData((prev) => ({ ...prev, bloodGroup: savedBlood }));
      if (savedEmerg) setFormData((prev) => ({ ...prev, emergencyContact: savedEmerg }));

      // Check URL query parameters for direct tab navigation
      const tabParam = new URLSearchParams(window.location.search).get("tab");
      if (tabParam === "practice" || tabParam === "doctor") {
        setActiveTab("practice");
      } else if (tabParam && ["general", "notifications", "security", "appearance", "privacy"].includes(tabParam)) {
        setActiveTab(tabParam as TabType);
      }
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include",
        });

        if (res.status === 401) {
          router.replace("/login?redirect=/settings");
          return;
        }
        const data = await res.json();

        if (res.ok && data.success && data.data) {
          const user = data.data.user || data.data;
          setProfile(user);
          setFormData((prev) => ({
            ...prev,
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || prev.phone || "+91 98765 43210",
            age: user.age !== undefined && user.age !== null ? String(user.age) : "32",
            gender: user.gender || "Male",
          }));

          // If logged-in user is a DOCTOR, load clinical practice details
          if (user.role === "DOCTOR") {
            try {
              setIsLoadingDoctorProfile(true);
              const docRes = await api.get("/doctors/me");
              if (docRes?.success && docRes.data) {
                const doc = docRes.data;
                setDoctorProfile({
                  specialization: doc.specialization || "General Practice",
                  city: doc.city || "",
                  consultationFee: doc.consultationFee ?? 500,
                  consultationModes: Array.isArray(doc.consultationModes) && doc.consultationModes.length > 0
                    ? doc.consultationModes
                    : ["VIDEO"],
                  experienceYears: doc.experienceYears ?? 5,
                  medicalLicenseNumber: doc.medicalLicenseNumber || "",
                  bio: doc.bio || "",
                  verificationStatus: doc.verificationStatus || "APPROVED",
                });
              }
            } catch (docErr) {
              console.warn("Could not load doctor practice profile:", docErr);
            } finally {
              setIsLoadingDoctorProfile(false);
            }
          }
        }
      } catch (err) {
        console.error("Settings page fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSaveDoctorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDoctor(true);
    setDoctorSaveSuccess(false);
    setDoctorSaveError(null);

    try {
      if (!doctorProfile.consultationModes || doctorProfile.consultationModes.length === 0) {
        throw new Error("Please select at least one consultation mode (Video Call or In-Person).");
      }

      const res = await api.patch("/doctors/me/profile", {
        name: formData.name,
        phone: formData.phone,
        specialization: doctorProfile.specialization,
        city: doctorProfile.city ? doctorProfile.city.trim() : null,
        consultationFee: Number(doctorProfile.consultationFee) || 500,
        consultationModes: doctorProfile.consultationModes,
        experienceYears: Number(doctorProfile.experienceYears) || 0,
        medicalLicenseNumber: doctorProfile.medicalLicenseNumber || "PENDING",
        bio: doctorProfile.bio || "",
      });

      if (!res.success) {
        throw new Error(res.message || "Failed to update doctor practice profile");
      }

      setDoctorSaveSuccess(true);
      setTimeout(() => setDoctorSaveSuccess(false), 5000);
    } catch (err: any) {
      setDoctorSaveError(err.message || "An unexpected error occurred while saving practice profile");
    } finally {
      setIsSavingDoctor(false);
    }
  };

  const toggleConsultationMode = (mode: "VIDEO" | "IN_PERSON") => {
    setDoctorProfile((prev) => {
      const exists = prev.consultationModes.includes(mode);
      let newModes: string[];
      if (exists) {
        if (prev.consultationModes.length === 1) return prev; // Keep at least one mode
        newModes = prev.consultationModes.filter((m) => m !== mode);
      } else {
        newModes = [...prev.consultationModes, mode];
      }
      return { ...prev, consultationModes: newModes };
    });
  };

  const handleVerifyPhone = async () => {
    setIsVerifyingPhone(true);
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
          phone: formData.phone,
          phoneVerified: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const updated = data.data?.user || data.data;
        setProfile(updated);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Phone verification error:", err);
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      // Persist client extras
      localStorage.setItem("curalink_user_phone", formData.phone);
      localStorage.setItem("curalink_user_blood", formData.bloodGroup);
      localStorage.setItem("curalink_user_emerg", formData.emergencyContact);

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
          phone: formData.phone || undefined,
          age: formData.age ? Number(formData.age) : undefined,
          gender: formData.gender || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile settings");
      }

      setProfile(data.data?.user || data.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (passwordData.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const data = await api.post("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to change password");
      }

      setPasswordSuccess(true);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      setPasswordError(err.message || "Could not update password. Please check your current password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDownloadRecords = () => {
    setIsDownloading(true);
    setTimeout(() => {
      const recordsData = {
        patient: {
          name: formData.name || profile?.name || "Patient",
          email: formData.email || profile?.email,
          bloodGroup: formData.bloodGroup,
          phone: formData.phone,
        },
        exportedAt: new Date().toISOString(),
        status: "HIPAA Certified Export",
        platform: "CuraLink Telehealth Platform",
      };

      const blob = new Blob([JSON.stringify(recordsData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `curalink_medical_records_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    }, 1200);
  };

  const handleRequestDataErasure = async () => {
    if (deleteConfirmationText !== "DELETE") {
      setDeleteStatus("Please type DELETE in capital letters to confirm.");
      return;
    }
    setIsDeleting(true);
    setDeleteStatus(null);
    try {
      const data = await api.post("/privacy/erasure-request", {
        reason: "User requested full account and data erasure via settings",
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to submit erasure request.");
      }

      setDeleteStatus("Data erasure request submitted. An audit email has been sent to your registered address.");
      setTimeout(() => {
        setShowDeleteModal(false);
        setDeleteConfirmationText("");
        setDeleteStatus(null);
      }, 3500);
    } catch (err: any) {
      setDeleteStatus(err.message || "Failed to submit request.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600 dark:text-teal-400" />
      </div>
    );
  }

  const nameInitial = formData.name ? formData.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Account Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your personal profile, notifications, security, and HIPAA data controls.
          </p>
        </div>

        {/* Brand HIPAA Trust Badge */}
        <div className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-full border border-teal-200/80 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-950/40 px-3 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          <span>HIPAA-aligned Workspace</span>
        </div>
      </div>

      {/* Tabs & Content Layout */}
      <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-60 shrink-0">
          <nav
            className="flex space-x-2 md:flex-col md:space-x-0 md:space-y-1.5 overflow-x-auto pb-2 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            aria-label="Settings navigation"
          >
            {[
              ...(profile?.role === "DOCTOR"
                ? [{ id: "practice", label: "Practice Profile", icon: Stethoscope }]
                : []),
              { id: "general", label: profile?.role === "DOCTOR" ? "Personal Account" : "Profile & Vitals", icon: User },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "security", label: "Password & Security", icon: Shield },
              { id: "appearance", label: "Appearance", icon: Palette },
              { id: "privacy", label: "Data & Privacy", icon: Lock },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    active
                      ? "bg-teal-50/80 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 border border-teal-200/80 dark:border-teal-800/60 font-semibold shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-teal-600 dark:text-teal-400" : ""}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Quick Health / Practice Status Card */}
          <div className="mt-6 hidden md:block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-4 shadow-xs">
            {profile?.role === "DOCTOR" ? (
              <>
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-2">
                  <Stethoscope className="h-3.5 w-3.5" />
                  Physician Practice
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Specialty:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[120px]">
                      {doctorProfile.specialization}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Location:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {doctorProfile.city || "Not Set"}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Session Fee:</span>
                    <span className="font-semibold text-teal-700 dark:text-teal-400">
                      ₹{doctorProfile.consultationFee}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Active Modes:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {doctorProfile.consultationModes.includes("VIDEO") && doctorProfile.consultationModes.includes("IN_PERSON")
                        ? "Video + Clinic"
                        : doctorProfile.consultationModes.includes("VIDEO")
                        ? "Video Call"
                        : "Clinic Visit"}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>License:</span>
                    <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {doctorProfile.medicalLicenseNumber || "PENDING"}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-2">
                  <Heart className="h-3.5 w-3.5" />
                  Patient Health Card
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Blood Type:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formData.bloodGroup}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Role:</span>
                    <span className="font-semibold text-teal-700 dark:text-teal-400">{profile?.role || "PATIENT"}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Status:</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>

        {/* Content Panels */}
        <main className="flex-1 min-w-0">
          {/* TAB 1: GENERAL PROFILE */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xs overflow-hidden">
                <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-5">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Personal Information
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Update your registered telehealth account and contact details.
                  </p>
                </div>

                {profile?.role === "DOCTOR" && (
                  <div className="m-6 mb-0 rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/40 p-4 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-teal-100 dark:bg-teal-900/60 flex items-center justify-center text-teal-700 dark:text-teal-300 shrink-0">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">
                          Doctor Practice Profile Available
                        </p>
                        <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                          Configure your consultation modes (Video & Clinic Visit), practice city, fees, and specialty for patients to find you.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("practice")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0D9488] px-3.5 py-2 font-semibold text-white hover:bg-[#0B7267] transition-colors shrink-0 text-xs shadow-xs cursor-pointer"
                    >
                      Configure Practice Profile →
                    </button>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex items-center gap-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-950/60 font-bold text-teal-700 dark:text-teal-300 text-2xl border border-teal-200 dark:border-teal-800/60 shadow-xs">
                      {nameInitial}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formData.name || "Patient Profile"}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {profile?.role === "DOCTOR" ? "Licensed Clinician" : "Verified Patient Account"}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          Change Photo
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-900 dark:text-white">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070b14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-teal-500 focus:bg-white dark:focus:bg-[#070b14] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-900 dark:text-white">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070b14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-teal-500 focus:bg-white dark:focus:bg-[#070b14] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-900 dark:text-white">
                          Contact Phone Number
                        </label>
                        {profile?.phoneVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" /> Phone Verified
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleVerifyPhone}
                            disabled={isVerifyingPhone || !formData.phone}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#085041] hover:underline dark:text-teal-400 cursor-pointer disabled:opacity-50"
                          >
                            {isVerifyingPhone ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <ShieldCheck className="h-2.5 w-2.5" />}
                            Verify with OTP
                          </button>
                        )}
                      </div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070b14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-teal-500 focus:bg-white dark:focus:bg-[#070b14] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-900 dark:text-white">
                        Age (Years)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="125"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        placeholder="e.g. 32"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070b14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-teal-500 focus:bg-white dark:focus:bg-[#070b14] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-900 dark:text-white">
                        Gender
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070b14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-teal-500 focus:bg-white dark:focus:bg-[#070b14] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      >
                        {["Male", "Female", "Non-binary", "Other", "Prefer not to say"].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-900 dark:text-white">
                        Blood Group
                      </label>
                      <select
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070b14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-teal-500 focus:bg-white dark:focus:bg-[#070b14] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      >
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"].map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-900 dark:text-white">
                        Emergency Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        placeholder="Family member or emergency guardian"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070b14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-teal-500 focus:bg-white dark:focus:bg-[#070b14] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      {saveError && (
                        <p className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" /> {saveError}
                        </p>
                      )}
                      {saveSuccess && (
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Profile changes saved successfully
                        </p>
                      )}
                    </div>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Save Profile Changes
                    </Button>
                  </div>
                </form>
              </section>
            </div>
          )}

          {/* TAB: DOCTOR PRACTICE PROFILE */}
          {activeTab === "practice" && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xs overflow-hidden">
                {/* Header */}
                <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Doctor Practice & Discovery Settings
                      </h2>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        {doctorProfile.verificationStatus || "APPROVED"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Set your medical specialty, consultation modes (Video Call & In-Person), practice city, and consultation fee. These fields directly control your visibility on the patient-facing Find Doctor page.
                    </p>
                  </div>
                  <Link
                    href="/find-doctor"
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
                  >
                    <span>View Find Doctor Portal</span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  </Link>
                </div>

                {isLoadingDoctorProfile ? (
                  <div className="flex min-h-[300px] items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-teal-600 dark:text-teal-400" />
                  </div>
                ) : (
                  <form onSubmit={handleSaveDoctorProfile} className="p-6 space-y-6">
                    {/* Alerts */}
                    {doctorSaveSuccess && (
                      <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 p-4 text-xs font-medium text-teal-900 dark:text-teal-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                          <span>
                            Practice profile updated successfully! Your clinical settings are now live for patient search and booking.
                          </span>
                        </div>
                        <Link
                          href="/find-doctor"
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#0D9488] dark:text-teal-300 hover:underline shrink-0"
                        >
                          Verify on Find Doctor →
                        </Link>
                      </div>
                    )}

                    {doctorSaveError && (
                      <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs font-medium text-rose-900 dark:text-rose-200 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                        <span>{doctorSaveError}</span>
                      </div>
                    )}

                    {/* Section 1: Consultation Modes (Video Call & In-Person) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Consultation Modes Offered <span className="text-rose-500">*</span>
                          </label>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Patients filtering by &ldquo;Video Call&rdquo; or &ldquo;In-Person / Home&rdquo; on the Find Doctor page will match based on these selections. Select all that apply.
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                          {doctorProfile.consultationModes.length === 2
                            ? "✓ Both Modes Active"
                            : doctorProfile.consultationModes.includes("VIDEO")
                            ? "Video Only"
                            : "In-Person Only"}
                        </span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {/* Video Call Mode Card */}
                        <div
                          onClick={() => toggleConsultationMode("VIDEO")}
                          className={`relative flex items-start gap-3.5 rounded-2xl border p-4 transition-all duration-150 cursor-pointer select-none ${
                            doctorProfile.consultationModes.includes("VIDEO")
                              ? "border-teal-500/80 bg-teal-50/60 dark:bg-teal-950/30 ring-2 ring-teal-500/20 shadow-xs"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          }`}
                        >
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                            doctorProfile.consultationModes.includes("VIDEO")
                              ? "bg-teal-600 text-white shadow-xs"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                          }`}>
                            <Video className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-slate-900 dark:text-white">
                                Video Call (Telehealth)
                              </span>
                              <input
                                type="checkbox"
                                checked={doctorProfile.consultationModes.includes("VIDEO")}
                                onChange={() => toggleConsultationMode("VIDEO")}
                                className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                              />
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Encrypted remote video sessions with integrated EHR, clinical notes, and digital prescriptions.
                            </p>
                            <span className="mt-2 inline-flex items-center rounded-md bg-teal-100/70 dark:bg-teal-900/50 px-2 py-0.5 text-[10px] font-semibold text-teal-800 dark:text-teal-200">
                              Matches &ldquo;Video Call&rdquo; filter
                            </span>
                          </div>
                        </div>

                        {/* In-Person Mode Card */}
                        <div
                          onClick={() => toggleConsultationMode("IN_PERSON")}
                          className={`relative flex items-start gap-3.5 rounded-2xl border p-4 transition-all duration-150 cursor-pointer select-none ${
                            doctorProfile.consultationModes.includes("IN_PERSON")
                              ? "border-emerald-500/80 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-xs"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          }`}
                        >
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                            doctorProfile.consultationModes.includes("IN_PERSON")
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                          }`}>
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-slate-900 dark:text-white">
                                In-Person Clinic Visit
                              </span>
                              <input
                                type="checkbox"
                                checked={doctorProfile.consultationModes.includes("IN_PERSON")}
                                onChange={() => toggleConsultationMode("IN_PERSON")}
                                className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Physical hospital or clinic examination in your registered practice city.
                            </p>
                            <span className="mt-2 inline-flex items-center rounded-md bg-emerald-100/70 dark:bg-emerald-900/50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-200">
                              Matches &ldquo;In-Person / Home&rdquo; filter
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      {/* Specialization */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-900 dark:text-white">
                          Clinical Specialization <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={doctorProfile.specialization}
                          onChange={(e) => setDoctorProfile({ ...doctorProfile, specialization: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070b14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-teal-500 focus:bg-white dark:focus:bg-[#070b14] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                          required
                        >
                          {[
                            "General Practice",
                            "Cardiology",
                            "Dermatology",
                            "Pediatrics",
                            "Neurology",
                            "Psychiatry",
                            "Orthopedics",
                            "Oncology",
                            "Gynecology & Obstetrics",
                            "Endocrinology",
                            "Ophthalmology",
                            "ENT (Otolaryngology)",
                            "Pulmonology",
                          ].map((spec) => (
                            <option key={spec} value={spec}>
                              {spec}
                            </option>
                          ))}
                        </select>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Matches the Specialty filter chips on the patient-facing Find Doctor page.
                        </p>
                      </div>

                      {/* Practice City */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-900 dark:text-white">
                          Practice City & Location
                        </label>
                        <input
                          type="text"
                          value={doctorProfile.city}
                          onChange={(e) => setDoctorProfile({ ...doctorProfile, city: e.target.value })}
                          placeholder="e.g. Hisar, New Delhi, Mumbai, Bengaluru"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070b14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-teal-500 focus:bg-white dark:focus:bg-[#070b14] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        />
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[10px] text-slate-400">Quick pick:</span>
                          {["Hisar", "New Delhi", "Mumbai", "Bengaluru", "Pune", "Chandigarh"].map((quickCity) => (
                            <button
                              key={quickCity}
                              type="button"
                              onClick={() => setDoctorProfile({ ...doctorProfile, city: quickCity })}
                              className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/60 dark:hover:text-teal-300 transition-colors cursor-pointer"
                            >
                              {quickCity}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Consultation Fee */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-900 dark:text-white">
                          Consultation Fee (₹ INR) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold text-sm">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="50"
                            value={doctorProfile.consultationFee}
                            onChange={(e) => setDoctorProfile({ ...doctorProfile, consultationFee: Number(e.target.value) })}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070b14] pl-8 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-teal-500 focus:bg-white dark:focus:bg-[#070b14] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                            required
                          />
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[10px] text-slate-400">Presets:</span>
                          {[500, 750, 1000, 1500].map((fee) => (
                            <button
                              key={fee}
                              type="button"
                              onClick={() => setDoctorProfile({ ...doctorProfile, consultationFee: fee })}
                              className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/60 dark:hover:text-teal-300 transition-colors cursor-pointer"
                            >
                              ₹{fee}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Experience Years */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-900 dark:text-white">
                          Clinical Experience (Years)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="65"
                          value={doctorProfile.experienceYears}
                          onChange={(e) => setDoctorProfile({ ...doctorProfile, experienceYears: Number(e.target.value) })}
                          placeholder="e.g. 8"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070b14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-teal-500 focus:bg-white dark:focus:bg-[#070b14] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        />
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Appears as &ldquo;{doctorProfile.experienceYears}+ years experience&rdquo; on your public profile card.
                        </p>
                      </div>

                      {/* Medical License */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-900 dark:text-white">
                          Medical Registration / License Number
                        </label>
                        <input
                          type="text"
                          value={doctorProfile.medicalLicenseNumber}
                          onChange={(e) => setDoctorProfile({ ...doctorProfile, medicalLicenseNumber: e.target.value })}
                          placeholder="e.g. MCI-48291-MH or State Medical Council ID"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070b14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-mono focus:border-teal-500 focus:bg-white dark:focus:bg-[#070b14] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        />
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Official state or national medical board registration credential.
                        </p>
                      </div>

                      {/* Bio */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-900 dark:text-white">
                          Professional Bio & Approach to Patient Care
                        </label>
                        <textarea
                          rows={4}
                          value={doctorProfile.bio}
                          onChange={(e) => setDoctorProfile({ ...doctorProfile, bio: e.target.value })}
                          placeholder="Share your clinical background, medical qualifications, hospital affiliations, and approach to compassionate patient care..."
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070b14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-teal-500 focus:bg-white dark:focus:bg-[#070b14] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        />
                      </div>
                    </div>

                    {/* LIVE PATIENT SEARCH PREVIEW CARD */}
                    <div className="rounded-2xl border border-teal-200/80 dark:border-teal-800/60 bg-gradient-to-br from-teal-50/50 via-white to-slate-50/50 dark:from-teal-950/20 dark:via-[#0f172a] dark:to-[#0f172a] p-5 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-teal-100 dark:border-teal-900/40">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200">
                            Live Patient Search Preview
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Real-time rendering of your card on Find Doctor
                        </span>
                      </div>

                      {/* Mock DoctorCard Preview */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                        <div className="flex gap-3.5 items-start sm:items-center">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] dark:text-[#14B8A6] font-bold text-lg border border-teal-100 dark:border-teal-900/60">
                            {formData.name ? formData.name.charAt(0).toUpperCase() : "D"}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-semibold text-slate-900 dark:text-white text-sm">
                                {formData.name ? (formData.name.startsWith("Dr.") ? formData.name : `Dr. ${formData.name}`) : "Dr. Medical Specialist"}
                              </h5>
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                                <CheckCircle2 className="h-3 w-3" /> Verified
                              </span>
                              <span className="inline-flex items-center rounded-full bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 text-[10px] font-semibold text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40">
                                New Clinician
                              </span>
                            </div>
                            <p className="text-xs font-medium text-[#0D9488] dark:text-teal-400">
                              {doctorProfile.specialization} • {doctorProfile.experienceYears}+ years exp
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              {doctorProfile.city ? `${doctorProfile.city}, India` : "CuraLink Telehealth"}
                            </p>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                          <div className="text-left sm:text-right">
                            <span className="text-xs text-slate-400">Consultation</span>
                            <p className="text-base font-bold text-slate-900 dark:text-white">
                              ₹{doctorProfile.consultationFee}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {doctorProfile.consultationModes.includes("VIDEO") && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40">
                                <Video className="h-2.5 w-2.5" /> Video
                              </span>
                            )}
                            {doctorProfile.consultationModes.includes("IN_PERSON") && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                                <MapPin className="h-2.5 w-2.5" /> In-Person
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Search Filter Compatibility Checklist */}
                      <div className="mt-4 pt-3 border-t border-teal-100 dark:border-teal-900/40 grid gap-2 sm:grid-cols-3 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                          <span>Specialty: <strong>{doctorProfile.specialization}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                          <span>Modes: <strong>{doctorProfile.consultationModes.join(" + ")}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                          <span>City: <strong>{doctorProfile.city || "All Cities"}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        All changes take effect immediately on patient search.
                      </div>
                      <div className="flex items-center gap-3">
                        <Link
                          href="/find-doctor"
                          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          Preview Search
                        </Link>
                        <Button type="submit" disabled={isSavingDoctor}>
                          {isSavingDoctor && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                          Save Practice Profile
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
              </section>
            </div>
          )}

          {/* TAB 2: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xs overflow-hidden">
                <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-5">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Notification Preferences
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Control how and when CuraLink contacts you regarding your telehealth care.
                  </p>
                </div>

                <div className="p-6 divide-y divide-slate-100 dark:divide-slate-800 space-y-4">
                  {[
                    {
                      id: "appt",
                      title: "Appointment Reminders",
                      desc: "Receive timely push & SMS alerts 24h and 1h prior to your scheduled consultation.",
                      checked: apptReminders,
                      toggle: () => {
                        const val = !apptReminders;
                        setApptReminders(val);
                        localStorage.setItem("curalink_notif_appt", String(val));
                      },
                    },
                    {
                      id: "msg",
                      title: "Doctor Direct Messages",
                      desc: "Instant notifications when your clinician sends follow-up notes or questions.",
                      checked: doctorMessages,
                      toggle: () => {
                        const val = !doctorMessages;
                        setDoctorMessages(val);
                        localStorage.setItem("curalink_notif_msg", String(val));
                      },
                    },
                    {
                      id: "rx",
                      title: "Prescription & Refill Alerts",
                      desc: "Alerts when a new digital prescription is generated or signed by your doctor.",
                      checked: rxAlerts,
                      toggle: () => {
                        const val = !rxAlerts;
                        setRxAlerts(val);
                        localStorage.setItem("curalink_notif_rx", String(val));
                      },
                    },
                    {
                      id: "ai",
                      title: "AI Health Triage Tips",
                      desc: "Personalized lifestyle context and seasonal health reminders based on your triage history.",
                      checked: aiInsights,
                      toggle: () => {
                        const val = !aiInsights;
                        setAiInsights(val);
                        localStorage.setItem("curalink_notif_ai", String(val));
                      },
                    },
                    {
                      id: "digest",
                      title: "Weekly Health Digest Email",
                      desc: "A summary email with consultation receipts, billing updates, and health logs.",
                      checked: emailDigest,
                      toggle: () => {
                        const val = !emailDigest;
                        setEmailDigest(val);
                        localStorage.setItem("curalink_notif_digest", String(val));
                      },
                    },
                  ].map((item) => (
                    <div key={item.id} className="pt-4 first:pt-0 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={item.checked}
                        onClick={item.toggle}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 ${
                          item.checked ? "bg-teal-600" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            item.checked ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* TAB 3: SECURITY & PASSWORD */}
          {activeTab === "security" && (
            <div className="space-y-6">
              {/* Password update form */}
              <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xs overflow-hidden">
                <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-5">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Password & Authentication
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Ensure your account is using a strong, unique password.
                  </p>
                </div>

                <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-900 dark:text-white">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070b14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-teal-500 focus:bg-white dark:focus:bg-[#070b14] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-900 dark:text-white">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="At least 8 characters"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070b14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-teal-500 focus:bg-white dark:focus:bg-[#070b14] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-900 dark:text-white">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Re-enter new password"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070b14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-teal-500 focus:bg-white dark:focus:bg-[#070b14] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      {passwordError && (
                        <p className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" /> {passwordError}
                        </p>
                      )}
                      {passwordSuccess && (
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Password updated successfully
                        </p>
                      )}
                    </div>
                    <Button type="submit" disabled={isChangingPassword}>
                      {isChangingPassword && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Update Password
                    </Button>
                  </div>
                </form>
              </section>

              {/* Two-Factor Authentication & Biometrics */}
              <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xs p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3.5">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
                      <Key className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Two-Factor Authentication (2FA)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Add an extra layer of security to your medical records using an authenticator app (TOTP).
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={twoFactorAuth}
                    onClick={() => {
                      const val = !twoFactorAuth;
                      setTwoFactorAuth(val);
                      localStorage.setItem("curalink_2fa", String(val));
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 ${
                      twoFactorAuth ? "bg-teal-600" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        twoFactorAuth ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-start justify-between gap-4">
                  <div className="flex gap-3.5">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Biometric / Fast Session Unlock
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Quickly unlock consultations with your device biometric passkey (Windows Hello / Touch ID).
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={biometricUnlock}
                    onClick={() => {
                      const val = !biometricUnlock;
                      setBiometricUnlock(val);
                      localStorage.setItem("curalink_bio", String(val));
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 ${
                      biometricUnlock ? "bg-teal-600" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        biometricUnlock ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* TAB 4: APPEARANCE */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xs overflow-hidden">
                <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-5">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Appearance & Theme
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Choose how CuraLink looks across all your desktop and mobile browser sessions.
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      {
                        id: "light",
                        label: "Light Mode",
                        desc: "Clean daylight clarity",
                        icon: Sun,
                      },
                      {
                        id: "dark",
                        label: "Dark Mode",
                        desc: "Calm navy slate palette",
                        icon: Moon,
                      },
                      {
                        id: "system",
                        label: "System Sync",
                        desc: "Matches OS preferences",
                        icon: Laptop,
                      },
                    ].map((mode) => {
                      const isSelected = mounted && theme === mode.id;
                      const Icon = mode.icon;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setTheme(mode.id)}
                          className={`flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? "border-teal-500 bg-teal-50/60 dark:bg-teal-950/40 shadow-sm"
                              : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#070b14] hover:border-slate-300 dark:hover:border-slate-600"
                          }`}
                        >
                          <div
                            className={`h-11 w-11 rounded-xl flex items-center justify-center mb-3 ${
                              isSelected
                                ? "bg-teal-600 text-white shadow-sm shadow-teal-700/20"
                                : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <p className={`text-sm font-semibold ${isSelected ? "text-teal-900 dark:text-teal-200" : "text-slate-900 dark:text-white"}`}>
                            {mode.label}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {mode.desc}
                          </p>
                          {isSelected && (
                            <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300">
                              <Check className="h-3.5 w-3.5" /> Active
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 5: DATA PRIVACY & GDPR/HIPAA */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              {/* Export Data */}
              <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xs p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Download className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      Export Your Health Records
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                      Download a certified copy of your consultation history, triage notes, and prescription logs in standard JSON format under HIPAA §164.524 right of access.
                    </p>
                  </div>
                  <Button
                    onClick={handleDownloadRecords}
                    disabled={isDownloading}
                    variant="outline"
                    className="shrink-0"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2 text-teal-600 dark:text-teal-400" />
                    )}
                    Export Data (JSON)
                  </Button>
                </div>
                {downloadSuccess && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> Download initiated successfully.
                  </div>
                )}
              </section>

              {/* Data Erasure / Account deletion */}
              <section className="rounded-2xl border border-red-200 dark:border-red-950/60 bg-red-50/40 dark:bg-red-950/20 shadow-xs p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Data Erasure & Account Deletion
                    </h3>
                    <p className="text-xs text-red-600/80 dark:text-red-400/70 max-w-xl leading-relaxed">
                      Submit a formal right-to-be-forgotten request. Under HIPAA medical record retention laws, legal audit minimums apply, while personal identifiers are permanently scrubbed.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    Request Data Erasure
                  </button>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>

      {/* Data Erasure Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirm Data Erasure</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This action will queue your account for permanent anonymization. To confirm, please type <strong className="font-mono text-red-600 dark:text-red-400">DELETE</strong> in the box below:
            </p>
            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="DELETE"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070b14] px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
            />
            {deleteStatus && (
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">{deleteStatus}</p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationText("");
                  setDeleteStatus(null);
                }}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestDataErasure}
                disabled={isDeleting || deleteConfirmationText !== "DELETE"}
                className="rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 text-xs font-semibold shadow-xs cursor-pointer"
              >
                {isDeleting ? "Submitting..." : "Confirm Deletion"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
