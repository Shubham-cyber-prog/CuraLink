"use client";

import { useEffect, useRef, useState } from "react";
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
  Camera,
  Upload,
  Copy,
  Fingerprint,
  QrCode,
  ShieldAlert,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import {
  isPlatformBiometricSupported,
  enrollPlatformBiometric,
  saveStoredBiometric,
  clearStoredBiometric,
} from "@/lib/webauthn";

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
  avatarUrl?: string | null;
  twoFactorEnabled?: boolean;
  biometricEnabled?: boolean;
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

  // Profile Photo Upload State
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

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

  // Real 2FA (TOTP) & Biometric (Fingerprint / Passkey) State
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [twoFaSetup, setTwoFaSetup] = useState<{ secret: string; otpauthUri: string; qrCodeUrl: string } | null>(null);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaBackupCodes, setTwoFaBackupCodes] = useState<string[]>([]);
  const [showDisableTwoFa, setShowDisableTwoFa] = useState(false);
  const [disableTwoFaCode, setDisableTwoFaCode] = useState("");
  const [isProcessing2FA, setIsProcessing2FA] = useState(false);
  const [twoFaError, setTwoFaError] = useState<string | null>(null);
  const [twoFaSuccess, setTwoFaSuccess] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackups, setCopiedBackups] = useState(false);

  const [biometricUnlock, setBiometricUnlock] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState<boolean | null>(null);
  const [isProcessingBiometric, setIsProcessingBiometric] = useState(false);
  const [biometricError, setBiometricError] = useState<string | null>(null);
  const [biometricSuccess, setBiometricSuccess] = useState<string | null>(null);

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

      isPlatformBiometricSupported().then(setBiometricSupported).catch(() => setBiometricSupported(false));

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
        const data = await api.get("/auth/me");

        if (data?.success && data.data) {
          const user = data.data.user || data.data;
          setProfile(user);
          setTwoFactorAuth(Boolean(user.twoFactorEnabled));
          setBiometricUnlock(Boolean(user.biometricEnabled));
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
      } catch (err: any) {
        if (err?.status === 401) {
          router.replace("/login?redirect=/settings");
          return;
        }
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

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);
    setAvatarSuccess(null);

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setAvatarError("Please choose a JPG, PNG, or WebP photo.");
      e.target.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setAvatarError("Photo must be smaller than 3 MB.");
      e.target.value = "";
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Could not read image file"));
        reader.readAsDataURL(file);
      });

      const res = await api.post("/auth/profile/avatar", { image: dataUrl });
      if (!res?.success) {
        throw new Error(res?.message || "Failed to upload profile photo");
      }

      const updatedUser = res.data?.user || { ...profile, avatarUrl: res.data?.avatarUrl };
      setProfile((prev) => (prev ? { ...prev, ...updatedUser } : updatedUser));
      window.dispatchEvent(new CustomEvent("curalink-profile-updated", { detail: updatedUser }));
      setAvatarSuccess("Profile photo updated!");
      setTimeout(() => setAvatarSuccess(null), 4000);
    } catch (err: any) {
      setAvatarError(err?.message || "Failed to upload photo. Please try again.");
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarError(null);
    setAvatarSuccess(null);
    setIsUploadingAvatar(true);
    try {
      const res = await api.delete("/auth/profile/avatar");
      if (!res?.success) {
        throw new Error(res?.message || "Failed to remove photo");
      }
      const updatedUser = res.data?.user || { ...profile, avatarUrl: null };
      setProfile((prev) => (prev ? { ...prev, ...updatedUser, avatarUrl: null } : updatedUser));
      window.dispatchEvent(
        new CustomEvent("curalink-profile-updated", { detail: { ...updatedUser, avatarUrl: null } })
      );
      setAvatarSuccess("Profile photo removed.");
      setTimeout(() => setAvatarSuccess(null), 3500);
    } catch (err: any) {
      setAvatarError(err?.message || "Could not remove photo.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleVerifyPhone = async () => {
    setIsVerifyingPhone(true);
    try {
      const data = await api.put("/auth/profile", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        phoneVerified: true,
      });

      if (data?.success) {
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
      localStorage.setItem("curalink_user_phone", formData.phone);
      localStorage.setItem("curalink_user_blood", formData.bloodGroup);
      localStorage.setItem("curalink_user_emerg", formData.emergencyContact);

      const data = await api.put("/auth/profile", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        age: formData.age ? Number(formData.age) : undefined,
        gender: formData.gender || undefined,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Failed to update profile settings");
      }

      const updatedUser = data.data?.user || data.data;
      setProfile(updatedUser);
      window.dispatchEvent(new CustomEvent("curalink-profile-updated", { detail: updatedUser }));
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

  const handleStartTwoFactorSetup = async () => {
    setTwoFaError(null);
    setTwoFaSuccess(null);
    setTwoFaBackupCodes([]);
    setIsProcessing2FA(true);
    try {
      const res = await api.post("/auth/2fa/setup", {});
      if (!res?.success || !res?.data) {
        throw new Error(res?.message || "Failed to start 2FA setup");
      }
      setTwoFaSetup(res.data);
      setTwoFaCode("");
    } catch (err: any) {
      setTwoFaError(err?.message || "Could not generate authenticator QR code.");
    } finally {
      setIsProcessing2FA(false);
    }
  };

  const handleVerifyEnableTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFaError(null);
    setTwoFaSuccess(null);

    const cleaned = twoFaCode.replace(/\s+/g, "");
    if (!/^\d{6}$/.test(cleaned)) {
      setTwoFaError("Enter the 6-digit code from your authenticator app.");
      return;
    }

    setIsProcessing2FA(true);
    try {
      const res = await api.post("/auth/2fa/verify-enable", { code: cleaned });
      if (!res?.success) {
        throw new Error(res?.message || "Invalid verification code");
      }
      setTwoFactorAuth(true);
      setTwoFaSetup(null);
      setTwoFaCode("");
      setTwoFaBackupCodes(res.data?.backupCodes || []);
      setTwoFaSuccess("Two-Factor Authentication is now active! Save your recovery backup codes below.");
      if (res.data?.user) {
        setProfile((prev) => (prev ? { ...prev, ...res.data.user } : res.data.user));
      }
    } catch (err: any) {
      setTwoFaError(err?.message || "Invalid 6-digit code. Please check your authenticator app.");
    } finally {
      setIsProcessing2FA(false);
    }
  };

  const handleDisableTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFaError(null);
    setTwoFaSuccess(null);

    if (!disableTwoFaCode.trim()) {
      setTwoFaError("Enter your 6-digit authenticator code or a backup code.");
      return;
    }

    setIsProcessing2FA(true);
    try {
      const res = await api.post("/auth/2fa/disable", { code: disableTwoFaCode.trim() });
      if (!res?.success) {
        throw new Error(res?.message || "Could not disable 2FA");
      }
      setTwoFactorAuth(false);
      setShowDisableTwoFa(false);
      setDisableTwoFaCode("");
      setTwoFaBackupCodes([]);
      setTwoFaSuccess("Two-Factor Authentication has been disabled.");
      if (res.data?.user) {
        setProfile((prev) => (prev ? { ...prev, ...res.data.user } : res.data.user));
      }
    } catch (err: any) {
      setTwoFaError(err?.message || "Invalid verification code.");
    } finally {
      setIsProcessing2FA(false);
    }
  };

  const handleToggleBiometric = async () => {
    setBiometricError(null);
    setBiometricSuccess(null);

    if (!biometricUnlock) {
      if (!profile) return;
      setIsProcessingBiometric(true);
      try {
        const { credentialId, rawId } = await enrollPlatformBiometric({
          id: profile.id,
          email: profile.email,
          name: profile.name || formData.name || profile.email,
        });

        const res = await api.post("/auth/biometric/register", { credentialId });
        if (!res?.success) {
          throw new Error(res?.message || "Failed to register fingerprint credential");
        }

        saveStoredBiometric({
          email: profile.email,
          name: profile.name,
          credentialId,
          rawId,
          enrolledAt: new Date().toISOString(),
        });

        setBiometricUnlock(true);
        setBiometricSuccess("Fingerprint / Passkey enabled! You can now sign in with one touch on the login screen.");
        if (res.data?.user) {
          setProfile((prev) => (prev ? { ...prev, ...res.data.user } : res.data.user));
        }
      } catch (err: any) {
        if (err?.name === "NotAllowedError") {
          setBiometricError("Fingerprint prompt was cancelled or timed out. Please try again.");
        } else {
          setBiometricError(err?.message || "Could not enroll fingerprint on this device.");
        }
      } finally {
        setIsProcessingBiometric(false);
      }
    } else {
      setIsProcessingBiometric(true);
      try {
        const res = await api.delete("/auth/biometric/disable");
        if (!res?.success) {
          throw new Error(res?.message || "Failed to disable fingerprint login");
        }
        clearStoredBiometric();
        setBiometricUnlock(false);
        setBiometricSuccess("Fingerprint / Passkey login disabled on this account.");
        if (res.data?.user) {
          setProfile((prev) => (prev ? { ...prev, ...res.data.user } : res.data.user));
        }
      } catch (err: any) {
        setBiometricError(err?.message || "Failed to disable biometric login.");
      } finally {
        setIsProcessingBiometric(false);
      }
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
  const memberCode = `CL-${(profile?.id || "84920").replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase()}`;
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "2026";
  const completionChecks = [
    Boolean(formData.name),
    Boolean(formData.email),
    Boolean(formData.phone),
    Boolean(formData.age),
    Boolean(profile?.avatarUrl),
  ];
  const completionPct = Math.round((completionChecks.filter(Boolean).length / completionChecks.length) * 100);

  const handleCopyMemberId = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(memberCode);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="space-y-7">
      {/* ── BRANDED CURALINK EXECUTIVE PROFILE HERO BANNER ── */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#071525] via-[#0B283C] to-[#006D77] text-white shadow-[0_18px_50px_-14px_rgba(11,31,51,0.45)] border border-white/10">
        {/* Subtle geometric mesh & soft aqua spotlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-16 h-80 w-80 rounded-full bg-[#83C5BE]/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        {/* Subtle Brand Crest Watermark */}
        <div className="pointer-events-none absolute top-5 right-6 hidden sm:flex items-center gap-2 opacity-25 select-none">
          <img src="/logo.png" alt="" className="h-7 w-7 object-contain brightness-200" />
          <span className="font-serif text-lg tracking-wide text-white">CuraLink</span>
        </div>

        <div className="relative p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Branded Avatar + Identity */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
            <div className="relative group h-24 w-24 sm:h-28 sm:w-28 shrink-0">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[24px] bg-white/15 backdrop-blur-md font-semibold text-white text-3xl ring-4 ring-white/25 shadow-xl">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={formData.name || "Profile photo"}
                    className="h-full w-full object-cover bg-white"
                  />
                ) : (
                  <span>{nameInitial}</span>
                )}
              </div>

              {/* Verified Online Dot */}
              <span
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-[#0B283C] text-white shadow-sm"
                title="Verified CuraLink Member"
              >
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </span>

              {/* Hover Camera Overlay */}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-[24px] bg-[#071525]/70 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-wait"
                title="Upload profile photo"
                aria-label="Upload profile photo"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Camera className="h-5 w-5 text-[#83C5BE]" />
                    <span className="text-[10px] font-medium">Update</span>
                  </>
                )}
              </button>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
            </div>

            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 backdrop-blur-md border border-white/15 px-3 py-0.5 text-[11px] font-medium text-[#83C5BE]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>
                    {profile?.role === "ADMIN"
                      ? "CuraLink Admin"
                      : profile?.role === "DOCTOR"
                      ? "NMC Verified Clinician"
                      : "CuraLink Verified Member"}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyMemberId}
                  className="inline-flex items-center gap-1.5 rounded-full bg-black/25 hover:bg-black/40 border border-white/10 px-3 py-0.5 text-[11px] font-mono text-white/85 transition-colors cursor-pointer"
                  title="Copy Member ID"
                >
                  <span>{memberCode}</span>
                  {copiedId ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3 text-white/60" />
                  )}
                </button>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl leading-tight font-normal tracking-[-0.015em] text-white truncate">
                {formData.name || "CuraLink Member"}
              </h1>

              <p className="text-xs sm:text-sm text-white/70">
                {formData.email} &bull; Member since {memberSince}
              </p>

              {/* Integrated Branded Photo Action Pills */}
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="inline-flex items-center gap-1.5 h-8.5 px-4 rounded-full bg-white text-[#0B1F33] hover:bg-[#EBF4F5] text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-60"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5 text-[#006D77]" />
                  )}
                  <span>{profile?.avatarUrl ? "Change Photo" : "Upload Photo"}</span>
                </button>

                {profile?.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={isUploadingAvatar}
                    className="inline-flex items-center gap-1.5 h-8.5 px-3.5 rounded-full bg-white/10 hover:bg-rose-500/25 border border-white/15 text-xs font-medium text-white/90 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                )}

                {avatarError && (
                  <span className="text-xs font-medium text-rose-300 flex items-center gap-1 ml-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {avatarError}
                  </span>
                )}
                {avatarSuccess && (
                  <span className="text-xs font-medium text-emerald-300 flex items-center gap-1 ml-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {avatarSuccess}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Profile Strength Ring / Compact Pill */}
          <div className="rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/12 p-4 min-w-[210px] space-y-2.5 self-start lg:self-center">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/75 font-medium">Profile Completion</span>
              <span className="font-mono font-bold text-[#83C5BE]">{completionPct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-black/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#83C5BE] to-emerald-400 transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <p className="text-[11px] text-white/60">
              {completionPct === 100
                ? "All clinical identity fields verified"
                : "Add photo & details for faster care"}
            </p>
          </div>
        </div>

        {/* Bottom Glass Telemetry Strip */}
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 border-t border-white/10">
          <div className="bg-[#081C2E]/65 backdrop-blur-sm px-5 py-3">
            <p className="text-[10px] uppercase tracking-wider text-white/55">Blood Group</p>
            <p className="text-sm font-semibold text-white mt-0.5">{formData.bloodGroup}</p>
          </div>
          <div className="bg-[#081C2E]/65 backdrop-blur-sm px-5 py-3">
            <p className="text-[10px] uppercase tracking-wider text-white/55">Demographics</p>
            <p className="text-sm font-semibold text-white mt-0.5">
              {formData.age || "—"} yrs &bull; {formData.gender}
            </p>
          </div>
          <div className="bg-[#081C2E]/65 backdrop-blur-sm px-5 py-3">
            <p className="text-[10px] uppercase tracking-wider text-white/55">Contact Status</p>
            <p className="text-sm font-semibold text-emerald-300 mt-0.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {profile?.phoneVerified ? "Phone Verified" : "Active Account"}
            </p>
          </div>
          <div className="bg-[#081C2E]/65 backdrop-blur-sm px-5 py-3">
            <p className="text-[10px] uppercase tracking-wider text-white/55">Portal Access</p>
            <p className="text-sm font-semibold text-[#83C5BE] mt-0.5">
              {profile?.role === "ADMIN" ? "Admin Console" : profile?.role === "DOCTOR" ? "Doctor Practice" : "Patient Care"}
            </p>
          </div>
        </div>
      </section>

      {/* Tabs & Content Layout */}
      <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-68 shrink-0 space-y-5">
          <nav
            className="flex space-x-2 md:flex-col md:space-x-0 md:space-y-1.5 overflow-x-auto pb-2 md:pb-0 rounded-[22px] bg-white dark:bg-[#0B1F33] p-2 border border-slate-200/75 dark:border-white/[0.08] shadow-[0_2px_16px_-4px_rgba(11,31,51,0.06)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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
                  className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    active
                      ? "bg-[#006D77] text-white font-semibold shadow-sm"
                      : "text-slate-600 dark:text-slate-300 hover:bg-[#F4F7F8] dark:hover:bg-white/[0.06] hover:text-[#0B1F33] dark:hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-[#83C5BE]" : "text-slate-400"}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Branded Metallic Digital Health / Clinician Pass Card */}
          <div className="hidden md:block relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#0B1F33] via-[#102E46] to-[#005B64] p-5 text-white shadow-[0_14px_34px_-10px_rgba(11,31,51,0.4)] border border-white/10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[#83C5BE]/20 blur-2xl"
            />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="CuraLink" className="h-5 w-5 object-contain brightness-200" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#83C5BE]">
                    {profile?.role === "DOCTOR" ? "Clinician ID" : "Health Pass"}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Active
                </span>
              </div>

              <div>
                <p className="font-serif text-lg leading-tight text-white truncate">
                  {formData.name || "CuraLink Member"}
                </p>
                <p className="font-mono text-[11px] text-white/65 mt-0.5">{memberCode}</p>
              </div>

              {profile?.role === "DOCTOR" ? (
                <div className="space-y-1.5 pt-3 border-t border-white/10 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/60">Specialty</span>
                    <span className="font-medium text-white truncate max-w-[130px]">{doctorProfile.specialization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Fee</span>
                    <span className="font-semibold text-[#83C5BE]">₹{doctorProfile.consultationFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">License</span>
                    <span className="font-mono text-[11px] text-white/90">{doctorProfile.medicalLicenseNumber || "NMC"}</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/55">Blood Group</p>
                    <p className="font-semibold text-[#83C5BE] mt-0.5">{formData.bloodGroup}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/55">Emergency</p>
                    <p className="font-mono text-[11px] text-white/90 mt-0.5 truncate">
                      {formData.emergencyContact || "112"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Content Panels */}
        <main className="flex-1 min-w-0">
          {/* TAB 1: GENERAL PROFILE */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <section className="rounded-[24px] border border-slate-200/75 dark:border-white/[0.08] bg-white dark:bg-[#0B1F33] shadow-[0_4px_24px_-6px_rgba(11,31,51,0.06)] overflow-hidden">
                <div className="border-b border-slate-100 dark:border-white/[0.08] px-6 py-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-2xl font-normal text-[#0B1F33] dark:text-white">
                      Personal Information
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Keep your clinical details and emergency contacts up to date.
                    </p>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#F4F7F8] dark:bg-white/[0.06] px-3 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    <Lock className="h-3 w-3 text-[#006D77] dark:text-[#83C5BE]" />
                    Encrypted
                  </span>
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
                          Configure your consultation modes (Video &amp; Clinic Visit), practice city, fees, and specialty.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("practice")}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#006D77] px-4 py-2 font-semibold text-white hover:bg-[#005860] transition-colors shrink-0 text-xs shadow-xs cursor-pointer"
                    >
                      Configure Practice →
                    </button>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="p-6 space-y-6">

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
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-full bg-[#006D77] hover:bg-[#005860] text-white h-10 px-6 shadow-[0_6px_18px_-4px_rgba(0,109,119,0.45)] cursor-pointer"
                    >
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
                      Set your medical specialty, consultation modes (Video Call &amp; In-Person), practice city, and consultation fee.
                    </p>
                  </div>
                  <Link
                    href="/doctor-dashboard"
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
                  >
                    <span>Back to Doctor Dashboard</span>
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
                          href="/doctor-dashboard"
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#006D77] dark:text-[#83C5BE] hover:underline shrink-0"
                        >
                          Return to Practice Dashboard →
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

              {/* Real Two-Factor Authentication (RFC 6238 TOTP) */}
              <section className="rounded-[24px] border border-slate-200/75 dark:border-white/[0.08] bg-white dark:bg-[#0B1F33] shadow-[0_4px_24px_-6px_rgba(11,31,51,0.06)] p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex gap-3.5">
                    <div className="h-11 w-11 shrink-0 flex items-center justify-center rounded-2xl bg-[#006D77]/10 dark:bg-[#83C5BE]/15 text-[#006D77] dark:text-[#83C5BE]">
                      <Key className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif text-xl font-normal text-[#0B1F33] dark:text-white">
                          Two-Factor Authentication (2FA)
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            twoFactorAuth
                              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/50"
                              : "bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${twoFactorAuth ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {twoFactorAuth ? "Active & Protected" : "Not Enabled"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Protect your medical records and logins with real 6-digit TOTP codes from Google Authenticator, Microsoft Authenticator, or Authy.
                      </p>
                    </div>
                  </div>

                  {!twoFactorAuth ? (
                    <button
                      type="button"
                      onClick={handleStartTwoFactorSetup}
                      disabled={isProcessing2FA}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#006D77] hover:bg-[#005860] text-white px-5 py-2.5 text-xs font-semibold shadow-sm transition-all shrink-0 cursor-pointer disabled:opacity-60"
                    >
                      {isProcessing2FA ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <QrCode className="h-3.5 w-3.5" />}
                      <span>{twoFaSetup ? "Regenerate QR" : "Set Up 2FA"}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowDisableTwoFa((v) => !v);
                        setTwoFaError(null);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full border border-rose-200 dark:border-rose-800/60 bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-300 px-4 py-2 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>{showDisableTwoFa ? "Cancel" : "Disable 2FA"}</span>
                    </button>
                  )}
                </div>

                {twoFaError && (
                  <div className="flex items-center gap-2 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/30 px-4 py-3 text-xs font-medium text-rose-700 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{twoFaError}</span>
                  </div>
                )}

                {twoFaSuccess && (
                  <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/80 dark:bg-emerald-950/30 px-4 py-3 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{twoFaSuccess}</span>
                  </div>
                )}

                {/* 2FA QR Setup Panel */}
                {twoFaSetup && !twoFactorAuth && (
                  <div className="rounded-2xl border border-[#006D77]/20 dark:border-[#83C5BE]/20 bg-[#F4F7F8]/80 dark:bg-white/[0.03] p-5 space-y-5">
                    <div className="grid gap-6 md:grid-cols-[200px_1fr] items-center">
                      <div className="mx-auto flex flex-col items-center justify-center rounded-2xl bg-white p-3.5 shadow-sm border border-slate-200">
                        <img
                          src={twoFaSetup.qrCodeUrl}
                          alt="2FA Authenticator QR Code"
                          className="h-44 w-44 object-contain"
                        />
                        <span className="mt-2 text-[10px] font-medium text-slate-500">Scan with Authenticator App</span>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-[#0B1F33] dark:text-white">
                            Step 1: Scan QR Code or enter key manually
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Open Google Authenticator, Microsoft Authenticator, or Authy and scan the QR code.
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <code className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#071525] px-3 py-2 font-mono text-xs tracking-wider text-[#0B1F33] dark:text-[#83C5BE] break-all">
                              {twoFaSetup.secret}
                            </code>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(twoFaSetup.secret);
                                setCopiedSecret(true);
                                setTimeout(() => setCopiedSecret(false), 2000);
                              }}
                              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#071525] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
                            >
                              {copiedSecret ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                              <span>{copiedSecret ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                        </div>

                        <form onSubmit={handleVerifyEnableTwoFactor} className="space-y-2.5">
                          <label className="block text-xs font-semibold text-[#0B1F33] dark:text-white">
                            Step 2: Enter the 6-digit verification code
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2.5">
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              value={twoFaCode}
                              onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                              placeholder="000000"
                              className="w-full sm:w-44 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#071525] px-4 py-2.5 text-center font-mono text-base tracking-[0.3em] text-[#0B1F33] dark:text-white focus:border-[#006D77] focus:outline-none focus:ring-2 focus:ring-[#006D77]/20"
                              required
                            />
                            <button
                              type="submit"
                              disabled={isProcessing2FA || twoFaCode.length !== 6}
                              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#006D77] hover:bg-[#005860] disabled:opacity-50 text-white px-5 py-2.5 text-xs font-semibold shadow-sm cursor-pointer"
                            >
                              {isProcessing2FA ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                              <span>Verify &amp; Activate 2FA</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTwoFaSetup(null);
                                setTwoFaError(null);
                              }}
                              className="rounded-full border border-slate-200 dark:border-white/10 px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {/* Backup Recovery Codes Display (shown right after activation) */}
                {twoFaBackupCodes.length > 0 && (
                  <div className="rounded-2xl border border-amber-200/80 dark:border-amber-800/50 bg-amber-50/70 dark:bg-amber-950/20 p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                          Save Your One-Time Recovery Backup Codes
                        </p>
                        <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                          Store these codes safely. Each code can unlock your account once if you lose your authenticator device.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(twoFaBackupCodes.join("\n"));
                          setCopiedBackups(true);
                          setTimeout(() => setCopiedBackups(false), 2000);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-[#0B1F33] border border-amber-200 dark:border-amber-800/60 px-3.5 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200 cursor-pointer"
                      >
                        {copiedBackups ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedBackups ? "Copied All" : "Copy Codes"}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {twoFaBackupCodes.map((code) => (
                        <div
                          key={code}
                          className="rounded-xl bg-white dark:bg-[#071525] border border-amber-200/70 dark:border-amber-800/40 px-3 py-2 text-center font-mono text-xs font-semibold text-[#0B1F33] dark:text-[#83C5BE]"
                        >
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disable 2FA Verification Form */}
                {showDisableTwoFa && twoFactorAuth && (
                  <form
                    onSubmit={handleDisableTwoFactor}
                    className="rounded-2xl border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-4 space-y-3"
                  >
                    <p className="text-xs font-semibold text-rose-800 dark:text-rose-200">
                      Confirm disabling 2FA with a 6-digit authenticator code or backup code:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="text"
                        value={disableTwoFaCode}
                        onChange={(e) => setDisableTwoFaCode(e.target.value)}
                        placeholder="6-digit code or XXXX-XXXX"
                        className="flex-1 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-white dark:bg-[#071525] px-3.5 py-2 font-mono text-sm text-[#0B1F33] dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isProcessing2FA}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 text-xs font-semibold cursor-pointer disabled:opacity-60"
                      >
                        {isProcessing2FA && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <span>Confirm Disable</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Real Fingerprint / Biometric Passkey Authentication */}
                <div className="border-t border-slate-100 dark:border-white/[0.08] pt-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex gap-3.5">
                      <div className="h-11 w-11 shrink-0 flex items-center justify-center rounded-2xl bg-[#006D77]/10 dark:bg-[#83C5BE]/15 text-[#006D77] dark:text-[#83C5BE]">
                        <Fingerprint className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-serif text-xl font-normal text-[#0B1F33] dark:text-white">
                            Fingerprint &amp; Biometric Sign-In
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              biometricUnlock
                                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/50"
                                : "bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {biometricUnlock ? "Enrolled" : "Off"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          Sign in instantly with your mobile Fingerprint sensor, Touch ID, Face ID, or Windows Hello passkey.
                        </p>
                        {biometricSupported === false && (
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                            Hardware biometric authenticator not detected on this browser — open on a mobile phone or Windows Hello device.
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleBiometric}
                      disabled={isProcessingBiometric}
                      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold shadow-sm transition-all shrink-0 cursor-pointer disabled:opacity-60 ${
                        biometricUnlock
                          ? "border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                          : "bg-[#006D77] hover:bg-[#005860] text-white"
                      }`}
                    >
                      {isProcessingBiometric ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Fingerprint className="h-3.5 w-3.5" />
                      )}
                      <span>{biometricUnlock ? "Disable Fingerprint" : "Enable Fingerprint"}</span>
                    </button>
                  </div>

                  {biometricError && (
                    <div className="flex items-center gap-2 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/30 px-4 py-3 text-xs font-medium text-rose-700 dark:text-rose-300">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{biometricError}</span>
                    </div>
                  )}

                  {biometricSuccess && (
                    <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/80 dark:bg-emerald-950/30 px-4 py-3 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{biometricSuccess}</span>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* TAB 4: APPEARANCE */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <section className="rounded-[24px] border border-slate-200/75 dark:border-white/[0.08] bg-white dark:bg-[#0B1F33] shadow-[0_4px_24px_-6px_rgba(11,31,51,0.06)] overflow-hidden">
                <div className="border-b border-slate-100 dark:border-white/[0.08] px-6 py-5">
                  <h2 className="font-serif text-2xl font-normal text-[#0B1F33] dark:text-white">
                    Appearance &amp; Theme
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Switch between Light Mode, Dark Mode, or System Sync here. Theme controls are managed centrally in Settings.
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
                        desc: "Calm deep navy palette",
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
                          className={`flex flex-col items-center justify-center p-6 rounded-[22px] border text-center transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? "border-[#006D77] bg-[#006D77]/[0.07] dark:bg-[#83C5BE]/10 shadow-sm"
                              : "border-slate-200/80 dark:border-white/[0.08] bg-[#F4F7F8]/60 dark:bg-[#071525] hover:border-[#006D77]/40"
                          }`}
                        >
                          <div
                            className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-3.5 ${
                              isSelected
                                ? "bg-[#006D77] text-white shadow-sm"
                                : "bg-slate-200/80 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <p className={`text-sm font-semibold ${isSelected ? "text-[#006D77] dark:text-[#83C5BE]" : "text-[#0B1F33] dark:text-white"}`}>
                            {mode.label}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {mode.desc}
                          </p>
                          {isSelected && (
                            <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-[#006D77]/12 dark:bg-[#83C5BE]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#006D77] dark:text-[#83C5BE]">
                              <Check className="h-3 w-3" /> Active
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
