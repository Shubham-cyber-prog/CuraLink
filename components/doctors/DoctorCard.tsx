"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Star,
  Calendar,
  Clock,
  MapPin,
  Video,
  CheckCircle2,
  Building2,
  ArrowRight,
  Award,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Doctor } from "@/types/doctor";

interface DoctorCardProps {
  doctor: Doctor;
  userCity?: string;
}

export function DoctorCard({ doctor, userCity = "India" }: DoctorCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeLocation, setActiveLocation] = useState(userCity);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setActiveLocation(userCity);
  }, [userCity]);

  const isVideoAvailable =
    Array.isArray(doctor.consultationModes) && doctor.consultationModes.length > 0
      ? doctor.consultationModes.includes("VIDEO")
      : doctor.videoConsultation !== false;

  const isInPersonAvailable =
    Boolean(doctor.inPersonConsultation) ||
    Boolean(doctor.consultationModes?.includes("IN_PERSON"));

  const hasRating = doctor.rating != null && Number(doctor.rating) > 0;
  const displayName = doctor.name?.startsWith("Dr.") ? doctor.name : `Dr. ${doctor.name || "Specialist"}`;
  const initial = (doctor.name || "D").replace(/^Dr\.?\s*/i, "").charAt(0).toUpperCase();
  const fee = doctor.consultationFee ?? 500;

  return (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="group rounded-[24px] border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0B1F33] p-5 sm:p-6 shadow-[0_2px_18px_-6px_rgba(11,31,51,0.06)] hover:shadow-[0_12px_32px_-10px_rgba(11,31,51,0.12)] hover:border-[#006D77]/35 dark:hover:border-[#83C5BE]/30 transition-all"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Avatar + Clinical Identity */}
        <div className="flex items-start gap-4 sm:gap-5 min-w-0 flex-1">
          <Link
            href={`/doctors/${doctor.id}`}
            className="relative flex h-18 w-18 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#0B1F33] to-[#006D77] text-white font-semibold text-2xl shadow-sm overflow-hidden ring-2 ring-[#006D77]/10"
          >
            {doctor.photoUrl && !imgFailed ? (
              <img
                src={doctor.photoUrl}
                alt={displayName}
                onError={() => setImgFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{initial}</span>
            )}
            <span
              className="absolute bottom-1.5 right-1.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0B1F33]"
              title="Available for consultation"
            />
          </Link>

          <div className="min-w-0 flex-1 space-y-2">
            {/* Name + Verified + Rating */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/doctors/${doctor.id}`}
                className="font-serif text-xl sm:text-[22px] leading-tight text-[#0B1F33] dark:text-white group-hover:text-[#006D77] dark:group-hover:text-[#83C5BE] transition-colors"
              >
                {displayName}
              </Link>

              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                NMC Verified
              </span>

              {hasRating ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/40 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {Number(doctor.rating).toFixed(1)}
                  {doctor.reviewCount ? <span className="opacity-70">({doctor.reviewCount})</span> : null}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-white/[0.06] px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  New Specialist
                </span>
              )}
            </div>

            {/* Specialty + Experience */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
              <span className="font-semibold text-[#006D77] dark:text-[#83C5BE]">
                {doctor.specialty || doctor.specialization || "General Practice"}
              </span>
              {doctor.experience && (
                <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Award className="h-3.5 w-3.5 text-slate-400" />
                  {doctor.experience}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {doctor.city ? `${doctor.city}, India` : `Online (${activeLocation})`}
              </span>
            </div>

            {/* Mode & Availability Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {isVideoAvailable && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#006D77]/[0.08] dark:bg-[#83C5BE]/15 px-3 py-1 text-[11px] font-semibold text-[#006D77] dark:text-[#83C5BE]">
                  <Video className="h-3 w-3" />
                  Video Consultation
                </span>
              )}

              {isInPersonAvailable && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/[0.07] px-3 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                  <Building2 className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                  Clinic Visit
                </span>
              )}

              {(doctor.nextAvailableDate || doctor.nextAvailableTime) && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 px-3 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                  <Calendar className="h-3 w-3" />
                  Next: {doctor.nextAvailableDate || "Today"}
                  {doctor.nextAvailableTime ? (
                    <>
                      <Clock className="h-3 w-3 ml-0.5" />
                      {doctor.nextAvailableTime}
                    </>
                  ) : null}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Transparent Fee + Direct Booking Action */}
        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-white/[0.08] lg:pl-6 shrink-0">
          <div className="text-left lg:text-right">
            <p className="text-[11px] font-medium text-slate-400">Consultation Fee</p>
            <p className="text-xl font-bold text-[#0B1F33] dark:text-white tracking-tight">
              ₹{fee}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/doctors/${doctor.id}`}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 dark:border-white/15 bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.08] px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap"
            >
              View Profile
            </Link>
            <Link
              href={`/doctors/${doctor.id}/book`}
              id={`book-doc-card-${doctor.id}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#006D77] hover:bg-[#005860] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_4px_14px_-3px_rgba(0,109,119,0.45)] transition-all active:scale-[0.98] whitespace-nowrap"
            >
              <span>Book Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
