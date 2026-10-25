"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Star, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const DOCTORS = [
  {
    id: "doc-1",
    name: "Dr. Subham Nayak, MD",
    specialty: "Internal Medicine & Chronic Care",
    experience: "12 yrs experience",
    hospital: "AIIMS New Delhi",
    photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=360&q=80",
    availability: "Today · 10:30 AM",
    rating: 4.92,
    fee: "₹600",
  },
  {
    id: "doc-2",
    name: "Dr. Priya Sharma, MD",
    specialty: "Endocrinology & Diabetes Care",
    experience: "9 yrs experience",
    hospital: "Apollo Hospitals",
    photoUrl: "https://images.unsplash.com/photo-1594824813568-154df6686e58?auto=format&fit=crop&w=360&q=80",
    availability: "Today · 11:15 AM",
    rating: 4.95,
    fee: "₹650",
  },
  {
    id: "doc-3",
    name: "Dr. Vikram Seth, MD",
    specialty: "Cardiology & Hypertension",
    experience: "15 yrs experience",
    hospital: "Fortis Escorts Heart Institute",
    photoUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=360&q=80",
    availability: "Tomorrow · 09:00 AM",
    rating: 4.90,
    fee: "₹700",
  },
];

export function DoctorSpotlight() {
  return (
    <section className="py-20 sm:py-24 border-b border-border bg-surface-elevated/40">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#006D77]">
              Verified Specialists
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Consult top doctors from premier hospitals.
            </h2>
            <p className="mt-2 text-base text-muted leading-relaxed">
              Every practitioner is NMC verified with proven clinical track records.
            </p>
          </div>

          <Link
            href="/find-doctor"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#006D77] hover:text-[#00565e] transition-colors"
          >
            <span>View all 380+ doctors</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {DOCTORS.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
              className="rounded-2xl border border-border bg-surface p-5 flex flex-col justify-between hover:border-[#83C5BE]/60 hover:shadow-[0_8px_30px_rgba(0,109,119,0.1)] transition-all"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden rounded-xl bg-muted/20 mb-4">
                  <Image
                    src={doc.photoUrl}
                    alt={doc.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-surface/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-[#006D77] border border-[#83C5BE]/30">
                    <CheckCircle2 className="h-3 w-3 text-[#006D77]" />
                    <span>NMC Verified</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground">
                    {doc.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
                    <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
                    <span>{doc.rating}</span>
                  </div>
                </div>

                <p className="text-xs font-semibold text-[#006D77] mt-0.5">
                  {doc.specialty}
                </p>

                <p className="text-xs text-muted mt-1">
                  {doc.hospital} · {doc.experience}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-muted flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-[#006D77]" />
                    {doc.availability}
                  </span>
                  <span className="text-xs font-bold text-foreground mt-0.5 block">
                    {doc.fee} <span className="text-[10px] text-muted font-normal">/ visit</span>
                  </span>
                </div>

                <Link
                  href={`/find-doctor?doctor=${encodeURIComponent(doc.name)}`}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#006D77] hover:bg-[#00565e] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:shadow-[0_0_12px_rgba(131,197,190,0.4)] transition-all"
                >
                  <span>Book Slot</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
