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
    photoUrl: "/doctor-subham-nayak.jpg",
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
    photoUrl: "/doctor-priya-sharma.jpg",
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
    photoUrl: "/doctor-vikram-seth.jpg",
    availability: "Tomorrow · 09:00 AM",
    rating: 4.90,
    fee: "₹700",
  },
];

export function DoctorSpotlight() {
  return (
    <section className="py-20 sm:py-24 border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-[#006D77] dark:text-[#83C5BE]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>NMC-Verified Specialists</span>
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Consult top doctors{" "}
              <span className="font-serif italic font-normal text-[#006D77] dark:text-[#83C5BE]">
                from premier hospitals.
              </span>
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted leading-relaxed">
              Every practitioner is verified with active state medical registrations and premier institutional backgrounds.
            </p>
          </div>

          <Link
            href="/find-doctor"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#006D77] dark:text-[#83C5BE] hover:underline transition-colors shrink-0"
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
              className="group rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-[#0B1F33]/70 backdrop-blur-xl p-5.5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)] hover:border-teal-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
                  <Image
                    src={doc.photoUrl}
                    alt={doc.name}
                    fill
                    priority={index === 0}
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/90 dark:bg-[#0B1F33]/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-[#006D77] dark:text-[#83C5BE] border border-teal-500/20 shadow-xs">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span>NMC Verified</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {doc.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg">
                    <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
                    <span>{doc.rating}</span>
                  </div>
                </div>

                <p className="text-xs font-bold text-[#006D77] dark:text-[#83C5BE] mt-1">
                  {doc.specialty}
                </p>

                <p className="text-xs text-muted mt-1">
                  {doc.hospital} · {doc.experience}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-muted flex items-center gap-1 font-medium">
                    <Calendar className="h-3 w-3 text-[#006D77] dark:text-[#83C5BE]" />
                    {doc.availability}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                    {doc.fee} <span className="text-[11px] text-muted font-normal">/ visit</span>
                  </span>
                </div>

                <Link
                  href={`/find-doctor?doctor=${encodeURIComponent(doc.name)}`}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#006D77] to-[#0A8896] hover:from-[#005a63] hover:to-[#08727e] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-700/20 transition-all"
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
