"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Star, Calendar, ShieldCheck, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface DoctorData {
  id: string;
  name: string;
  title: string;
  specialty: string;
  experience: string;
  affiliation: string;
  photoUrl: string;
  availability: string;
  rating: number;
}

const DOCTORS: DoctorData[] = [
  {
    id: "doc-1",
    name: "Dr. Subham Nayak, MD",
    title: "Chief of Clinical Practice",
    specialty: "Internal & Preventative Medicine",
    experience: "12+ yrs experience",
    affiliation: "All India Institute of Medical Sciences (AIIMS)",
    photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=360&q=80",
    availability: "Today · 10:30 AM",
    rating: 4.9,
  },
  {
    id: "doc-2",
    name: "Dr. Priya Sharma, MD",
    title: "Lead Telehealth Clinician",
    specialty: "Primary Care & Urgent Medicine",
    experience: "9+ yrs experience",
    affiliation: "Apollo Hospitals & Health Sciences",
    photoUrl: "https://images.unsplash.com/photo-1594824813568-154df6686e58?auto=format&fit=crop&w=360&q=80",
    availability: "Today · 11:15 AM",
    rating: 4.95,
  },
  {
    id: "doc-3",
    name: "Dr. Vikram Seth, MD",
    title: "Senior Cardiovascular Fellow",
    specialty: "Cardiology & Vascular Wellness",
    experience: "15+ yrs experience",
    affiliation: "Fortis Escorts Heart Institute",
    photoUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=360&q=80",
    availability: "Tomorrow · 09:00 AM",
    rating: 4.92,
  },
  {
    id: "doc-4",
    name: "Dr. Ananya Sen, MD",
    title: "Pediatric Care Director",
    specialty: "Pediatrics & Adolescent Care",
    experience: "8+ yrs experience",
    affiliation: "Manipal Hospital Pediatrics",
    photoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=360&q=80",
    availability: "Today · 02:30 PM",
    rating: 4.98,
  },
];

export function EditorialDoctorDiscovery() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Stagger reveal on the doctor cards when scrolled into view
      gsap.fromTo(
        ".doctor-card",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="physicians"
      ref={sectionRef}
      className="relative bg-[#F5F3EE] text-[#0A0F0D] py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b border-[#0A0F0D]/10"
      aria-labelledby="physicians-heading"
    >
      <div className="mx-auto max-w-7xl">
        {/* Asymmetric Header Layout */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start mb-16 sm:mb-20">
          <div className="lg:col-span-7">
            <span className="font-mono text-xs uppercase tracking-widest text-[#085041] font-semibold">
              [ 03 · Verified Clinician Roster ]
            </span>
            <h2
              id="physicians-heading"
              ref={headlineRef}
              className="mt-4 font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#0A0F0D] leading-[1.1]"
            >
              Finding the right physician should feel like a{" "}
              <em className="font-serif italic font-normal text-[#085041]">reasoned conversation</em>,
              never a lottery.
            </h2>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between h-full pt-2">
            <p className="text-sm sm:text-base text-[#0A0F0D]/70 leading-relaxed font-sans">
              Every practitioner on CuraLink is rigorously credentialed, insured, and verified against national medical registries. No unaccredited assistants, no anonymous automated advice.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <Link
                href="/find-doctor"
                className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-semibold text-[#085041] hover:text-emerald-800 transition-colors"
              >
                <span>Browse Full Clinical Directory</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Staggered Editorial Doctor Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {DOCTORS.map((doc) => (
            <motion.div
              key={doc.id}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.25 }}
              className="doctor-card group flex flex-col justify-between rounded-3xl border border-[#0A0F0D]/10 bg-white p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-[#085041]/40 transition-all duration-300"
            >
              <div>
                {/* Doctor Headshot & Status Badge */}
                <div className="relative mb-5">
                  <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-neutral-200">
                    <Image
                      src={doc.photoUrl}
                      alt={doc.name}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-sm px-2.5 py-1 text-[10px] font-mono font-medium text-[#085041] shadow-xs border border-[#0A0F0D]/5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span>Verified MD</span>
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl font-normal text-[#0A0F0D] group-hover:text-[#085041] transition-colors">
                      {doc.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-[#0A0F0D]/70">
                      <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
                      <span>{doc.rating}</span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-[#085041]">
                    {doc.specialty}
                  </p>

                  <p className="text-[11px] text-[#0A0F0D]/50 leading-relaxed font-sans line-clamp-2">
                    {doc.affiliation} · {doc.experience}
                  </p>
                </div>
              </div>

              {/* Card Footer: Next Available & Action */}
              <div className="mt-6 pt-4 border-t border-[#0A0F0D]/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#0A0F0D]/40">
                    Earliest Slot
                  </p>
                  <p className="text-xs font-mono font-medium text-[#0A0F0D]">
                    {doc.availability}
                  </p>
                </div>

                <Link
                  href={`/find-doctor?doctor=${encodeURIComponent(doc.name)}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#085041] text-white hover:bg-emerald-800 transition-colors shadow-xs"
                  aria-label={`Book with ${doc.name}`}
                >
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
