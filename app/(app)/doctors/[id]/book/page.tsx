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
  ShieldCheck,
  Video,
  MapPin,
  AlertCircle,
  Loader2,
  FileText,
  Smartphone,
  CreditCard,
  Building2,
  Lock,
  Printer,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton";
import { Doctor } from "@/types/doctor";
import { api } from "@/lib/api";
import {
  formatDateIST,
  formatDoctorName,
  getDoctorAvatar,
  getTodayIST,
  getTomorrowIST,
} from "@/lib/clinical-formatters";
import { PaymentReceipt } from "@/components/payments/PaymentCheckoutModal";

const UPI_APPS = [
  { label: "Google Pay", suffix: "@okaxis" },
  { label: "PhonePe", suffix: "@ybl" },
  { label: "Paytm", suffix: "@paytm" },
  { label: "BHIM UPI", suffix: "@upi" },
];

const BANKS = [
  "HDFC Bank",
  "ICICI Bank",
  "State Bank of India (SBI)",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
];

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

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "CARD" | "NETBANKING">("UPI");
  const [upiId, setUpiId] = useState("subham@okaxis");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppointmentId, setCreatedAppointmentId] = useState<string | null>(null);
  const [paymentReceipt, setPaymentReceipt] = useState<PaymentReceipt | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me");
        if (!res.success) throw new Error("Not auth");
        if (mounted) setIsAuthenticated(true);
      } catch {
        if (mounted) router.push(`/login?redirect=/doctors/${id}/book`);
      }
    };

    const fetchDoctor = async () => {
      try {
        setIsLoadingDoctor(true);
        const data = await api.get(`/doctors/${id}`);
        if (mounted && data.success && data.data) {
          setDoctor(data.data);
          if (!queryDate && data.data.availabilitySlots?.[0]) {
            const firstSlot = data.data.availabilitySlots[0];
            setSelectedDate(firstSlot.date);
            const firstTimes = firstSlot.slots || firstSlot.times || [];
            if (firstTimes[0]) setSelectedTime(firstTimes[0]);
          } else if (!queryDate) {
            setSelectedDate(getTomorrowIST());
            setSelectedTime("10:30 AM");
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

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handleBookAndPay = async (payNow: boolean) => {
    if (!doctor || !selectedDate || !selectedTime) {
      setError("Please select both a date and time slot for your appointment.");
      return;
    }

    setError(null);

    if (payNow) {
      if (paymentMethod === "UPI" && !/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) {
        setError("Enter a valid UPI ID (e.g., name@okaxis or 9876543210@ybl).");
        return;
      }
      if (paymentMethod === "CARD") {
        if (cardNumber.replace(/\D/g, "").length < 12) {
          setError("Enter a valid 16-digit card number.");
          return;
        }
        if (!cardHolder.trim()) {
          setError("Enter the cardholder name.");
          return;
        }
        if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
          setError("Enter expiry in MM/YY format.");
          return;
        }
        if (cardCvv.replace(/\D/g, "").length < 3) {
          setError("Enter a valid 3-digit CVV.");
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      // 1. Create appointment if not already booked in this session
      let apptId = createdAppointmentId;
      if (!apptId) {
        const bookRes = await api.post("/appointments/book", {
          doctorId: doctor.id,
          date: selectedDate,
          time: selectedTime,
          note: patientNote.trim() || undefined,
          type: consultationMode === "video" ? "VIDEO" : "IN_PERSON",
        });

        if (!bookRes?.success || !bookRes.data?.id) {
          throw new Error(bookRes?.message || "Failed to book appointment.");
        }
        apptId = bookRes.data.id;
        setCreatedAppointmentId(apptId);
      }

      // 2. Process real payment checkout if user chose Pay Now
      if (payNow && apptId) {
        const payPayload: Record<string, any> = {
          appointmentId: apptId,
          method: paymentMethod,
        };
        if (paymentMethod === "UPI") payPayload.upiId = upiId.trim();
        if (paymentMethod === "CARD") payPayload.cardLast4 = cardNumber.replace(/\D/g, "").slice(-4);
        if (paymentMethod === "NETBANKING") payPayload.bankName = selectedBank;

        const payRes = await api.post("/payments/checkout", payPayload);
        if (!payRes?.success || !payRes.data?.receipt) {
          throw new Error(payRes?.message || "Appointment booked, but payment failed. You can retry payment from Appointments.");
        }
        setPaymentReceipt(payRes.data.receipt);
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Unable to complete booking. Please try another slot.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingDoctor || isAuthenticated === null) {
    return (
      <div className="mx-auto max-w-3xl py-8 space-y-6">
        <Skeleton className="h-6 w-36 rounded-full" />
        <Skeleton className="h-12 w-72 rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-[24px]" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">Doctor not found.</p>
        <Link
          href="/find-doctor"
          className="mt-4 inline-flex items-center h-10 px-5 rounded-full border border-slate-200 text-sm font-medium text-slate-700"
        >
          Back to specialists
        </Link>
      </div>
    );
  }

  const docName = formatDoctorName(doctor.name);
  const docAvatar = getDoctorAvatar(docName, doctor.photoUrl);
  const fee = doctor.consultationFee || 500;

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-xl py-10">
        <div className="rounded-[24px] bg-white dark:bg-[#0B1F33] border border-slate-200/80 dark:border-white/[0.1] p-8 shadow-[0_8px_32px_-8px_rgba(11,31,51,0.1)] space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-8 w-8 stroke-[2.2]" />
          </div>

          <div>
            <h2 className="font-serif text-3xl text-[#0B1F33] dark:text-white">
              {paymentReceipt ? "Payment Successful & Confirmed" : "Appointment Requested"}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Your consultation with <strong className="text-[#0B1F33] dark:text-white">{docName}</strong> is scheduled for{" "}
              <strong className="text-[#006D77] dark:text-[#83C5BE]">{formatDateIST(selectedDate)}</strong> at{" "}
              <strong className="text-[#006D77] dark:text-[#83C5BE]">{selectedTime} IST</strong>.
            </p>
          </div>

          {paymentReceipt && (
            <div className="rounded-2xl bg-[#F4F7F8] dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] p-4 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono font-semibold text-[#006D77] dark:text-[#83C5BE]">
                  {paymentReceipt.transactionId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-medium text-[#0B1F33] dark:text-white">
                  {paymentReceipt.method} ({paymentReceipt.methodDetail})
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200/70 dark:border-white/[0.08] text-sm">
                <span className="font-semibold text-[#0B1F33] dark:text-white">Amount Paid</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{paymentReceipt.amount} INR
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {paymentReceipt && createdAppointmentId && (
              <Link
                href={`/consultation/${createdAppointmentId}`}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#006D77] hover:bg-[#005860] text-sm font-medium text-white shadow-sm"
              >
                <Video className="h-4 w-4" />
                <span>Join Video Room</span>
              </Link>
            )}
            <Link
              href="/appointments"
              className="inline-flex items-center h-10 px-5 rounded-full bg-[#0B1F33] hover:bg-[#132E47] dark:bg-white/10 text-sm font-medium text-white"
            >
              View Appointments
            </Link>
            {paymentReceipt && (
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-slate-200 dark:border-white/[0.12] text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print Receipt</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={`/doctors/${id}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#0B1F33] dark:text-slate-400 dark:hover:text-white transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Doctor Profile
      </Link>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-5 border-b border-slate-200/80 dark:border-white/[0.08]">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#006D77] dark:text-[#83C5BE] mb-1">
              Appointment Checkout
            </p>
            <h1 className="font-serif text-3xl text-[#0B1F33] dark:text-white">
              Schedule Consultation
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {docName} &bull; {doctor.specialty}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 dark:border-white/[0.1] bg-white dark:bg-[#0B1F33] px-3.5 py-1.5 text-xs font-semibold text-[#006D77] dark:text-[#83C5BE] self-start sm:self-auto">
            <ShieldCheck className="h-3.5 w-3.5" />
            Fee: ₹{fee}
          </span>
        </div>

        {/* 3 Curved Step Pills */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { num: 1, title: "1. Mode & Doctor" },
            { num: 2, title: "2. Select Slot" },
            { num: 3, title: "3. Payment & Confirm" },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => {
                if (s.num === 1 || (s.num === 2 && doctor) || (s.num === 3 && selectedDate && selectedTime)) {
                  setStep(s.num as 1 | 2 | 3);
                }
              }}
              className={`text-left px-4 py-2.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                step === s.num
                  ? "border-[#006D77] bg-[#006D77] text-white shadow-xs"
                  : step > s.num
                  ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                  : "border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0B1F33] text-slate-400"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 10 }}
            transition={{ duration: 0.18 }}
            className="space-y-6"
          >
            {/* Doctor Card */}
            <div className="rounded-[22px] border border-slate-200/75 dark:border-white/[0.08] bg-white dark:bg-[#0B1F33] p-5 shadow-xs flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100">
                <Image
                  src={docAvatar}
                  alt={docName}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-xl text-[#0B1F33] dark:text-white truncate">{docName}</h3>
                <p className="text-xs font-medium text-[#006D77] dark:text-[#83C5BE]">
                  {doctor.specialty} &bull; {doctor.experience || "8+ yrs"}
                </p>
                <p className="text-xs text-slate-500 mt-1">Consultation Fee: ₹{fee}</p>
              </div>
            </div>

            {/* Consultation Mode */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#0B1F33] dark:text-white">
                Choose Consultation Mode
              </h3>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setConsultationMode("video")}
                  className={`flex items-start gap-3.5 rounded-[20px] border p-5 text-left transition-all cursor-pointer ${
                    consultationMode === "video"
                      ? "border-[#006D77] bg-white dark:bg-[#0B1F33] ring-2 ring-[#006D77]/20 shadow-sm"
                      : "border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0B1F33] hover:border-slate-300"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#006D77]/10 text-[#006D77] dark:text-[#83C5BE]">
                    <Video className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0B1F33] dark:text-white">
                      Video Consultation
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Encrypted browser video call with digital e-prescription.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setConsultationMode("in-person")}
                  className={`flex items-start gap-3.5 rounded-[20px] border p-5 text-left transition-all cursor-pointer ${
                    consultationMode === "in-person"
                      ? "border-[#006D77] bg-white dark:bg-[#0B1F33] ring-2 ring-[#006D77]/20 shadow-sm"
                      : "border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0B1F33] hover:border-slate-300"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0B1F33] dark:text-white">
                      In-Person Clinic Visit
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Visit the doctor&apos;s verified clinic address in person.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 h-10 px-6 rounded-full bg-[#006D77] hover:bg-[#005860] text-sm font-medium text-white shadow-sm cursor-pointer"
              >
                <span>Continue to Slots</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 10 }}
            transition={{ duration: 0.18 }}
            className="space-y-6"
          >
            <div className="rounded-[22px] border border-slate-200/75 dark:border-white/[0.08] bg-white dark:bg-[#0B1F33] p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#006D77] dark:text-[#83C5BE]" />
                <h3 className="text-sm font-semibold text-[#0B1F33] dark:text-white">
                  Select Date &amp; Time (IST)
                </h3>
              </div>

              {doctor.availabilitySlots && doctor.availabilitySlots.length > 0 ? (
                <div className="space-y-4">
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
                          className={`rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer border ${
                            isSelected
                              ? "border-[#006D77] bg-[#006D77] text-white shadow-xs"
                              : "border-slate-200 dark:border-white/[0.1] bg-[#F4F7F8] dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:border-slate-300"
                          }`}
                        >
                          {formatDateIST(slot.date)}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    {(() => {
                      const activeSlot = doctor.availabilitySlots.find((s) => s.date === selectedDate);
                      const timesList: string[] = activeSlot ? activeSlot.slots || activeSlot.times || [] : [];
                      return timesList.map((t: string) => {
                        const isSelected = selectedTime === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSelectedTime(t)}
                            className={`rounded-full py-2.5 px-3 text-xs font-medium transition-all cursor-pointer border text-center ${
                              isSelected
                                ? "border-[#006D77] bg-[#006D77]/10 text-[#006D77] dark:text-[#83C5BE] font-semibold"
                                : "border-slate-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:border-slate-300"
                            }`}
                          >
                            <Clock className="h-3 w-3 inline mr-1 opacity-70" />
                            {t}
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {[getTodayIST(), getTomorrowIST()].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedDate(d)}
                        className={`rounded-full px-4 py-2 text-xs font-semibold border cursor-pointer ${
                          selectedDate === d
                            ? "border-[#006D77] bg-[#006D77] text-white"
                            : "border-slate-200 bg-[#F4F7F8] text-slate-700"
                        }`}
                      >
                        {formatDateIST(d)}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {["10:30 AM", "02:30 PM", "05:00 PM"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTime(t)}
                        className={`rounded-full py-2.5 text-xs font-semibold border cursor-pointer ${
                          selectedTime === t
                            ? "border-[#006D77] bg-[#006D77]/10 text-[#006D77]"
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

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 h-10 px-5 rounded-full border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#0B1F33] text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1.5 h-10 px-6 rounded-full bg-[#006D77] hover:bg-[#005860] text-sm font-medium text-white shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <span>Proceed to Payment</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 10 }}
            transition={{ duration: 0.18 }}
            className="space-y-6"
          >
            {/* Consultation Summary + Notes */}
            <div className="rounded-[24px] border border-slate-200/75 dark:border-white/[0.08] bg-white dark:bg-[#0B1F33] p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3.5">
                <h3 className="font-serif text-xl text-[#0B1F33] dark:text-white">
                  Consultation Summary
                </h3>
                <span className="text-base font-bold text-[#006D77] dark:text-[#83C5BE]">₹{fee} INR</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded-2xl bg-[#F4F7F8] dark:bg-white/[0.04] p-4">
                  <span className="text-slate-500 block mb-1">Specialist</span>
                  <span className="font-semibold text-sm text-[#0B1F33] dark:text-white">{docName}</span>
                  <span className="block text-[#006D77] dark:text-[#83C5BE] mt-0.5">{doctor.specialty}</span>
                </div>

                <div className="rounded-2xl bg-[#F4F7F8] dark:bg-white/[0.04] p-4">
                  <span className="text-slate-500 block mb-1">Schedule &amp; Mode</span>
                  <span className="font-semibold text-sm text-[#0B1F33] dark:text-white">
                    {formatDateIST(selectedDate)} &bull; {selectedTime} IST
                  </span>
                  <span className="block text-slate-500 mt-0.5">
                    {consultationMode === "video" ? "Video Consultation" : "In-Person Clinic Visit"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  <span>Symptoms or Notes for Doctor (Optional)</span>
                </label>
                <textarea
                  value={patientNote}
                  onChange={(e) => setPatientNote(e.target.value)}
                  placeholder="e.g. Dry cough for 3 days, mild fatigue..."
                  rows={2}
                  className="w-full rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-[#F4F7F8] dark:bg-[#071320] p-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#006D77] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Real Payment Method Panel */}
            <div className="rounded-[24px] border border-slate-200/75 dark:border-white/[0.08] bg-white dark:bg-[#0B1F33] p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3.5">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#006D77] dark:text-[#83C5BE]" />
                  <h3 className="font-serif text-xl text-[#0B1F33] dark:text-white">
                    Payment Method
                  </h3>
                </div>
                <span className="text-xs text-slate-500">Instant Slot Confirmation</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { key: "UPI" as const, label: "UPI (GPay / PhonePe)", icon: Smartphone },
                  { key: "CARD" as const, label: "Credit / Debit Card", icon: CreditCard },
                  { key: "NETBANKING" as const, label: "Net Banking", icon: Building2 },
                ].map((m) => {
                  const Icon = m.icon;
                  const active = paymentMethod === m.key;
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(m.key);
                        setError(null);
                      }}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border py-3.5 px-2 text-xs font-medium text-center transition-all cursor-pointer ${
                        active
                          ? "border-[#006D77] bg-[#006D77]/[0.08] text-[#006D77] dark:text-[#83C5BE] font-semibold"
                          : "border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {paymentMethod === "UPI" && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {UPI_APPS.map((app) => (
                      <button
                        key={app.label}
                        type="button"
                        onClick={() => {
                          const base = upiId.split("@")[0] || "subham";
                          setUpiId(`${base}${app.suffix}`);
                        }}
                        className="rounded-full border border-slate-200 dark:border-white/[0.1] bg-[#F4F7F8] dark:bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-[#006D77] hover:text-[#006D77] cursor-pointer"
                      >
                        {app.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="Enter UPI ID (e.g. subham@okaxis)"
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-[#F4F7F8] dark:bg-[#071320] px-4 text-sm text-slate-900 dark:text-white focus:border-[#006D77] focus:bg-white focus:outline-none"
                  />
                </div>
              )}

              {paymentMethod === "CARD" && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="Card Number (4242 4242 4242 4242)"
                    className="sm:col-span-2 h-10 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-[#F4F7F8] dark:bg-[#071320] px-4 text-sm font-mono text-slate-900 dark:text-white focus:border-[#006D77] focus:bg-white focus:outline-none"
                  />
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Cardholder Name"
                    className="sm:col-span-2 h-10 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-[#F4F7F8] dark:bg-[#071320] px-4 text-sm text-slate-900 dark:text-white focus:border-[#006D77] focus:bg-white focus:outline-none"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    className="h-10 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-[#F4F7F8] dark:bg-[#071320] px-4 text-sm font-mono text-slate-900 dark:text-white focus:border-[#006D77] focus:bg-white focus:outline-none"
                  />
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="CVV"
                    className="h-10 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-[#F4F7F8] dark:bg-[#071320] px-4 text-sm font-mono text-slate-900 dark:text-white focus:border-[#006D77] focus:bg-white focus:outline-none"
                  />
                </div>
              )}

              {paymentMethod === "NETBANKING" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BANKS.map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`rounded-xl border px-3 py-2.5 text-left text-xs font-medium cursor-pointer ${
                        selectedBank === bank
                          ? "border-[#006D77] bg-[#006D77]/[0.08] text-[#006D77] dark:text-[#83C5BE] font-semibold"
                          : "border-slate-200 dark:border-white/[0.1] text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1 h-10 px-5 rounded-full border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#0B1F33] text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Adjust Slot</span>
              </button>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleBookAndPay(false)}
                  disabled={isSubmitting}
                  className="inline-flex items-center h-10 px-4.5 rounded-full border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#0B1F33] text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                >
                  Pay Later (Request Slot)
                </button>

                <button
                  type="button"
                  onClick={() => handleBookAndPay(true)}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 h-10 px-6 rounded-full bg-[#006D77] hover:bg-[#005860] text-sm font-semibold text-white shadow-[0_6px_18px_-4px_rgba(0,109,119,0.45)] cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Pay ₹{fee} &amp; Confirm</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
