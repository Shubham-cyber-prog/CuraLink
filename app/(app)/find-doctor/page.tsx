"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Search,
  MapPin,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Video,
  Building2,
  Stethoscope,
  SlidersHorizontal,
  X,
  CheckCircle2,
  ArrowUpDown,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Doctor } from "@/types/doctor";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { LocationInfo, LocationSelector } from "@/components/layout/LocationSelector";
import { Skeleton } from "@/components/ui/Skeleton";
import { AIDoctorRecommender } from "@/components/ai/AIDoctorRecommender";

const SPECIALTIES = [
  "All",
  "General Practice",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Neurology",
  "Psychiatry",
];

type SortMode = "recommended" | "fee-low" | "rating-high";

export default function FindDoctorPage() {
  const shouldReduceMotion = useReducedMotion();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [availability, setAvailability] = useState<"any-time" | "today" | "this-week">("any-time");
  const [rating, setRating] = useState<"all" | "4.8" | "4.9">("all");
  const [visitType, setVisitType] = useState<"all" | "video" | "in-person">("all");
  const [sortBy, setSortBy] = useState<SortMode>("recommended");
  const [filterByCity, setFilterByCity] = useState(false);
  const [usedNationwideFallback, setUsedNationwideFallback] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
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
        if (parsed?.city) {
          setUserLocation(parsed);
        }
      }
    } catch {
      // Ignore storage error
    }

    const handleLoc = (e: Event) => {
      const custom = e as CustomEvent<LocationInfo>;
      if (custom.detail?.city) {
        setUserLocation(custom.detail);
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
        setUsedNationwideFallback(false);

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

        const list: Doctor[] = Array.isArray(json.data) ? json.data : [];

        // Smart nationwide fallback so users NEVER hit a dead-end empty page for smaller cities
        if (shouldFilter && list.length === 0) {
          const allRes = await fetch(`${apiBase}/doctors`);
          const allJson = await allRes.json();
          if (allRes.ok && allJson.success && Array.isArray(allJson.data) && allJson.data.length > 0) {
            setDoctors(allJson.data);
            setUsedNationwideFallback(true);
            return;
          }
        }

        setDoctors(list);
      } catch (err: any) {
        console.error("Error fetching verified doctors:", err);
        setError(err?.message || "Could not load verified specialists. Please retry.");
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
    setSortBy("recommended");
    setFilterByCity(false);
  };

  const hasActiveFilters =
    Boolean(search.trim()) ||
    specialty !== "All" ||
    availability !== "any-time" ||
    rating !== "all" ||
    visitType !== "all" ||
    filterByCity;

  const filteredDoctors = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = doctors.filter((doc) => {
      const matchesSearch =
        !q ||
        doc.name.toLowerCase().includes(q) ||
        (doc.specialty || "").toLowerCase().includes(q) ||
        (doc.specialization || "").toLowerCase().includes(q) ||
        (doc.city || "").toLowerCase().includes(q) ||
        (doc.hospitalName || "").toLowerCase().includes(q) ||
        (doc.clinicAddress || "").toLowerCase().includes(q) ||
        (doc.bio || "").toLowerCase().includes(q);

      const matchesSpecialty =
        specialty === "All" ||
        (doc.specialty || "").toLowerCase().includes(specialty.toLowerCase()) ||
        (doc.specialization || "").toLowerCase().includes(specialty.toLowerCase());

      const matchesAvailability =
        availability === "any-time" ||
        (availability === "today" && doc.availability === "today") ||
        (availability === "this-week" &&
          (doc.availability === "today" || doc.availability === "this-week"));

      const matchesRating =
        rating === "all" || (doc.rating != null && Number(doc.rating) >= parseFloat(rating));

      let matchesVisitMode = true;
      if (visitType === "video") {
        matchesVisitMode = Array.isArray(doc.consultationModes)
          ? doc.consultationModes.includes("VIDEO")
          : doc.videoConsultation !== false;
      } else if (visitType === "in-person") {
        matchesVisitMode =
          Boolean(doc.inPersonConsultation) ||
          (Array.isArray(doc.consultationModes) && doc.consultationModes.includes("IN_PERSON"));
      }

      return matchesSearch && matchesSpecialty && matchesAvailability && matchesRating && matchesVisitMode;
    });

    if (sortBy === "fee-low") {
      return [...list].sort((a, b) => (a.consultationFee ?? 9999) - (b.consultationFee ?? 9999));
    }
    if (sortBy === "rating-high") {
      return [...list].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    }
    return list;
  }, [doctors, search, specialty, availability, rating, visitType, sortBy]);

  return (
    <div className="space-y-6">
      {/* ── BRANDED HERO SEARCH & QUICK-START BANNER ── */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#071525] via-[#0B283C] to-[#006D77] p-6 sm:p-8 text-white shadow-[0_18px_46px_-14px_rgba(11,31,51,0.42)] border border-white/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-[#83C5BE]/20 blur-3xl"
        />

        <div className="relative space-y-5">
          {/* Title Row + Simple 3-Step Booking Guide */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/12 border border-white/15 px-3 py-1 text-[11px] font-medium text-[#83C5BE]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>NMC Verified Specialists &bull; Instant Confirmation</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-[-0.015em] text-white">
                Find &amp; Book a Specialist
              </h1>
              <p className="text-xs sm:text-sm text-white/75 max-w-xl">
                Search verified doctors for HD Video Consultations or in-person clinic visits with upfront fees.
              </p>
            </div>

            {/* Crystal-Clear 3-Step Guide so every user knows how booking works */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-white/85">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 border border-white/10 px-3 py-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#83C5BE] text-[#0B1F33] text-[10px] font-bold">
                  1
                </span>
                Choose Doctor
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 border border-white/10 px-3 py-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#83C5BE] text-[#0B1F33] text-[10px] font-bold">
                  2
                </span>
                Pick Time Slot
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 border border-white/10 px-3 py-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#83C5BE] text-[#0B1F33] text-[10px] font-bold">
                  3
                </span>
                Pay &amp; Confirm
              </span>
            </div>
          </div>

          {/* Unified Single Search Bar + Location Scope + Symptom Matcher Trigger */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 rounded-[22px] bg-white p-2 shadow-lg">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search doctor, hospital (Apollo, Fortis, Max, Medanta), or specialty..."
                className="w-full rounded-full bg-transparent pl-10 pr-8 py-2.5 text-sm text-[#0B1F33] placeholder:text-slate-400 focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="hidden md:block h-7 w-px bg-slate-200" />

            {/* Clean Single Location Control */}
            <div className="flex flex-wrap items-center gap-2 px-1.5 md:px-0">
              <LocationSelector
                value={userLocation}
                onChange={(loc) => {
                  setUserLocation(loc);
                  setFilterByCity(true);
                }}
                id="doctor-filter-location-btn"
              />

              <button
                type="button"
                onClick={() => setFilterByCity((prev) => !prev)}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  filterByCity
                    ? "bg-[#006D77]/10 text-[#006D77] border border-[#006D77]/25"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200/70"
                }`}
              >
                {filterByCity ? `${userLocation.city} Only` : "All India (24×7 Video)"}
              </button>

              <button
                type="button"
                onClick={() => setShowAssistant((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  showAssistant
                    ? "bg-[#0B1F33] text-white"
                    : "bg-[#006D77] hover:bg-[#005860] text-white shadow-sm"
                }`}
              >
                <Stethoscope className="h-3.5 w-3.5" />
                <span>{showAssistant ? "Hide Helper" : "Not sure? Match by Symptoms"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── OPTIONAL EXPANDABLE SPECIALTY HELPER (Collapsed by default so doctors stay above the fold!) ── */}
      <AnimatePresence>
        {showAssistant && (
          <AIDoctorRecommender
            onSelectSpecialty={(matched) => {
              setSpecialty(matched);
              setShowAssistant(false);
            }}
            onClose={() => setShowAssistant(false)}
          />
        )}
      </AnimatePresence>

      {/* ── COMPACT, CRYSTAL-CLEAR FILTER STRIP ── */}
      <section className="rounded-[22px] border border-slate-200/75 dark:border-white/[0.08] bg-white dark:bg-[#0B1F33] p-4 shadow-[0_2px_16px_-6px_rgba(11,31,51,0.05)] space-y-3.5">
        {/* Row 1: Specialty Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {SPECIALTIES.map((spec) => {
            const active = specialty === spec;
            return (
              <button
                key={spec}
                type="button"
                id={`filter-specialty-${spec.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setSpecialty(spec)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  active
                    ? "bg-[#006D77] text-white shadow-xs"
                    : "bg-[#F4F7F8] dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-white/[0.12] hover:text-[#0B1F33] dark:hover:text-white"
                }`}
              >
                {spec}
              </button>
            );
          })}
        </div>

        {/* Row 2: Mode + Availability + Rating + Sort + Live Count */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.07]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
              <SlidersHorizontal className="h-3 w-3" /> Filters:
            </span>

            {/* Consultation Mode */}
            <div className="inline-flex rounded-full bg-[#F4F7F8] dark:bg-white/[0.06] p-0.5">
              {[
                { id: "all", label: "All Modes" },
                { id: "video", label: "Video Call", icon: Video },
                { id: "in-person", label: "Clinic", icon: Building2 },
              ].map((m) => {
                const active = visitType === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setVisitType(m.id as any)}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? "bg-white dark:bg-[#006D77] text-[#0B1F33] dark:text-white shadow-2xs"
                        : "text-slate-500 dark:text-slate-300 hover:text-[#0B1F33] dark:hover:text-white"
                    }`}
                  >
                    {Icon && <Icon className="h-3 w-3" />}
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Availability Quick Toggle */}
            <button
              type="button"
              onClick={() => setAvailability(availability === "today" ? "any-time" : "today")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${
                availability === "today"
                  ? "border-[#006D77] bg-[#006D77]/10 text-[#006D77] dark:text-[#83C5BE]"
                  : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05]"
              }`}
            >
              Available Today
            </button>

            {/* Rating Quick Toggle */}
            <button
              type="button"
              onClick={() => setRating(rating === "4.8" ? "all" : "4.8")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${
                rating === "4.8"
                  ? "border-[#006D77] bg-[#006D77]/10 text-[#006D77] dark:text-[#83C5BE]"
                  : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05]"
              }`}
            >
              4.8+ Rated
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>

          {/* Right: Sort & Results Counter */}
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isLoading ? "Loading specialists..." : `${filteredDoctors.length} verified doctor${filteredDoctors.length === 1 ? "" : "s"}`}
            </span>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-[#F4F7F8] dark:bg-white/[0.05] px-3 py-1 text-xs">
              <ArrowUpDown className="h-3 w-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortMode)}
                aria-label="Sort doctors"
                className="bg-transparent font-semibold text-[#0B1F33] dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="recommended" className="text-slate-900">Recommended</option>
                <option value="fee-low" className="text-slate-900">Fee: Low to High</option>
                <option value="rating-high" className="text-slate-900">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Friendly Nationwide Fallback Info (only shown if selected city had 0 clinics) */}
      {usedNationwideFallback && !isLoading && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#006D77]/20 dark:border-[#83C5BE]/20 bg-[#006D77]/[0.06] dark:bg-[#83C5BE]/10 px-4 py-3 text-xs text-[#0B1F33] dark:text-slate-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#006D77] dark:text-[#83C5BE] shrink-0" />
            <span>
              No local clinic listed in <strong>{userLocation.city}</strong> yet &mdash; showing verified nationwide specialists available for instant <strong>Video Consultation</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFilterByCity(false)}
            className="font-semibold text-[#006D77] dark:text-[#83C5BE] hover:underline cursor-pointer"
          >
            Keep All India View
          </button>
        </div>
      )}

      {/* ── DOCTOR DIRECTORY LISTINGS ── */}
      <div className="space-y-4">
        {error ? (
          <div className="flex flex-col items-center justify-center rounded-[24px] border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/30 p-8 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
              Unable to Load Specialists
            </h3>
            <p className="max-w-md text-xs text-rose-700 dark:text-rose-300">{error}</p>
            <button
              type="button"
              onClick={() => fetchDoctors(userLocation.city, filterByCity)}
              className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </button>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-[24px] border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0B1F33] p-6 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Skeleton className="h-20 w-20 rounded-[20px] shrink-0" />
                  <div className="space-y-2.5 flex-1 max-w-md">
                    <Skeleton className="h-5 w-48 rounded-lg" />
                    <Skeleton className="h-4 w-36 rounded-md" />
                    <Skeleton className="h-3.5 w-64 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-10 w-32 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="space-y-3.5">
            {filteredDoctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                {...(shouldReduceMotion
                  ? {}
                  : {
                      initial: { opacity: 0, y: 8 },
                      animate: { opacity: 1, y: 0 },
                      transition: {
                        duration: 0.22,
                        delay: Math.min(index * 0.04, 0.25),
                        ease: [0.16, 1, 0.3, 1],
                      },
                    })}
              >
                <DoctorCard doctor={doctor} userCity={userLocation.city} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-300 dark:border-white/15 bg-white dark:bg-[#0B1F33] p-10 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#006D77]/10 dark:bg-[#83C5BE]/15 text-[#006D77] dark:text-[#83C5BE]">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl text-[#0B1F33] dark:text-white">
              No doctors matched those filters
            </h3>
            <p className="max-w-md text-xs text-slate-500 dark:text-slate-400">
              Try clearing your filters or viewing all verified specialists available across India via Video Consultation.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#006D77] hover:bg-[#005860] text-white px-5 py-2.5 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Show All Verified Doctors
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
