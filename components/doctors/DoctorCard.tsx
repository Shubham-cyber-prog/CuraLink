"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Calendar, Clock, User } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MotionButton } from "@/components/motion/MotionButton";
import { cardReveal } from "@/components/motion/variants";
import { Doctor } from "@/lib/mock-data";

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <motion.div
      variants={cardReveal}
      className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-900/5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex gap-4">
        {/* Doctor photo/avatar */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 ring-1 ring-teal-100">
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
            <User className="h-8 w-8" aria-hidden="true" />
          )}
        </div>

        {/* Doctor details */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-semibold text-slate-900">{doctor.name}</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {doctor.rating.toFixed(2)} ({doctor.reviewCount})
            </span>
          </div>
          <p className="text-sm text-slate-500">{doctor.specialty}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              {doctor.nextAvailableDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {doctor.nextAvailableTime}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center sm:self-center">
        <MotionButton className="w-full sm:w-auto">
          <Button
            asChild
            variant="outline"
            className="w-full shadow-sm sm:w-auto"
            id={`view-profile-${doctor.id}`}
          >
            <Link href={`/doctors/${doctor.id}`}>View Profile</Link>
          </Button>
        </MotionButton>
      </div>
    </motion.div>
  );
}
