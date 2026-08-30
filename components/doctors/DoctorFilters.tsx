"use client";

import { FilterChip } from "@/components/doctors/FilterChip";
import { DOCTOR_SPECIALTIES } from "@/lib/specialties";

interface DoctorFiltersProps {
  specialty: string;
  setSpecialty: (spec: string) => void;
  availability: "any-time" | "today" | "this-week";
  setAvailability: (avail: "any-time" | "today" | "this-week") => void;
  rating: "all" | "4.8" | "4.9";
  setRating: (rating: "all" | "4.8" | "4.9") => void;
}

export function DoctorFilters({
  specialty,
  setSpecialty,
  availability,
  setAvailability,
  rating,
  setRating,
}: DoctorFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-900/5">
      {/* Specialty Filters */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Specialty</span>
        <div className="flex flex-wrap gap-1.5">
          {["All", ...DOCTOR_SPECIALTIES].map((spec) => (
            <FilterChip
              key={spec}
              id={`filter-specialty-${spec.toLowerCase().replace(" ", "-")}`}
              label={spec}
              active={specialty === spec}
              onClick={() => setSpecialty(spec)}
            />
          ))}
        </div>
      </div>

      {/* Availability & Rating Filters */}
      <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Availability</span>
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
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rating</span>
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
