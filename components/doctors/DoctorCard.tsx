"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Calendar, Clock, MapPin, Video, CheckCircle2, UserCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Doctor } from "@/types/doctor";
import { Badge } from "@/components/ui/Badge";

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

  return (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.008 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-shadow hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex gap-4 items-start sm:items-center">
        {/* Doctor photo/avatar */}
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] dark:text-[#14B8A6] font-bold text-xl border border-teal-100 dark:border-teal-900/60 overflow-hidden">
          {doctor.photoUrl ? (
            <Image
              src={doctor.photoUrl}
              alt={doctor.name}
              width={64}
              height={64}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{doctor.name ? doctor.name.replace("Dr. ", "").charAt(0) : "D"}</span>
          )}
        </div>

        {/* Doctor details */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              {doctor.name}
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
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-[#0D9488] hover:bg-[#0F766E] px-4 py-2.5 text-xs font-semibold text-white shadow-2xs transition-colors active:scale-[0.98]"
          id={`book-doc-card-${doctor.id}`}
        >
          Book Appointment
        </Link>
      </div>
    </motion.div>
  );
}
