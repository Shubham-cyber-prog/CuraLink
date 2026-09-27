"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Video,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface DoctorCardData {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviews: number;
  nextAvailable: string;
  fee: number;
  photoUrl: string;
}

const FALLBACK_DOCTORS: DoctorCardData[] = [
  {
    id: "doc-1",
    name: "Dr. Subham Nayak, MD",
    specialty: "General Medicine",
    experience: "10+ yrs exp",
    rating: 4.9,
    reviews: 128,
    nextAvailable: "Today, 10:30 AM",
    fee: 500,
    photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=320&q=80",
  },
  {
    id: "doc-2",
    name: "Dr. Priya Sharma, MD",
    specialty: "Cardiology",
    experience: "12+ yrs exp",
    rating: 4.9,
    reviews: 94,
    nextAvailable: "Today, 2:15 PM",
    fee: 700,
    photoUrl: "https://images.unsplash.com/photo-1594824813588-43e62f558115?auto=format&fit=crop&w=320&q=80",
  },
  {
    id: "doc-3",
    name: "Dr. Rajesh Mehta, MD",
    specialty: "Dermatology",
    experience: "8+ yrs exp",
    rating: 4.8,
    reviews: 76,
    nextAvailable: "Tomorrow, 11:00 AM",
    fee: 600,
    photoUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=320&q=80",
  },
  {
    id: "doc-4",
    name: "Dr. Ananya Iyer, MD",
    specialty: "Pediatrics",
    experience: "9+ yrs exp",
    rating: 5.0,
    reviews: 112,
    nextAvailable: "Today, 4:00 PM",
    fee: 550,
    photoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=320&q=80",
  },
];

export function DoctorDiscoveryPreview() {
  const [doctors, setDoctors] = useState<DoctorCardData[]>(FALLBACK_DOCTORS);

  useEffect(() => {
    // Attempt live fetch from verified doctors directory
    fetch("/api/doctors/verified")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
          const mapped: DoctorCardData[] = data.data.slice(0, 4).map((d: any, idx: number) => ({
            id: d.id || d.userId || `doc-${idx}`,
            name: d.name ? (d.name.startsWith("Dr.") ? d.name : `Dr. ${d.name}`) : FALLBACK_DOCTORS[idx % 4].name,
            specialty: d.specialization || d.specialty || FALLBACK_DOCTORS[idx % 4].specialty,
            experience: d.experienceYears ? `${d.experienceYears}+ yrs exp` : FALLBACK_DOCTORS[idx % 4].experience,
            rating: typeof d.rating === "number" ? d.rating : 4.9,
            reviews: typeof d.reviewCount === "number" ? d.reviewCount : 85 + idx * 10,
            nextAvailable: d.nextAvailableDate ? `${d.nextAvailableDate}` : FALLBACK_DOCTORS[idx % 4].nextAvailable,
            fee: d.consultationFee || FALLBACK_DOCTORS[idx % 4].fee,
            photoUrl: d.photoUrl || FALLBACK_DOCTORS[idx % 4].photoUrl,
          }));
          setDoctors(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  };

  return (
    <section
      className="px-4 sm:px-6 py-16 sm:py-20 bg-white dark:bg-[#0B1120] border-b border-[#E2E8F0] dark:border-slate-800"
      aria-labelledby="discovery-heading"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0D9488] dark:text-[#14B8A6]">
              Physician Network
            </span>
            <h2
              id="discovery-heading"
              className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
            >
              Find care that fits your needs.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Browse healthcare professionals by specialty, availability, and consultation type.
            </p>
          </div>

          <Button asChild className="bg-[#0D9488] hover:bg-[#0F766E] text-white shrink-0 self-start md:self-end rounded-xl shadow-2xs">
            <Link href="/find-doctor" className="inline-flex items-center gap-2">
              <span>Browse All Physicians</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* 4 Compact Doctor Cards Grid */}
        <motion.div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={containerVariants}
        >
          {doctors.map((doctor) => (
            <motion.div
              key={doctor.id}
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="group flex flex-col justify-between rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-[#FAFAFA] dark:bg-[#151B2E] p-4 shadow-2xs hover:shadow-xs hover:border-[#0D9488]/40 transition-all"
            >
              <div>
                {/* Doctor Headshot & Verified Tag */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="relative h-13 w-13 shrink-0 overflow-hidden rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-200">
                    <Image
                      src={doctor.photoUrl}
                      alt={doctor.name}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="52px"
                    />
                    <span className="absolute bottom-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <CheckCircle2 className="h-2.5 w-2.5 stroke-[3]" />
                    </span>
                  </div>

                  <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/40">
                    Verified
                  </span>
                </div>

                {/* Name & Specialty */}
                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#0D9488] dark:group-hover:text-[#14B8A6] transition-colors">
                  {doctor.name}
                </h3>
                <p className="text-xs font-medium text-[#0D9488] dark:text-[#14B8A6] mt-0.5">
                  {doctor.specialty}
                </p>

                {/* Rating & Clinical Experience */}
                <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {doctor.rating}
                  </span>
                  <span>•</span>
                  <span>{doctor.experience}</span>
                </div>

                {/* Next Availability */}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/60 rounded-lg p-2 border border-slate-100 dark:border-slate-800">
                  <Clock className="h-3.5 w-3.5 text-[#0D9488] shrink-0" />
                  <span className="truncate">{doctor.nextAvailable}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  ₹{doctor.fee}
                </span>
                <Link
                  href={`/doctors/${doctor.id}/book`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D9488] hover:text-[#0F766E] dark:text-teal-400"
                >
                  <span>Book Visit</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
