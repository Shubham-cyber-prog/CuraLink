"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Star, Clock, Video, User, CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getMotionVariants, staggerContainer, fadeInUp } from "@/components/motion/variants";
import { MOCK_DOCTORS } from "@/lib/mock-data";
import { ReviewCard } from "@/components/doctors/ReviewCard";
import { QualificationList } from "@/components/doctors/QualificationList";
import { AvailabilitySlotPicker } from "@/components/doctors/AvailabilitySlotPicker";

export default function DoctorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const reduceMotion = Boolean(useReducedMotion());
  const variants = getMotionVariants(reduceMotion);
  
  const [doctor, setDoctor] = useState(MOCK_DOCTORS.find((d) => d.id === id) || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: replace with real API call to GET /api/doctors/[id]
    // fetch(`/api/doctors/${id}`).then(...)
    const timer = setTimeout(() => {
      setDoctor(MOCK_DOCTORS.find((d) => d.id === id) || null);
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
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
            <AvailabilitySlotPicker availabilitySlots={doctor.availabilitySlots} />
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
          <AvailabilitySlotPicker availabilitySlots={doctor.availabilitySlots} />
          <div className="my-5 border-t border-slate-100" />
        </div>
        <div className="flex items-center justify-between lg:block">
          <div className="lg:mb-4">
            <p className="text-sm font-medium text-slate-900">Consultation Fee</p>
            <p className="text-2xl font-bold text-teal-700">$99</p>
          </div>
          <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 lg:w-full">
            <Link href={`/doctors/${doctor.id}/book`}>Book Appointment</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
