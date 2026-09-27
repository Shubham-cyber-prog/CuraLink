"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Video,
  Lock,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const parallaxBgRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. GSAP Headline staggered lines reveal
      const lines = headlineRef.current?.querySelectorAll(".hero-line");
      if (lines && lines.length > 0) {
        gsap.fromTo(
          lines,
          { y: 60, opacity: 0, rotateX: -15 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 1.1,
            stagger: 0.16,
            ease: "power4.out",
            delay: 0.1,
          }
        );
      }

      // 2. Parallax background element scrub
      if (parallaxBgRef.current) {
        gsap.to(parallaxBgRef.current, {
          y: -120,
          opacity: 0.3,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // 3. Subtle Mockup scrub parallax
      if (mockupRef.current) {
        gsap.to(mockupRef.current, {
          y: 40,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92vh] flex items-center pt-28 pb-16 sm:pt-36 sm:pb-24 bg-[#0A0F0D] text-[#F5F3EE] overflow-hidden border-b border-white/10"
      aria-label="CuraLink Healthcare Platform"
    >
      {/* Background Architectural Grid & Subtle Depth Element (Parallax) */}
      <div
        ref={parallaxBgRef}
        className="pointer-events-none absolute inset-0 -top-20 z-0 flex items-center justify-center opacity-40"
      >
        <div className="h-[550px] w-[550px] rounded-full border border-emerald-500/10 bg-[#085041]/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:32px_32px] opacity-60" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        {/* Asymmetric Editorial Grid */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column (Cols 1-7): Large Asymmetric Editorial Typography */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Minimalist Clinical Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>[ 01 · Clinical Telehealth Architecture ]</span>
            </div>

            {/* GSAP Staggered Editorial Headline */}
            <h1
              ref={headlineRef}
              className="mt-6 font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[#F5F3EE] leading-[1.08]"
            >
              <span className="block overflow-hidden py-1">
                <span className="hero-line block">Where clinical rigor</span>
              </span>
              <span className="block overflow-hidden py-1">
                <span className="hero-line block">
                  meets <em className="font-serif italic font-normal text-emerald-300">editorial calm</em>.
                </span>
              </span>
            </h1>

            {/* Editorial Body Text */}
            <p className="mt-6 text-sm sm:text-base lg:text-lg text-[#F5F3EE]/70 max-w-xl leading-relaxed font-sans">
              A private telemedicine infrastructure designed for patient dignity. Direct consultations with board-verified specialists, structured pre-visit intake, and sovereign medical record custody.
            </p>

            {/* Asymmetric Action Cluster */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              {/* Primary CTA with sweep-fill hover effect */}
              <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  href="/find-doctor"
                  className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2 overflow-hidden rounded-full bg-[#085041] px-7 py-3.5 text-sm font-semibold text-white border border-emerald-400/40 shadow-sm transition-all hover:border-emerald-300"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-emerald-300" />
                    <span>Find a Physician</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-emerald-500/0 via-emerald-400/25 to-emerald-500/0 transition-transform duration-500 group-hover:translate-x-full" />
                </Link>
              </motion.div>

              {/* Secondary CTA */}
              <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  href="/symptom-checker"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-6 py-3.5 text-sm font-medium text-[#F5F3EE] transition-colors"
                >
                  <Activity className="h-4 w-4 text-emerald-400" />
                  <span>Explore Clinical Intake</span>
                </Link>
              </motion.div>
            </div>

            {/* Minimalist Proof Strip */}
            <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 sm:gap-8 w-full max-w-lg">
              <div>
                <p className="font-mono text-xs text-white/50">&lt; 60s</p>
                <p className="text-xs font-medium text-white/90 mt-0.5">Specialist Routing</p>
              </div>
              <div>
                <p className="font-mono text-xs text-emerald-400">100%</p>
                <p className="text-xs font-medium text-white/90 mt-0.5">Encrypted Transit</p>
              </div>
              <div>
                <p className="font-mono text-xs text-white/50">MD / DO</p>
                <p className="text-xs font-medium text-white/90 mt-0.5">Verified Standing</p>
              </div>
            </div>
          </div>

          {/* Right Column (Cols 8-12): Offset Clinical Interaction Showcase */}
          <div ref={mockupRef} className="lg:col-span-5 relative mt-8 lg:mt-0">
            {/* Subtle glow border card container */}
            <div className="relative rounded-3xl border border-white/15 bg-white/[0.03] p-5 sm:p-6 backdrop-blur-md shadow-2xl">
              {/* Header Status Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-white/90">
                    Active Telehealth Room
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/50">
                  <Lock className="h-3 w-3 text-emerald-400" />
                  <span>1080p WebRTC · TLS 1.3</span>
                </div>
              </div>

              {/* Physician Showcase Card */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/20 bg-slate-800">
                    <Image
                      src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=240&q=80"
                      alt="Dr. Priya Sharma"
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="56px"
                    />
                    <span className="absolute bottom-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <CheckCircle2 className="h-2.5 w-2.5 stroke-[3]" />
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-white truncate">
                        Dr. Priya Sharma, MD
                      </h2>
                      <span className="text-[11px] text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                        Available
                      </span>
                    </div>
                    <p className="text-xs text-white/60 mt-0.5">
                      Internal Medicine &amp; Preventative Care
                    </p>
                    <p className="text-[11px] font-mono text-white/40 mt-1">
                      12 yrs clinical practice · Apollo Hospitals Fellow
                    </p>
                  </div>
                </div>

                {/* Available Slot Chips */}
                <div className="mt-4 pt-3.5 border-t border-white/10">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-white/50 mb-2">
                    Available Consult Slots Today
                  </p>
                  <div className="flex items-center gap-2">
                    {["10:30 AM", "11:15 AM", "02:00 PM"].map((slot, i) => (
                      <button
                        key={slot}
                        type="button"
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-mono text-center transition-all ${
                          i === 0
                            ? "bg-[#085041] text-white border border-emerald-400/50 shadow-xs"
                            : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Offset Overlay Pill: Instant Audio/Video Consultation Session */}
              <div className="mt-3.5 flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-white/5 text-xs text-white/80">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                    <Video className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Browser Telehealth Room</p>
                    <p className="text-[10px] text-white/50">Zero downloads required · Encrypted</p>
                  </div>
                </div>
                <Link
                  href="/find-doctor"
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <span>Connect</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
