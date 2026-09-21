"use client";

import React, { useState, useEffect } from "react";
import { FilterChip } from "@/components/doctors/FilterChip";
import { MapPin, Video, UserCheck, Check, Sparkles } from "lucide-react";
import { LocationInfo, LocationSelector } from "@/components/layout/LocationSelector";

interface DoctorFiltersProps {
  specialty: string;
  setSpecialty: (spec: string) => void;
  availability: "any-time" | "today" | "this-week";
  setAvailability: (avail: "any-time" | "today" | "this-week") => void;
  rating: "all" | "4.8" | "4.9";
  setRating: (rating: "all" | "4.8" | "4.9") => void;
  visitType?: "all" | "video" | "in-person";
  setVisitType?: (type: "all" | "video" | "in-person") => void;
  userLocation?: LocationInfo;
  onLocationChange?: (loc: LocationInfo) => void;
  filterByCity?: boolean;
  setFilterByCity?: (filter: boolean) => void;
}

export function DoctorFilters({
  specialty,
  setSpecialty,
  availability,
  setAvailability,
  rating,
  setRating,
  visitType = "all",
  setVisitType,
  userLocation,
  onLocationChange,
  filterByCity = true,
  setFilterByCity,
}: DoctorFiltersProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo>(
    userLocation || {
      city: "Hisar",
      state: "Haryana",
    }
  );

  useEffect(() => {
    if (userLocation) {
      setSelectedLocation(userLocation);
    }
  }, [userLocation]);

  useEffect(() => {
    if (!userLocation) {
      try {
        const saved = localStorage.getItem("curalink_user_location");
        if (saved) setSelectedLocation(JSON.parse(saved));
      } catch (e) {}
    }

    const handleLocationChange = (e: any) => {
      if (e.detail) setSelectedLocation(e.detail);
    };
    window.addEventListener("curalink-location-changed", handleLocationChange);
    return () =>
      window.removeEventListener("curalink-location-changed", handleLocationChange);
  }, [userLocation]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-5 shadow-xs dark:shadow-black/20 transition-colors duration-200">
      {/* Interactive Location Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#263049] pb-3.5 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider text-[11px]">
            Target Location:
          </span>
          <LocationSelector
            value={selectedLocation}
            onChange={(loc) => {
              setSelectedLocation(loc);
              onLocationChange?.(loc);
            }}
            id="doctor-filter-location-btn"
          />

          <button
            type="button"
            onClick={() => {
              const btn = document.getElementById("doctor-filter-location-btn");
              btn?.click();
            }}
            className="rounded-xl border border-slate-200 dark:border-[#263049] bg-white dark:bg-[#1C2338] hover:bg-slate-50 dark:hover:bg-[#263049] px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Change City
          </button>

          {setFilterByCity && (
            <button
              onClick={() => setFilterByCity(!filterByCity)}
              className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                filterByCity
                  ? "bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[#0F9D8C] dark:text-[#14B8A6] hover:bg-teal-100 dark:hover:bg-teal-900/60"
                  : "bg-slate-100 dark:bg-[#1C2338] border border-slate-200 dark:border-[#263049] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]"
              }`}
            >
              {filterByCity ? `Filtering by ${selectedLocation.city} ✓` : "Show All Cities"}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {selectedLocation.isDetected && !selectedLocation.isConfirmed && (
            <span className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
              IP/Network Estimate
            </span>
          )}
          <span className="text-[#64748B] dark:text-[#94A3B8] text-[11px]">
            {filterByCity
              ? `Clinicians registered in ${selectedLocation.city}`
              : "Viewing all clinicians nationwide"}
          </span>
        </div>
      </div>


      {/* Specialty Filters */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
          Specialty
        </span>
        <div className="flex flex-wrap gap-1.5">
          {[
            "All",
            "General Practice",
            "Cardiology",
            "Dermatology",
            "Pediatrics",
            "Neurology",
            "Psychiatry",
          ].map((spec) => (
            <FilterChip
              key={spec}
              id={`filter-specialty-${spec.toLowerCase().replace(/\s+/g, "-")}`}
              label={spec}
              active={specialty === spec}
              onClick={() => setSpecialty(spec)}
            />
          ))}
        </div>
      </div>

      {/* Visit Type, Availability & Rating Filters */}
      <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-3">
        {setVisitType && (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Consultation Mode
            </span>
            <div className="flex flex-wrap gap-1.5">
              <FilterChip
                id="filter-type-all"
                label="All Modes"
                active={visitType === "all"}
                onClick={() => setVisitType("all")}
              />
              <FilterChip
                id="filter-type-video"
                label="Video Call"
                active={visitType === "video"}
                onClick={() => setVisitType("video")}
              />
              <FilterChip
                id="filter-type-inperson"
                label="In-Person / Home"
                active={visitType === "in-person"}
                onClick={() => setVisitType("in-person")}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
            Availability
          </span>
          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              id="filter-avail-any"
              label="Any time"
              active={availability === "any-time"}
              onClick={() => setAvailability("any-time")}
            />
            <FilterChip
              id="filter-avail-today"
              label="Today"
              active={availability === "today"}
              onClick={() => setAvailability("today")}
            />
            <FilterChip
              id="filter-avail-week"
              label="This week"
              active={availability === "this-week"}
              onClick={() => setAvailability("this-week")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
            Rating
          </span>
          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              id="filter-rating-all"
              label="All ratings"
              active={rating === "all"}
              onClick={() => setRating("all")}
            />
            <FilterChip
              id="filter-rating-48"
              label="4.8+ Stars"
              active={rating === "4.8"}
              onClick={() => setRating("4.8")}
            />
            <FilterChip
              id="filter-rating-49"
              label="4.9+ Stars"
              active={rating === "4.9"}
              onClick={() => setRating("4.9")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
