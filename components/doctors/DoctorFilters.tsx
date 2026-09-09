"use client";

import React, { useState, useEffect } from "react";
import { FilterChip } from "@/components/doctors/FilterChip";
import { MapPin, Video, UserCheck } from "lucide-react";
import { LocationInfo } from "@/components/layout/LocationSelector";

interface DoctorFiltersProps {
  specialty: string;
  setSpecialty: (spec: string) => void;
  availability: "any-time" | "today" | "this-week";
  setAvailability: (avail: "any-time" | "today" | "this-week") => void;
  rating: "all" | "4.8" | "4.9";
  setRating: (rating: "all" | "4.8" | "4.9") => void;
  visitType?: "all" | "video" | "in-person";
  setVisitType?: (type: "all" | "video" | "in-person") => void;
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
}: DoctorFiltersProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo>({
    city: "Hisar",
    state: "Haryana",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("curalink_user_location");
      if (saved) setSelectedLocation(JSON.parse(saved));
    } catch (e) {}

    const handleLocationChange = (e: any) => {
      if (e.detail) setSelectedLocation(e.detail);
    };
    window.addEventListener("curalink-location-changed", handleLocationChange);
    return () =>
      window.removeEventListener("curalink-location-changed", handleLocationChange);
  }, []);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-5 shadow-xs dark:shadow-black/20 transition-colors duration-200">
      {/* Active Location bar indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#263049] pb-3 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
          <MapPin className="h-4 w-4 text-[#0F9D8C] dark:text-[#14B8A6]" />
          <span>Active Location: {selectedLocation.city}, {selectedLocation.state}</span>
        </div>
        <span className="text-[#64748B] dark:text-[#94A3B8]">
          Video calls nationwide • In-person visits near {selectedLocation.city}
        </span>
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
