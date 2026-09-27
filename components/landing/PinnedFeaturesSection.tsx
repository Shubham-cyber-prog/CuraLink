"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Activity,
  Video,
  HeartPulse,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";

interface FeatureCard {
  number: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Activity;
  previewWidget: React.ReactNode;
}

export function PinnedFeaturesSection() {
  const pinSectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    // Only apply horizontal pin on desktop viewports (>= 1024px) for optimal ergonomics
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      if (!pinSectionRef.current || !trackRef.current) return;

      const track = trackRef.current;
      const totalScrollWidth = track.scrollWidth - window.innerWidth + 120;

      gsap.to(track, {
        x: -totalScrollWidth,
        ease: "none",
        scrollTrigger: {
          trigger: pinSectionRef.current,
          pin: true,
          scrub: 1,
          start: "top top",
          end: `+=${totalScrollWidth * 1.2}`,
          invalidateOnRefresh: true,
        },
      });
    });

    return () => mm.revert();
  }, []);

  const FEATURES: FeatureCard[] = [
    {
      number: "01",
      badge: "Clinical Triage Engine",
      title: "AI Symptom Intelligence",
      subtitle: "Structured intake before physician handoff",
      description:
        "Unlike conversational chatbots, our clinical triage asks targeted protocol-driven questions regarding onset, duration, and severity, generating a standardized dossier for your doctor.",
      icon: Activity,
      previewWidget: (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-emerald-400">STATUS: INTAKE_COMPLETE</span>
            <span className="text-white/40">PROTOCOL #418</span>
          </div>
          <div className="space-y-1.5 text-white/80">
            <p className="text-[11px] text-white/40">PRIMARY CHIEF COMPLAINT</p>
            <p className="font-sans text-sm text-white font-medium">Acute episodic migraine with light sensitivity</p>
            <div className="mt-2 flex items-center gap-2 text-[11px]">
              <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                Severity: Moderate (5/10)
              </span>
              <span className="bg-white/10 text-white/70 px-2 py-0.5 rounded">
                Onset: 48h duration
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: "02",
      badge: "Browser Telehealth",
      title: "Encrypted Video Rooms",
      subtitle: "Direct physician consultations with zero downloads",
      description:
        "Instant HD WebRTC video rooms generated per appointment. Complete with in-room audio diagnostics, instant e-prescription routing, and end-to-end encrypted medical privilege.",
      icon: Video,
      previewWidget: (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">Direct Peer Connection</span>
            </div>
            <span className="font-mono text-[10px] text-white/40">TLS 1.3 · 1080p</span>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white">Dr. Vikram Seth, MD</p>
              <p className="text-[11px] text-emerald-300">Consultation in progress · 14:22</p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-500/20 px-2 py-1 rounded">
              Encrypted
            </span>
          </div>
        </div>
      ),
    },
    {
      number: "03",
      badge: "Biomarker Telemetry",
      title: "Continuous Vitals Monitoring",
      subtitle: "Longitudinal health signals and alert thresholds",
      description:
        "Track blood pressure, resting heart rate, and medication schedules over time. Your care team receives automated clinical alerts when vital trends drift outside safe thresholds.",
      icon: HeartPulse,
      previewWidget: (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
            <span className="font-mono text-white/50 text-[10px] uppercase">Cardiovascular Trendline</span>
            <span className="text-emerald-400 font-mono text-[11px]">Normal Range</span>
          </div>
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
              <p className="text-[10px] text-white/40">BLOOD PRESSURE</p>
              <p className="text-base font-bold text-white mt-0.5">118 / 78</p>
              <p className="text-[10px] text-emerald-300 mt-0.5">Optimal systolic</p>
            </div>
            <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
              <p className="text-[10px] text-white/40">RESTING HR</p>
              <p className="text-base font-bold text-white mt-0.5">64 bpm</p>
              <p className="text-[10px] text-white/50 mt-0.5">Steady rhythm</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: "04",
      badge: "Preventative Analytics",
      title: "Clinical Risk Stratification",
      subtitle: "Early warnings before acute complications arise",
      description:
        "Algorithmic risk evaluation cross-referencing your consultation notes, lab results, and familial history to identify preventative interventions and timely screening schedules.",
      icon: TrendingUp,
      previewWidget: (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
            <span className="font-mono text-white/50 text-[10px] uppercase">Preventative Care Schedule</span>
            <span className="text-emerald-400 font-mono text-[11px]">Up to Date</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
              <span className="text-white">Annual Lipid Panel</span>
              <span className="text-emerald-400 font-mono text-[11px]">✓ Scheduled</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
              <span className="text-white">Seasonal Vaccination</span>
              <span className="text-white/50 font-mono text-[11px]">Completed</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section
      id="capabilities"
      ref={pinSectionRef}
      className="relative bg-[#0A0F0D] text-[#F5F3EE] py-20 lg:py-28 overflow-hidden border-b border-white/10"
      aria-label="Core Clinical and AI Capabilities"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12 lg:mb-16">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-emerald-400 mb-3">
              <span>[ 02 · Integrated Architecture ]</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#F5F3EE]">
              Four pillars of <em className="italic text-emerald-300 font-normal">clinical precision</em>.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-white/60 leading-relaxed max-w-xl">
              From the moment symptoms emerge to longitudinal recovery, CuraLink orchestrates your entire healthcare continuum with zero friction.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-white/40">
            <span>SCROLL TO EXPLORE ARCHITECTURE</span>
            <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Horizontal Track Container */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div
          ref={trackRef}
          className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:w-max"
        >
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.number}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="w-full lg:w-[460px] flex-shrink-0 flex flex-col justify-between rounded-3xl border border-white/15 bg-white/[0.03] p-7 sm:p-8 backdrop-blur-sm shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-xs font-bold tracking-widest text-emerald-400">
                      {item.number}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-white/60 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                      {item.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-serif text-2xl font-normal text-white">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs font-semibold text-emerald-300/90 mb-3">
                    {item.subtitle}
                  </p>

                  <p className="text-xs text-white/60 leading-relaxed mb-6 font-sans">
                    {item.description}
                  </p>
                </div>

                <div>
                  {item.previewWidget}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
