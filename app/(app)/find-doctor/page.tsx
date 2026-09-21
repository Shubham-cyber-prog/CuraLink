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
import { AIDoctorRecommender } from "@/components/ai/AIDoctorRecommender";

export default function FindDoctorPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [availability, setAvailability] = useState<"any-time" | "today" | "this-week">("any-time");
  const [rating, setRating] = useState<"all" | "4.8" | "4.9">("all");
  const [visitType, setVisitType] = useState<"all" | "video" | "in-person">("all");
  const [filterByCity, setFilterByCity] = useState(true);
  const [userLocation, setUserLocation] = useState<LocationInfo>({
    city: "Hisar",
    state: "Haryana",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("curalink_user_location");
      if (saved) {
        const parsed = JSON.parse(saved);
        setUserLocation(parsed);
        // If the location was detected and unconfirmed, default filterByCity to false so we don't silently hide doctors
        if (parsed.isDetected && !parsed.isConfirmed) {
          setFilterByCity(false);
        } else {
          setFilterByCity(true);
        }
      }
    } catch (e) {}

    const handleLoc = (e: any) => {
      if (e.detail) {
        setUserLocation(e.detail);
        if (e.detail.isDetected && !e.detail.isConfirmed) {
          setFilterByCity(false);
        } else {
          setFilterByCity(true);
        }
      }
    };
    window.addEventListener("curalink-location-changed", handleLoc);
    return () => window.removeEventListener("curalink-location-changed", handleLoc);
  }, []);

  const fetchDoctors = useCallback(
    async (targetCity?: string, shouldFilter = filterByCity) => {
      try {
        setIsLoading(true);
        setError(null);
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const cityToFilter = shouldFilter ? (targetCity ?? userLocation.city) : undefined;
        const url =
          cityToFilter && cityToFilter.toLowerCase() !== "all"
            ? `${apiBase}/doctors?city=${encodeURIComponent(cityToFilter)}`
            : `${apiBase}/doctors`;

        const res = await fetch(url);
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
    },
    [filterByCity, userLocation.city]
  );

  useEffect(() => {
    fetchDoctors(userLocation.city, filterByCity);
  }, [userLocation.city, filterByCity, fetchDoctors]);

  const handleClearFilters = () => {
    setSearch("");
    setSpecialty("All");
    setAvailability("any-time");
    setRating("all");
    setVisitType("all");
    setFilterByCity(false);
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(search.toLowerCase()) ||
        (doc.city && doc.city.toLowerCase().includes(search.toLowerCase()));
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
          (doc.city && doc.city.toLowerCase() === userLocation.city.toLowerCase()) ||
          doc.specialty.includes("General") ||
          doc.specialty.includes("Pediatrics");
      }

      return (
        matchesSearch &&
        matchesSpecialty &&
        matchesAvailability &&
        matchesRating &&
        matchesVisitMode
      );
    });
  }, [doctors, search, specialty, availability, rating, visitType, userLocation.city]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#263049] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0F9D8C] dark:text-[#14B8A6] mb-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>
              {filterByCity
                ? `Showing doctors near ${userLocation.city}, ${userLocation.state}`
                : `Showing all doctors nationwide (Location: ${userLocation.city})`}
            </span>
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

      {/* Location Notice / Detected Suggestion Banner */}
      {userLocation.isDetected && !userLocation.isConfirmed ? (
        <div className="rounded-2xl border border-amber-300 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40 p-4 text-xs font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-100 dark:bg-amber-900/60 p-2 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-[#0F172A] dark:text-[#F1F5F9] text-sm">
                  📍 Detected: {userLocation.city}, {userLocation.state}
                </p>
                <span className="rounded bg-amber-200/80 dark:bg-amber-900/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 dark:text-amber-200">
                  IP / Network Estimate
                </span>
              </div>
              <p className="text-amber-800 dark:text-amber-300 mt-1 text-[11.5px]">
                Desktop browsers estimate location via IP network and may differ from your actual city. Not correct?
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={() => {
                const confirmed = { ...userLocation, isConfirmed: true };
                setUserLocation(confirmed);
                setFilterByCity(true);
                try {
                  localStorage.setItem("curalink_user_location", JSON.stringify(confirmed));
                } catch (e) {}
              }}
              className="rounded-xl bg-[#0F9D8C] hover:bg-[#0C8577] text-white px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              ✓ Filter by {userLocation.city}
            </button>
            <button
              onClick={() => {
                const btn = document.getElementById("doctor-filter-location-btn");
                btn?.click();
              }}
              className="rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-[#1C2338] hover:bg-amber-100/50 dark:hover:bg-[#263049] text-amber-900 dark:text-amber-200 px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer"
            >
              ✏️ Change City Manually
            </button>
            <button
              onClick={() => {
                setFilterByCity(false);
              }}
              className="rounded-xl border border-slate-200 dark:border-[#263049] bg-white dark:bg-[#1C2338] hover:bg-slate-50 dark:hover:bg-[#263049] text-slate-700 dark:text-slate-300 px-3 py-2 text-xs font-semibold transition-colors cursor-pointer"
            >
              Browse All Doctors
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-teal-200/80 dark:border-teal-800/60 bg-teal-50/60 dark:bg-teal-950/40 p-4 text-xs font-medium text-teal-900 dark:text-teal-200 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-[#0F9D8C] dark:text-[#14B8A6] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                {filterByCity
                  ? `Location-Refined Doctors in ${userLocation.city}`
                  : "All Nationwide Doctors"}
              </p>
              <p className="text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                {filterByCity
                  ? `Displaying licensed clinicians available in or near ${userLocation.city}. Video appointments available 24/7.`
                  : "Browsing all verified clinicians across all cities and nationwide telehealth."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-center">
            <button
              onClick={() => {
                const btn = document.getElementById("doctor-filter-location-btn");
                btn?.click();
              }}
              className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline cursor-pointer"
            >
              Change City
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              onClick={() => setFilterByCity(!filterByCity)}
              className="shrink-0 text-xs font-semibold text-[#0F9D8C] dark:text-[#14B8A6] hover:underline cursor-pointer"
            >
              {filterByCity ? "View all nationwide" : `Filter by ${userLocation.city}`}
            </button>
          </div>
        </div>
      )}

      {/* AI Doctor Recommender */}
      <AIDoctorRecommender />

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
        userLocation={userLocation}
        onLocationChange={(loc) => {
          setUserLocation(loc);
          setFilterByCity(true);
        }}
        filterByCity={filterByCity}
        setFilterByCity={setFilterByCity}
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
              onClick={() => fetchDoctors(userLocation.city, filterByCity)}
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
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F1F5F9]">
              {filterByCity
                ? `No doctors found in ${userLocation.city} yet`
                : "No doctors found matching your filters"}
            </h3>
            <p className="max-w-md text-xs text-[#64748B] dark:text-[#94A3B8]">
              {filterByCity
                ? `We don't have clinicians registered in ${userLocation.city} yet. Try selecting a nearby area or browse all nationwide telehealth doctors!`
                : "No verified doctors match your current search or specialty criteria. Try resetting filters or browsing all medical specialties!"}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const btn = document.getElementById("doctor-filter-location-btn");
                  btn?.click();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-[#263049] bg-white dark:bg-[#1C2338] px-4 py-2 text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#263049] transition-colors cursor-pointer"
              >
                <MapPin className="h-3.5 w-3.5 text-[#0F9D8C]" /> Change city manually
              </button>
              {filterByCity && (
                <button
                  onClick={() => setFilterByCity(false)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F9D8C] hover:bg-[#0C8577] text-white px-4 py-2 text-xs font-semibold transition-colors cursor-pointer active:scale-[0.97]"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Show all nationwide doctors
                </button>
              )}
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#1C2338] px-4 py-2 text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#263049] transition-colors cursor-pointer active:scale-[0.97]"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

