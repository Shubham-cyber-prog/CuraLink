"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Clock, ArrowRight, CheckCircle2, UserX } from "lucide-react";
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
  initial: string;
}

export function DoctorDiscoveryPreview() {
  const [doctors, setDoctors] = useState<DoctorCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    fetch(`${apiBase}/doctors/verified`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
          const mapped: DoctorCardData[] = data.data.slice(0, 4).map((d: any, idx: number) => {
            const rawName = d.name ? (d.name.startsWith("Dr.") ? d.name : `Dr. ${d.name}`) : "Dr. Medical Specialist";
            const cleanName = rawName.replace(/^Dr\.\s+/, "");
            return {
              id: d.id || d.userId || `doc-${idx}`,
              name: rawName,
              specialty: d.specialization || d.specialty || "General Practice",
              experience: d.experienceYears ? `${d.experienceYears}+ yrs exp` : "5+ yrs exp",
              rating: typeof d.rating === "number" ? d.rating : 5.0,
              reviews: typeof d.reviewCount === "number" ? d.reviewCount : 1,
              nextAvailable: d.nextAvailableDate ? `${d.nextAvailableDate}` : "Available Today",
              fee: d.consultationFee || 500,
              initial: cleanName.charAt(0) || "D",
            };
          });
          setDoctors(mapped);
        } else {
          setDoctors([]);
        }
      })
      .catch((err) => {
        console.error("DoctorDiscoveryPreview load error:", err);
        setDoctors([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
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
              Browse verified healthcare professionals by specialty, availability, and consultation type.
            </p>
          </div>

          <Button asChild className="bg-[#0D9488] hover:bg-[#0F766E] text-white shrink-0 self-start md:self-end rounded-xl shadow-2xs">
            <Link href="/find-doctor" className="inline-flex items-center gap-2">
              <span>Browse All Physicians</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Doctor Cards Grid or Honest Empty State */}
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 animate-pulse" />
            ))}
          </div>
        ) : doctors.length > 0 ? (
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
                  {/* Doctor Avatar Initial & Verified Tag */}
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] dark:text-[#14B8A6] font-bold text-lg border border-teal-100 dark:border-teal-900/50">
                      {doctor.initial}
                      <span className="absolute bottom-[-2px] right-[-2px] flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <CheckCircle2 className="h-3 w-3 stroke-[3]" />
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
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#FAFAFA] dark:bg-[#151B2E] p-8 text-center max-w-lg mx-auto">
            <UserX className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">No Physicians Available Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              New medical specialists are onboarded and verified daily through our clinical review team.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/register?role=DOCTOR">Join as Physician</Link>
              </Button>
              <Button asChild size="sm" className="bg-[#0D9488] hover:bg-[#0F766E] text-white">
                <Link href="/find-doctor">Browse Directory</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
