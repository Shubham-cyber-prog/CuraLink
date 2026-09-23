"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle2,
  User,
  ShieldCheck,
  Video,
  MapPin,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Doctor } from "@/types/doctor";
import { api } from "@/lib/api";

export default function BookAppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const queryDate = searchParams.get("date");
  const queryTime = searchParams.get("time");

  const [step, setStep] = useState<1 | 2 | 3>(queryDate && queryTime ? 3 : 1);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoadingDoctor, setIsLoadingDoctor] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Booking selections
  const [consultationMode, setConsultationMode] = useState<"video" | "in-person">("video");
  const [selectedDate, setSelectedDate] = useState<string>(queryDate || "");
  const [selectedTime, setSelectedTime] = useState<string>(queryTime || "");
  const [patientNote, setPatientNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me");
        if (!res.success) throw new Error("Not auth");
        if (mounted) setIsAuthenticated(true);
      } catch (err) {
        if (mounted) router.push(`/login?redirect=/doctors/${id}/book`);
      }
    };

    const fetchDoctor = async () => {
      try {
        setIsLoadingDoctor(true);
        const data = await api.get(`/doctors/${id}`);
        if (mounted && data.success && data.data) {
          setDoctor(data.data);
          // Pre-select first available slot if not already in URL
          if (!queryDate && data.data.availabilitySlots?.[0]) {
            const firstSlot = data.data.availabilitySlots[0];
            setSelectedDate(firstSlot.date);
            const firstTimes = firstSlot.slots || firstSlot.times || [];
            if (firstTimes[0]) {
              setSelectedTime(firstTimes[0]);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching doctor:", err);
      } finally {
        if (mounted) setIsLoadingDoctor(false);
      }
    };

    checkAuth();
    fetchDoctor();

    return () => {
      mounted = false;
    };
  }, [id, queryDate, queryTime, router]);

  const handleConfirm = async () => {
    if (!doctor || !selectedDate || !selectedTime) {
      setError("Please select both a date and time slot for your appointment.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const data = await api.post("/appointments/book", {
        doctorId: doctor.id,
        date: selectedDate,
        time: selectedTime,
        note: patientNote.trim() || undefined,
        type: consultationMode === "video" ? "VIDEO" : "IN_PERSON",
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to book appointment");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Unable to confirm appointment. Please try another slot or check connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingDoctor || isAuthenticated === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 space-y-6">
        <Skeleton className="h-6 w-32 rounded-lg" />
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">Doctor not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/find-doctor">Back to directory</Link>
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center px-4">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
          <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Appointment Scheduled
        </h2>
        <p className="max-w-md mx-auto text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          Your consultation with <span className="font-semibold text-slate-900 dark:text-white">{doctor.name}</span> is confirmed for{" "}
          <span className="font-semibold text-[#0D9488]">{selectedDate}</span> at{" "}
          <span className="font-semibold text-[#0D9488]">{selectedTime}</span> ({consultationMode === "video" ? "Video Call" : "In-Person"}).
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" className="bg-[#0D9488] hover:bg-[#0F766E] text-white">
            <Link href="/appointments">View in My Visits</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back Link */}
      <Link
        href={`/doctors/${id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Doctor Profile
      </Link>

      {/* Step Indicator Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Schedule Consultation
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Confirm your visit with {doctor.name} ({doctor.specialty})
            </p>
          </div>
          <Badge variant="verified">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Direct Clinical Booking</span>
          </Badge>
        </div>

        {/* 3 Steps indicator */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { num: 1, title: "1. Mode & Doctor" },
            { num: 2, title: "2. Slot Selection" },
            { num: 3, title: "3. Confirm Details" },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => {
                if (s.num === 1 || (s.num === 2 && doctor) || (s.num === 3 && selectedDate && selectedTime)) {
                  setStep(s.num as any);
                }
              }}
              className={`text-left p-2 rounded-lg border text-xs font-semibold transition-colors ${
                step === s.num
                  ? "border-[#0D9488] bg-teal-50/60 dark:bg-teal-950/40 text-[#0D9488] dark:text-[#14B8A6]"
                  : step > s.num
                  ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300"
                  : "border-slate-200 dark:border-slate-800 text-slate-400"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Doctor Summary Card */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] dark:text-[#14B8A6] font-bold text-lg border border-teal-100 dark:border-teal-900/60 overflow-hidden">
                {doctor.photoUrl ? (
                  <Image src={doctor.photoUrl} alt={doctor.name} width={56} height={56} className="h-full w-full object-cover" />
                ) : (
                  <span>{doctor.name.replace("Dr. ", "").charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white text-base truncate">
                  {doctor.name}
                </h3>
                <p className="text-xs font-medium text-[#0D9488] dark:text-[#14B8A6]">
                  {doctor.specialty} · {doctor.experience}
                </p>
                {doctor.consultationFee && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Standard Fee: ₹{doctor.consultationFee}
                  </p>
                )}
              </div>
            </div>

            {/* Consultation Mode Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Choose Consultation Mode
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setConsultationMode("video")}
                  className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                    consultationMode === "video"
                      ? "border-[#0D9488] bg-teal-50/50 dark:bg-teal-950/40 ring-1 ring-[#0D9488]"
                      : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-950/60 text-[#0D9488] dark:text-[#14B8A6]">
                    <Video className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Telehealth Video Call
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Encrypted browser consultation with direct e-prescription.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setConsultationMode("in-person")}
                  className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                    consultationMode === "in-person"
                      ? "border-[#0D9488] bg-teal-50/50 dark:bg-teal-950/40 ring-1 ring-[#0D9488]"
                      : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      In-Person Clinic Visit
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Consultation at practitioner&apos;s verified hospital or clinic address.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setStep(2)}
                className="bg-[#0D9488] hover:bg-[#0F766E] text-white"
              >
                <span>Continue to Slots</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Slot picker using real doctor availability */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#0D9488]" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Available Dates & Timings
                </h3>
              </div>

              {doctor.availabilitySlots && doctor.availabilitySlots.length > 0 ? (
                <div className="space-y-4">
                  {/* Date chips */}
                  <div className="flex flex-wrap gap-2">
                    {doctor.availabilitySlots.map((slot) => {
                      const isSelected = selectedDate === slot.date;
                      return (
                        <button
                          key={slot.date}
                          type="button"
                          onClick={() => {
                            setSelectedDate(slot.date);
                            const availableTimes = slot.slots || slot.times || [];
                            if (availableTimes[0]) setSelectedTime(availableTimes[0]);
                          }}
                          className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer border ${
                            isSelected
                              ? "border-[#0D9488] bg-[#0D9488] text-white shadow-2xs"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          {slot.date}
                        </button>
                      );
                    })}
                  </div>

                  {/* Times for selected date */}
                  <div className="pt-2">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Available Consultation Windows:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(() => {
                        const activeSlot = doctor.availabilitySlots.find((s) => s.date === selectedDate);
                        const timesList: string[] = activeSlot ? (activeSlot.slots || activeSlot.times || []) : [];
                        return timesList.map((t: string) => {
                          const isSelected = selectedTime === t;
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setSelectedTime(t)}
                              className={`rounded-xl py-2 px-3 text-xs font-medium transition-colors cursor-pointer border text-center ${
                                isSelected
                                  ? "border-[#0D9488] bg-teal-50 dark:bg-teal-950/50 text-[#0D9488] dark:text-[#14B8A6] font-semibold"
                                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                              }`}
                            >
                              <Clock className="h-3 w-3 inline mr-1 text-slate-400" />
                              {t}
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    No custom schedule published. Select preferred immediate booking slot:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {["Today", "Tomorrow"].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedDate(d)}
                        className={`rounded-xl p-2.5 text-xs font-semibold border ${
                          selectedDate === d
                            ? "border-[#0D9488] bg-teal-50 text-[#0D9488]"
                            : "border-slate-200"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["10:00 AM", "02:30 PM", "05:00 PM"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTime(t)}
                        className={`rounded-xl p-2 text-xs font-semibold border ${
                          selectedTime === t
                            ? "border-[#0D9488] bg-teal-50 text-[#0D9488]"
                            : "border-slate-200"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <Button
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep(3)}
                className="bg-[#0D9488] hover:bg-[#0F766E] text-white"
              >
                <span>Review & Confirm</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Consultation Summary Breakdown */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Consultation Summary
              </h3>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3">
                  <span className="text-slate-500 dark:text-slate-400 block mb-1">Doctor</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{doctor.name}</span>
                  <span className="block text-slate-500">{doctor.specialty}</span>
                </div>

                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3">
                  <span className="text-slate-500 dark:text-slate-400 block mb-1">Schedule & Mode</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedDate} at {selectedTime}
                  </span>
                  <span className="block text-slate-500">
                    {consultationMode === "video" ? "Video Telehealth Call" : "In-Person Clinic Visit"}
                  </span>
                </div>
              </div>

              {/* Optional Health Note */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  <span>Reason for Consultation / Symptoms (Optional)</span>
                </label>
                <textarea
                  value={patientNote}
                  onChange={(e) => setPatientNote(e.target.value)}
                  placeholder="e.g. Cough and throat irritation for 3 days, no fever."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                />
              </div>

              {/* Terms & Privacy Note */}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                By confirming, you schedule this appointment directly into the clinician&apos;s calendar. You will receive an email confirmation and can access the room from your dashboard.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)} disabled={isSubmitting}>
                <ChevronLeft className="h-4 w-4" />
                <span>Adjust Slot</span>
              </Button>

              <Button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="bg-[#0D9488] hover:bg-[#0F766E] text-white px-6 font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    <span>Booking...</span>
                  </>
                ) : (
                  <span>Confirm Appointment</span>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
