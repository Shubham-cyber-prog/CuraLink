"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Calendar, Clock, User, MapPin, Video, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Doctor } from "@/lib/mock-data";

interface DoctorCardProps {
  doctor: Doctor;
  userCity?: string;
}

export function DoctorCard({ doctor, userCity = "Hisar" }: DoctorCardProps) {
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

  // Mock location matching logic
  const isLocalInPersonAvailable =
    doctor.specialty.includes("General") ||
    doctor.specialty.includes("Pediatrics") ||
    activeLocation === "Hisar" ||
    activeLocation === "New Delhi";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-4">
        {/* Doctor photo/avatar */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-[#0F9D8C] font-bold text-xl border border-teal-100">
          {doctor.photoUrl ? (
            <Image
              src={doctor.photoUrl}
              alt={doctor.name}
              width={64}
              height={64}
              unoptimized
              className="h-full w-full rounded-2xl object-cover"
            />
          ) : (
            <span>{doctor.name.replace("Dr. ", "").charAt(0)}</span>
          )}
        </div>

        {/* Doctor details */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-bold text-[#0F172A] text-base">{doctor.name}</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {doctor.rating.toFixed(2)} ({doctor.reviewCount})
            </span>
          </div>

          <p className="text-xs font-semibold text-[#0F9D8C]">
            {doctor.specialty} • {doctor.experience}
          </p>

          {/* Location & Consultation availability tags */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-[#0F172A]">
              <MapPin className="h-3 w-3 text-[#0F9D8C]" />
              {isLocalInPersonAvailable
                ? `In-person near ${activeLocation}`
                : `Not available in ${activeLocation} for in-person`}
            </span>

            {doctor.videoConsultation && (
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-medium text-teal-800">
                <Video className="h-3 w-3 text-[#0F9D8C]" />
                Video Available Nationwide
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 text-xs text-[#64748B]">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Next Slot: {doctor.nextAvailableDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {doctor.nextAvailableTime}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:self-center">
        <Link
          href={`/find-doctor?doctor=${doctor.id}`}
          className="w-full sm:w-auto inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#0F9D8C] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0C8577] transition-colors"
          id={`book-doc-card-${doctor.id}`}
        >
          Book Consultation
        </Link>
      </div>
    </div>
  );
}
