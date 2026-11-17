"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Calendar, Clock, MapPin, Video, CheckCircle2, UserCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Doctor } from "@/types/doctor";
import { Badge } from "@/components/ui/Badge";
import { formatDoctorName, getDoctorAvatar } from "@/lib/clinical-formatters";

interface DoctorCardProps {
  doctor: Doctor;
  userCity?: string;
}

export function DoctorCard({ doctor, userCity = "Hisar" }: DoctorCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeLocation, setActiveLocation] = useState(userCity);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("curalink_user_location");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.city) setActiveLocation(parsed.city);
      }
    } catch (e) {}

    const handleLoc = (e: any) => {
      if (e.detail?.city) setActiveLocation(e.detail.city);
    };
    window.addEventListener("curalink-location-changed", handleLoc);
    return () => window.removeEventListener("curalink-location-changed", handleLoc);
  }, [userCity]);

  const isLocalInPersonAvailable =
    Boolean(doctor.inPersonConsultation) ||
    Boolean(doctor.consultationModes?.includes('IN_PERSON'));

  const hasRating = doctor.rating != null && Number(doctor.rating) > 0;

  const displayName = formatDoctorName(doctor.name);
  const avatarSrc = getDoctorAvatar(displayName, doctor.photoUrl);

  return (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="flex flex-col gap-4 rounded-[22px] border border-slate-200/75 dark:border-white/[0.08] bg-white dark:bg-[#0B1F33] p-6 shadow-[0_2px_16px_-4px_rgba(11,31,51,0.06),0_1px_3px_rgba(11,31,51,0.03)] transition-all hover:shadow-[0_14px_32px_-10px_rgba(11,31,51,0.12)] sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex gap-4 items-start sm:items-center">
        {/* Doctor photo */}
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-white/[0.1] overflow-hidden">
          <Image
            src={avatarSrc}
            alt={displayName}
            width={64}
            height={64}
            className="h-full w-full object-cover object-top"
          />
        </div>

        {/* Doctor details */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-serif text-xl leading-snug text-[#0B1F33] dark:text-white">
              {displayName}
            </h3>
            <Badge variant="verified">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>Verified</span>
            </Badge>

            {hasRating ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {Number(doctor.rating).toFixed(1)} {doctor.reviewCount ? `(${doctor.reviewCount})` : ""}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/40">
                New
              </span>
            )}
          </div>

          <p className="text-xs font-medium text-[#0D9488] dark:text-[#14B8A6]">
            {doctor.specialty || "Medical Practitioner"}{doctor.experience ? ` • ${doctor.experience}` : ""}
          </p>

          {/* Location & Consultation availability tags */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
              <MapPin className="h-3 w-3 text-slate-400" />
              {doctor.city
                ? `Clinic in ${doctor.city}`
                : isLocalInPersonAvailable
                ? `In-person near ${activeLocation}`
                : `Telehealth Consultation`}
            </span>

            {doctor.videoConsultation && (
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-950/50 px-2.5 py-0.5 text-[11px] font-medium text-[#0F766E] dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40">
                <Video className="h-3 w-3 text-[#0D9488]" />
                Video
              </span>
            )}

            {isLocalInPersonAvailable && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 text-[11px] font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                <UserCheck className="h-3 w-3 text-indigo-600" />
                In-Person
              </span>
            )}

            {doctor.consultationFee ? (
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                ₹{doctor.consultationFee}
              </span>
            ) : null}
          </div>

          {/* Availability metadata */}
          {(doctor.nextAvailableDate || doctor.nextAvailableTime) && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-slate-500 dark:text-slate-400">
              {doctor.nextAvailableDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Next Slot: {doctor.nextAvailableDate}
                </span>
              )}
              {doctor.nextAvailableTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {doctor.nextAvailableTime}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Book Consultation Button */}
      <div className="flex shrink-0 items-center sm:self-center">
        <Link
          href={`/doctors/${doctor.id}`}
          className="w-full sm:w-auto inline-flex items-center justify-center h-10 rounded-full bg-[#006D77] hover:bg-[#005860] px-5 text-xs font-medium text-white shadow-[0_4px_14px_-3px_rgba(0,109,119,0.4)] transition-all active:scale-[0.98]"
          id={`book-doc-card-${doctor.id}`}
        >
          Book Appointment
        </Link>
      </div>
    </motion.div>
  );
}
