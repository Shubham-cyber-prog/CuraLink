"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Star, Clock, Video, User, CheckCircle2, RefreshCw, AlertTriangle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { getMotionVariants, staggerContainer, fadeInUp } from "@/components/motion/variants";
import { Doctor } from "@/types/doctor";
import { ReviewCard } from "@/components/doctors/ReviewCard";
import { QualificationList } from "@/components/doctors/QualificationList";
import { AvailabilitySlotPicker } from "@/components/doctors/AvailabilitySlotPicker";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function DoctorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const reduceMotion = Boolean(useReducedMotion());
  const variants = getMotionVariants(reduceMotion);
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const fetchDoctor = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/doctors/${id}`);
      if (res.status === 404) {
        setDoctor(null);
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load doctor profile");
      }
      setDoctor(data.data);
      if (data.data?.availabilitySlots?.[0]?.date) {
        setSelectedDate(data.data.availabilitySlots[0].date);
      }
    } catch (err: any) {
      console.error("Error fetching doctor profile:", err);
      setError(err.message || "Unable to reach server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDoctor();
  }, [fetchDoctor]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl py-8 px-4 space-y-8 animate-fadeIn">
        <Skeleton className="h-6 w-32 rounded-lg" />
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <Skeleton className="h-28 w-28 rounded-2xl shrink-0" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-8 w-64 rounded-xl" />
            <Skeleton className="h-5 w-40 rounded-lg" />
            <Skeleton className="h-4 w-72 rounded-md" />
          </div>
        </div>
        <div className="space-y-4 pt-4">
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center py-16 text-center px-4">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9]">Failed to load doctor profile</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">{error}</p>
        <div className="mt-6 flex gap-3">
          <Button asChild variant="outline">
            <Link href="/find-doctor">← Back to search</Link>
          </Button>
          <Button onClick={fetchDoctor} className="bg-teal-600 hover:bg-teal-700">
            <RefreshCw className="h-4 w-4 mr-1.5" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <User className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Doctor not found</h2>
        <p className="mt-2 text-slate-500">We couldn't find the doctor you're looking for.</p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/find-doctor">← Back to search</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row lg:items-start">
      <div className="flex-1 space-y-8">
        <Link href="/find-doctor" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-teal-700">
          <ChevronLeft className="h-4 w-4" /> Back to search
        </Link>

        {/* Profile Header */}
        <motion.div initial="hidden" animate="visible" variants={variants.container} className="flex flex-col gap-6 sm:flex-row">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 ring-1 ring-teal-100 sm:h-32 sm:w-32">
            {doctor.photoUrl ? (
              <Image src={doctor.photoUrl} alt={doctor.name} width={128} height={128} unoptimized className="h-full w-full rounded-2xl object-cover" />
            ) : (
              <User className="h-12 w-12" />
            )}
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">{doctor.name}</h1>
            <p className="text-lg text-slate-500">{doctor.specialty}</p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700 ring-1 ring-amber-200">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {doctor.rating.toFixed(2)} ({doctor.reviewCount} reviews)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-sm text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-teal-600" /> {doctor.experience}
              </span>
              {doctor.videoConsultation && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-sm text-slate-600">
                  <Video className="h-4 w-4 text-teal-600" /> Video consults
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Details Sections */}
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-10">
          <motion.section variants={fadeInUp}>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">About</h2>
            <p className="leading-relaxed text-slate-600">{doctor.bio}</p>
          </motion.section>

          <motion.section variants={fadeInUp}>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">Qualifications</h2>
            <QualificationList qualifications={doctor.qualifications} />
          </motion.section>

          <motion.section variants={fadeInUp} className="lg:hidden">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Availability</h2>
            <AvailabilitySlotPicker 
              availabilitySlots={doctor.availabilitySlots} 
              onSlotSelect={(date, time) => { setSelectedDate(date); setSelectedTime(time); }}
            />
          </motion.section>

          <motion.section variants={fadeInUp}>
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Patient Reviews</h2>
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              {doctor.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </motion.section>
        </motion.div>
      </div>

      {/* Sticky Booking Sidebar / Bottom Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-4 shadow-xl lg:sticky lg:top-24 lg:w-80 lg:shrink-0 lg:rounded-2xl lg:border lg:p-6 lg:shadow-sm">
        <div className="hidden lg:block">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Book an Appointment</h3>
          <AvailabilitySlotPicker 
            availabilitySlots={doctor.availabilitySlots} 
            onSlotSelect={(date, time) => { setSelectedDate(date); setSelectedTime(time); }}
          />
          <div className="my-5 border-t border-slate-100" />
        </div>
        <div className="flex items-center justify-between lg:block">
          <div className="lg:mb-4">
            <p className="text-sm font-medium text-slate-900">Consultation Fee</p>
            <p className="text-2xl font-bold text-teal-700">₹{doctor.consultationFee || 500}</p>
          </div>
          <Button asChild size="lg" disabled={!selectedTime} className="bg-teal-600 hover:bg-teal-700 lg:w-full aria-disabled:opacity-50 aria-disabled:cursor-not-allowed">
            {selectedTime ? (
              <Link href={`/doctors/${doctor.id}/book?date=${selectedDate}&time=${selectedTime}`}>Book Appointment</Link>
            ) : (
              <span>Select a time</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
