"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Filter, RefreshCw, ChevronLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MotionButton } from "@/components/motion/MotionButton";
import { staggerContainer } from "@/components/motion/variants";
import { MOCK_DOCTORS } from "@/lib/mock-data";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { DoctorFilters } from "@/components/doctors/DoctorFilters";
import { SearchBar } from "@/components/doctors/SearchBar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default function FindDoctorPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [availability, setAvailability] = useState<"any-time" | "today" | "this-week">("any-time");
  const [rating, setRating] = useState<"all" | "4.8" | "4.9">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("curalink_token") ?? sessionStorage.getItem("curalink_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [router]);

  const handleClearFilters = () => {
    setSearch("");
    setSpecialty("All");
    setAvailability("any-time");
    setRating("all");
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
        (availability === "this-week" && (doc.availability === "today" || doc.availability === "this-week"));
      const matchesRating = rating === "all" || doc.rating >= parseFloat(rating);
      return matchesSearch && matchesSpecialty && matchesAvailability && matchesRating;
    });
  }, [search, specialty, availability, rating]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-16 h-96 w-96 rounded-full bg-teal-300/10 blur-3xl" />
        <div className="absolute right-0 top-64 h-80 w-80 rounded-full bg-cyan-200/10 blur-3xl" />
      </div>

      <DashboardHeader />

      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-teal-700">
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="mt-4 flex flex-col gap-1">
          <div className="inline-flex items-center gap-1.5 self-start rounded-full border border-teal-200/80 bg-white/70 px-3 py-1 text-xs font-medium text-teal-800 shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Find Care
          </div>
          <h1 className="mt-3 text-3xl font-normal tracking-tight text-slate-900 sm:text-4xl">
            Book a <span className="font-display italic text-teal-800">Consultation</span>
          </h1>
          <p className="text-base text-slate-500">Browse available licensed clinicians and book your virtual visit.</p>
        </div>

        <div className="mt-8 space-y-4">
          <SearchBar id="doctor-search-input" value={search} onChange={setSearch} />
          <DoctorFilters
            specialty={specialty} setSpecialty={setSpecialty}
            availability={availability} setAvailability={setAvailability}
            rating={rating} setRating={setRating}
          />
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex animate-pulse flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-slate-100" />
                    <div className="space-y-2">
                      <div className="h-5 w-40 rounded bg-slate-100" /><div className="h-4 w-24 rounded bg-slate-100" /><div className="h-3.5 w-48 rounded bg-slate-100" />
                    </div>
                  </div>
                  <div className="h-10 w-28 rounded-xl bg-slate-100" />
                </div>
              ))}
            </div>
          ) : filteredDoctors.length > 0 ? (
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-4">
              {filteredDoctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50">
                <Filter className="h-6 w-6 text-slate-400" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">No doctors found</h3>
              <p className="mt-1 max-w-xs text-sm text-slate-500">Try adjusting your search query or filters.</p>
              <MotionButton className="mt-5">
                <Button id="clear-filters-btn" onClick={handleClearFilters} variant="outline">
                  <RefreshCw className="h-4 w-4" /> Clear filters
                </Button>
              </MotionButton>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
