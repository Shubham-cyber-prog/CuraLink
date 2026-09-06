"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Filter, RefreshCw, ChevronLeft, MapPin, AlertCircle, Sparkles } from "lucide-react";
import { MOCK_DOCTORS, Doctor } from "@/lib/mock-data";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { DoctorFilters } from "@/components/doctors/DoctorFilters";
import { LocationInfo } from "@/components/layout/LocationSelector";

export default function FindDoctorPage() {
  const router = useRouter();

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

  useEffect(() => {
    const token =
      localStorage.getItem("curalink_token") ??
      sessionStorage.getItem("curalink_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [router]);

  const handleClearFilters = () => {
    setSearch("");
    setSpecialty("All");
    setAvailability("any-time");
    setRating("all");
    setVisitType("all");
  };

  const filteredDoctors = useMemo(() => {
    return MOCK_DOCTORS.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(search.toLowerCase());
      const matchesSpecialty = specialty === "All" || doc.specialty === specialty;
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
        // In-person filtering by proximity (Hisar/Delhi/General/Pediatrics local)
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
  }, [search, specialty, availability, rating, visitType, userLocation]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0F9D8C] mb-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>Browsing doctors near {userLocation.city}, {userLocation.state}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Find & Book Doctors
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Browse top-rated licensed clinicians for video calls & in-person appointments.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 self-start sm:self-auto">
          <Sparkles className="h-3.5 w-3.5 text-[#0F9D8C]" />
          <span>Verified Medical Practitioners</span>
        </div>
      </div>

      {/* Location Availability Notice banner */}
      <div className="rounded-2xl border border-teal-200/80 bg-teal-50/60 p-4 text-xs font-medium text-teal-900 flex items-start gap-3">
        <MapPin className="h-4 w-4 text-[#0F9D8C] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-[#0F172A]">
            Location-Refined Availability for {userLocation.city}
          </p>
          <p className="text-[#64748B] mt-0.5">
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
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-28 rounded-2xl border border-[#E2E8F0] bg-white animate-pulse"
              />
            ))}
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="space-y-3">
            {filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                userCity={userLocation.city}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] bg-white p-8 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">
              No in-person doctors available in {userLocation.city} for this filter
            </h3>
            <p className="max-w-md text-xs text-[#64748B]">
              In-person appointments for this specialty are not available in {userLocation.city} yet. However, 24/7 video consultations are available nationwide!
            </p>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
