"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RefreshCw, MapPin, AlertCircle, Sparkles, AlertTriangle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Doctor } from "@/types/doctor";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { DoctorFilters } from "@/components/doctors/DoctorFilters";
import { LocationInfo } from "@/components/layout/LocationSelector";
import { Skeleton } from "@/components/ui/Skeleton";

export default function FindDoctorPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [availability, setAvailability] = useState<"any-time" | "today" | "this-week">("any-time");
  const [rating, setRating] = useState<"all" | "4.8" | "4.9">("all");
  const [visitType, setVisitType] = useState<"all" | "video" | "in-person">("all");
  const [userLocation, setUserLocation] = useState<LocationInfo>({
    city: "Hisar",
    state: "Haryana",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("curalink_user_location");
      if (saved) setUserLocation(JSON.parse(saved));
    } catch (e) {}

    const handleLoc = (e: any) => {
      if (e.detail) setUserLocation(e.detail);
    };
    window.addEventListener("curalink-location-changed", handleLoc);
    return () => window.removeEventListener("curalink-location-changed", handleLoc);
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiBase}/doctors/verified`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load doctors");
      }
      setDoctors(json.data || []);
    } catch (err: any) {
      console.error("Error fetching verified doctors:", err);
      setError(err.message || "Could not load doctors from server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const checkAuthAndFetch = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/me`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Not auth");
        if (mounted) {
          await fetchDoctors();
        }
      } catch (err) {
        if (mounted) router.replace("/login");
      }
    };
    checkAuthAndFetch();
    return () => {
      mounted = false;
    };
  }, [router, fetchDoctors]);

  const handleClearFilters = () => {
    setSearch("");
    setSpecialty("All");
    setAvailability("any-time");
    setRating("all");
    setVisitType("all");
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(search.toLowerCase());
      const matchesSpecialty =
        specialty === "All" ||
        doc.specialty.toLowerCase().includes(specialty.toLowerCase()) ||
        (doc.specialization && doc.specialization.toLowerCase().includes(specialty.toLowerCase()));
      const matchesAvailability =
        availability === "any-time" ||
        (availability === "today" && doc.availability === "today") ||
        (availability === "this-week" &&
          (doc.availability === "today" || doc.availability === "this-week"));
      const matchesRating = rating === "all" || doc.rating >= parseFloat(rating);

      let matchesVisitMode = true;
      if (visitType === "video") {
        matchesVisitMode = doc.videoConsultation;
      } else if (visitType === "in-person") {
        matchesVisitMode =
          doc.specialty.includes("General") ||
          doc.specialty.includes("Pediatrics") ||
          userLocation.city === "Hisar" ||
          userLocation.city === "New Delhi";
      }

      return (
        matchesSearch &&
        matchesSpecialty &&
        matchesAvailability &&
        matchesRating &&
        matchesVisitMode
      );
    });
  }, [doctors, search, specialty, availability, rating, visitType, userLocation]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#263049] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0F9D8C] dark:text-[#14B8A6] mb-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>Browsing doctors near {userLocation.city}, {userLocation.state}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
            Find & Book Doctors
          </h1>
          <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">
            Browse top-rated licensed clinicians for video calls & in-person appointments.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/80 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-950/40 px-3 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300 self-start sm:self-auto">
          <Sparkles className="h-3.5 w-3.5 text-[#0F9D8C] dark:text-[#14B8A6]" />
          <span>Verified Medical Practitioners</span>
        </div>
      </div>

      {/* Location Availability Notice banner */}
      <div className="rounded-2xl border border-teal-200/80 dark:border-teal-800/60 bg-teal-50/60 dark:bg-teal-950/40 p-4 text-xs font-medium text-teal-900 dark:text-teal-200 flex items-start gap-3">
        <MapPin className="h-4 w-4 text-[#0F9D8C] dark:text-[#14B8A6] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-[#0F172A] dark:text-[#F1F5F9]">
            Location-Refined Availability for {userLocation.city}
          </p>
          <p className="text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Video consultations are available 24/7 nationwide. In-person clinics and home sample pickups are filtered by proximity to {userLocation.city}.
          </p>
        </div>
      </div>

      {/* Filters */}
      <DoctorFilters
        specialty={specialty}
        setSpecialty={setSpecialty}
        availability={availability}
        setAvailability={setAvailability}
        rating={rating}
        setRating={setRating}
        visitType={visitType}
        setVisitType={setVisitType}
      />

      {/* Doctor Listings */}
      <div className="space-y-4">
        {error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/30 p-8 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-red-900 dark:text-red-200">
              Unable to Load Doctors
            </h3>
            <p className="max-w-md text-xs text-red-700 dark:text-red-300">
              {error}
            </p>
            <button
              onClick={fetchDoctors}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-semibold transition-colors cursor-pointer active:scale-[0.97]"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry Connection
            </button>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-28 rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48 rounded-lg" />
                    <Skeleton className="h-4 w-36 rounded-md" />
                    <Skeleton className="h-3.5 w-60 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-11 w-32 rounded-xl shrink-0" />
              </div>
            ))}
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="space-y-3">
            {filteredDoctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                {...(shouldReduceMotion
                  ? {}
                  : {
                      initial: { opacity: 0, y: 8 },
                      animate: { opacity: 1, y: 0 },
                      transition: {
                        duration: 0.25,
                        delay: index * 0.05,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    })}
              >
                <DoctorCard
                  doctor={doctor}
                  userCity={userLocation.city}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-8 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F1F5F9]">
              No doctors found matching your filters
            </h3>
            <p className="max-w-md text-xs text-[#64748B] dark:text-[#94A3B8]">
              No verified doctors match your current search or specialty criteria. Try resetting filters or browsing all medical specialties!
            </p>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#1C2338] px-4 py-2 text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#263049] transition-colors cursor-pointer active:scale-[0.97]"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
