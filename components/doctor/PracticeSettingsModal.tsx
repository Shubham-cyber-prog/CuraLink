"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Stethoscope,
  MapPin,
  IndianRupee,
  Video,
  Building2,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

interface PracticeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    specialization: string;
    consultationFee: number;
    city?: string | null;
    consultationModes?: string[];
    bio?: string;
    experienceYears?: number;
  };
  onSuccess: () => void;
}

export function PracticeSettingsModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: PracticeSettingsModalProps) {
  const [specialization, setSpecialization] = useState("");
  const [consultationFee, setConsultationFee] = useState("500");
  const [city, setCity] = useState("");
  const [experienceYears, setExperienceYears] = useState("5");
  const [modes, setModes] = useState<string[]>(["VIDEO"]);
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSpecialization(initialData.specialization || "General Medicine & Cardiology");
    setConsultationFee(String(initialData.consultationFee || 500));
    setCity(initialData.city || "Hisar");
    setExperienceYears(String(initialData.experienceYears ?? 8));
    setModes(initialData.consultationModes?.length ? initialData.consultationModes : ["VIDEO", "IN_PERSON"]);
    setBio(initialData.bio || "");
  }, [isOpen, initialData]);

  const toggleMode = (mode: "VIDEO" | "IN_PERSON") => {
    setModes((prev) => {
      if (prev.includes(mode)) {
        if (prev.length === 1) return prev; // Keep at least one mode
        return prev.filter((m) => m !== mode);
      }
      return [...prev, mode];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const feeNum = Number(consultationFee);
    if (!feeNum || feeNum <= 0) {
      setError("Consultation fee must be greater than ₹0.");
      return;
    }

    try {
      setSaving(true);
      const res = await api.patch("/doctor/me/profile", {
        specialization: specialization.trim(),
        consultationFee: feeNum,
        city: city.trim() || null,
        experienceYears: Number(experienceYears) || 0,
        consultationModes: modes,
        bio: bio.trim() || null,
      });

      if (res?.success) {
        onSuccess();
        onClose();
      } else {
        setError(res?.message || "Failed to update practice settings.");
      }
    } catch (err: any) {
      setError(err?.message || "Unable to save practice settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0B1F33]/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1F33] shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#006D77] dark:text-[#83C5BE] flex items-center justify-center">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0B1F33] dark:text-white">
                    Practice Profile & Fees
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Changes reflect immediately on Find Doctor & booking slots.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Primary Specialization
                  </label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#112a44] px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006D77]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Clinic City / Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Hisar, New Delhi"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#112a44] pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006D77]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Consultation Fee (INR)
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="number"
                      min={100}
                      max={10000}
                      step={50}
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#112a44] pl-8 pr-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006D77]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Clinical Experience (Years)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#112a44] px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006D77]"
                  />
                </div>
              </div>

              {/* Consultation Modes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                  Active Consultation Modes
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => toggleMode("VIDEO")}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                      modes.includes("VIDEO")
                        ? "border-[#006D77] bg-teal-50 dark:bg-teal-950/60 text-[#006D77] dark:text-[#83C5BE]"
                        : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Video className="h-4 w-4" />
                    HD Video Telehealth
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleMode("IN_PERSON")}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                      modes.includes("IN_PERSON")
                        ? "border-[#006D77] bg-teal-50 dark:bg-teal-950/60 text-[#006D77] dark:text-[#83C5BE]"
                        : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    In-Person Clinic
                  </button>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Clinical Bio & Expertise
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Briefly describe your clinical background, hospital affiliations, and areas of expertise..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#112a44] px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006D77]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#006D77] to-[#0D9488] hover:brightness-110 px-5 py-2 text-xs font-bold text-white shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
