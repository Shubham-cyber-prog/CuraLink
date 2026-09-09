"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Calendar, Clock, CheckCircle2, User, CreditCard, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Doctor } from "@/types/doctor";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function BookAppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const date = searchParams.get("date");
  const time = searchParams.get("time");

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoadingDoctor, setIsLoadingDoctor] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (!date || !time) {
      router.replace(`/doctors/${id}`);
      return;
    }
    
    // Check authentication via API
    let mounted = true;
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include"
        });
        if (!res.ok) throw new Error("Not auth");
        if (mounted) setIsAuthenticated(true);
      } catch (err) {
        if (mounted) router.push(`/login?redirect=/doctors/${id}/book?date=${date}&time=${time}`);
      }
    };

    const fetchDoctor = async () => {
      try {
        setIsLoadingDoctor(true);
        const res = await fetch(`${API_BASE}/doctors/${id}`);
        const data = await res.json();
        if (mounted && data.success && data.data) {
          setDoctor(data.data);
        }
      } catch (err) {
        console.error("Error fetching doctor:", err);
      } finally {
        if (mounted) setIsLoadingDoctor(false);
      }
    };

    checkAuth();
    fetchDoctor();

    return () => { mounted = false; };
  }, [date, time, id, router]);

  if (isLoadingDoctor || isAuthenticated === null) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 space-y-6 animate-fadeIn">
        <Skeleton className="h-6 w-36 rounded-lg" />
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-44 w-full rounded-3xl" />
            <Skeleton className="h-32 w-full rounded-3xl" />
          </div>
          <Skeleton className="h-72 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!doctor || !date || !time) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const csrfRes = await fetch(`${API_BASE}/auth/csrf-token`);
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.token;

      const res = await fetch(`${API_BASE}/appointments/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        credentials: "include",
        body: JSON.stringify({
          doctorId: doctor.id,
          date,
          time
        })
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to book appointment");
      }
      
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Unable to connect to the server. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center py-20 text-center px-4">
        <motion.div 
          initial={{ scale: 0, opacity: 0, rotate: -45 }} 
          animate={{ scale: 1, opacity: 1, rotate: 0 }} 
          transition={{ type: "spring", bounce: 0.5 }}
          className="mb-8 rounded-full bg-gradient-to-tr from-teal-400 to-teal-600 p-6 text-white shadow-xl shadow-teal-500/30"
        >
          <CheckCircle2 className="h-16 w-16" />
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="mb-3 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-[#F1F5F9]">Appointment Confirmed!</h2>
          <p className="max-w-md mx-auto text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            You are scheduled to see <span className="font-semibold text-slate-900 dark:text-white">{doctor.name}</span> on <span className="font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded">{date}</span> at <span className="font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded">{time}</span>.
          </p>
          <Button asChild size="lg" className="h-14 px-8 rounded-2xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 shadow-lg shadow-teal-600/20 text-base font-semibold">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href={`/doctors/${id}`} className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400 transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back to Doctor Profile
      </Link>

      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-[#F1F5F9] mb-2">Review & Confirm</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Please review your appointment details before confirming.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 px-4 py-2 text-sm font-medium text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-800/60">
          <ShieldCheck className="h-4 w-4" /> Secure Checkout
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Appointment Details */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/60 dark:border-[#263049] bg-white/60 dark:bg-[#151B2E]/90 backdrop-blur-xl p-8 shadow-sm transition-all hover:shadow-md">
            <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" /> Appointment Details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="group flex items-start gap-4 rounded-2xl bg-slate-50/80 dark:bg-[#1C2338]/80 p-5 transition-colors hover:bg-teal-50/50 dark:hover:bg-teal-950/30 border border-transparent hover:border-teal-100 dark:hover:border-teal-800/60">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-[#151B2E] shadow-sm text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300 group-hover:scale-110 transition-transform">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Date</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-[#F1F5F9]">{date}</p>
                </div>
              </div>
              <div className="group flex items-start gap-4 rounded-2xl bg-slate-50/80 dark:bg-[#1C2338]/80 p-5 transition-colors hover:bg-teal-50/50 dark:hover:bg-teal-950/30 border border-transparent hover:border-teal-100 dark:hover:border-teal-800/60">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-[#151B2E] shadow-sm text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300 group-hover:scale-110 transition-transform">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Time</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-[#F1F5F9]">{time}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="rounded-3xl border border-slate-200/60 dark:border-[#263049] bg-white/60 dark:bg-[#151B2E]/90 backdrop-blur-xl p-8 shadow-sm transition-all hover:shadow-md">
            <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-teal-600 dark:text-teal-400" /> Payment Information
            </h2>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-[#263049] bg-white dark:bg-[#1C2338] p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 shadow-inner">
                  <span className="font-bold text-white tracking-widest text-xs">VISA</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-[#F1F5F9]">Card ending in 4242</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Expires 12/28</p>
                </div>
              </div>
              <Button variant="ghost" className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 font-semibold rounded-full">Change</Button>
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/60 dark:border-[#263049] bg-white/80 dark:bg-[#151B2E]/90 backdrop-blur-xl p-6 shadow-lg shadow-slate-200/40 dark:shadow-none">
            <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-[#F1F5F9]">Provider</h2>
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-[#263049] pb-5">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-teal-50 dark:bg-teal-950/60 ring-2 ring-teal-100 dark:ring-teal-900">
                {doctor.photoUrl ? (
                  <Image src={doctor.photoUrl} alt={doctor.name} width={56} height={56} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-14 w-14 p-3 text-teal-600 dark:text-teal-400" />
                )}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-[#F1F5F9] text-lg">{doctor.name}</p>
                <p className="text-sm font-medium text-teal-700 dark:text-teal-400">{doctor.specialty}</p>
              </div>
            </div>
            
            <div className="pt-5 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Consultation Fee</span>
                <span className="font-semibold text-slate-900 dark:text-[#F1F5F9]">₹{doctor.consultationFee || 500}.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Service Fee</span>
                <span className="font-semibold text-slate-900 dark:text-[#F1F5F9]">₹50.00</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 dark:border-[#263049] pt-4 mt-2">
                <span className="font-bold text-slate-900 dark:text-[#F1F5F9] text-lg">Total</span>
                <span className="font-extrabold text-teal-600 dark:text-teal-400 text-2xl">₹{(doctor.consultationFee || 500) + 50}.00</span>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/60 p-4 text-sm text-red-600 dark:text-red-400 font-medium"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            onClick={handleConfirm} 
            disabled={isSubmitting} 
            className="w-full h-14 rounded-2xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 text-base font-bold shadow-lg shadow-teal-600/20 transition-all active:scale-[0.97]"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Confirming...
              </div>
            ) : "Confirm Appointment"}
          </Button>
          <p className="text-center text-xs font-medium text-slate-400 dark:text-slate-500 px-4">
            By confirming, you agree to our <Link href="/terms-of-service" className="underline hover:text-teal-600 dark:hover:text-teal-400">Terms of Service</Link> and <Link href="/cancellation-policy" className="underline hover:text-teal-600 dark:hover:text-teal-400">Cancellation Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
