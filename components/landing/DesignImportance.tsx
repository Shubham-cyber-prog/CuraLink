"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Palette,
  HeartPulse,
  Sparkles,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Eye,
} from "lucide-react";

const DESIGN_PILLARS = [
  {
    icon: HeartPulse,
    badge: "CALM ARCHITECTURE",
    title: "Zero-Panic Cognitive Hierarchy",
    description:
      "When patients are sick, confusing interfaces induce panic. Our clinical color tokens, soothing teal accents, and progressive disclosure guide users with calm clarity.",
    interactiveType: "vitals",
    color: "text-[#0284C7] bg-sky-950/80 border-sky-500/30",
  },
  {
    icon: Sparkles,
    badge: "MICRO-INTERACTIONS",
    title: "Instant Diagnostic Feedback",
    description:
      "Every biometric submission, dosage confirmation, and slot booking triggers immediate micro-animation feedback—eradicating patient anxiety about whether their action was registered.",
    interactiveType: "feedback",
    color: "text-[#0F9D8C] bg-teal-950/80 border-teal-500/30",
  },
  {
    icon: Zap,
    badge: "PAN-INDIA OPTIMIZATION",
    title: "60 FPS Fluidity on 3G Networks",
    description:
      "Engineered with lightweight vector primitives and GPU-accelerated motion so patients in Tier-2 and rural India experience buttery smooth interactions without phone lag or battery drain.",
    interactiveType: "speed",
    color: "text-[#10B981] bg-emerald-950/80 border-emerald-500/30",
  },
  {
    icon: ShieldCheck,
    badge: "TRANSPARENT TELEMETRY",
    title: "Visual Trust & Privacy Feedback",
    description:
      "Cryptographic status, doctor NMC verification badges, and DPDP compliance indicators are visibly anchored in the interface—giving patients unmistakable assurance of medical dignity.",
    interactiveType: "trust",
    color: "text-cyan-400 bg-cyan-950/80 border-cyan-500/30",
  },
];

export function DesignImportance() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-[#090D16] text-[#F5F3EE] border-b border-teal-500/15">
      {/* Decorative background glows matching the logo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-1/4 h-80 w-80 rounded-full bg-[#0284C7]/10 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-10 h-72 w-72 rounded-full bg-[#0F9D8C]/15 blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-950/60 px-3.5 py-1 text-xs font-mono text-teal-300 shadow-xs"
          >
            <Palette className="h-3.5 w-3.5" />
            <span>[ 05 · Human-Centered Clinical Engineering ]</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#F5F3EE] leading-[1.1]"
          >
            Why UI design & motion architecture{" "}
            <em className="font-serif italic font-normal bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
              save lives
            </em>
            .
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-sans"
          >
            In telemedicine, interface quality is not superficial polish—it is clinical safety.
            Carefully crafted typography, purposeful micro-animations, and instant visual validation
            eliminate medication mistakes and restore patient dignity.
          </motion.p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {DESIGN_PILLARS.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative overflow-hidden rounded-3xl border border-teal-500/20 bg-white/[0.03] p-6 sm:p-8 hover:border-teal-400/50 hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300 backdrop-blur-sm"
            >
              {/* Header inside card */}
              <div className="flex items-start justify-between gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-xs transition-transform duration-300 group-hover:scale-105 ${pillar.color}`}
                >
                  <pillar.icon className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-teal-950/60 border border-teal-500/30 px-2.5 py-0.5 font-mono text-[10px] font-bold text-teal-300">
                  {pillar.badge}
                </span>
              </div>

              {/* Title & Body */}
              <h3 className="mt-5 font-serif text-2xl font-normal text-white">
                {pillar.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {pillar.description}
              </p>

              {/* Interactive Micro-UI Demo Widget inside Card */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-xs">
                {pillar.interactiveType === "vitals" && (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                      <span className="font-sans font-medium text-white">Cognitive Relief Index</span>
                    </div>
                    <span className="font-mono text-teal-300 font-bold">
                      -74% Patient Anxiety
                    </span>
                  </div>
                )}

                {pillar.interactiveType === "feedback" && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-sans">Instant Confirmation:</span>
                    <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-teal-300 bg-teal-950/70 border border-teal-500/30 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
                      <span>Dose 50mg Confirmed (0.2s)</span>
                    </div>
                  </div>
                )}

                {pillar.interactiveType === "speed" && (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Smartphone className="h-3.5 w-3.5 text-teal-400" />
                      <span className="font-sans">3G Render Speed:</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-white bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                      60.0 FPS · Zero Jitter
                    </span>
                  </div>
                )}

                {pillar.interactiveType === "trust" && (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Eye className="h-3.5 w-3.5 text-teal-400" />
                      <span className="font-sans">Live Cryptographic Proof:</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-teal-300 bg-teal-950/70 border border-teal-500/30 px-2.5 py-0.5 rounded-full">
                      TLS 1.3 · ZERO TRACKERS
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
