"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  Users,
  CheckCircle2,
  Lock,
  Sparkles,
  Star,
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Activity,
  Heart,
  Flame,
  Volume2,
  Calendar,
  AlertCircle,
  Thermometer,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThreeHeroCanvas } from "@/components/landing/ThreeHeroCanvas";

export function Hero() {
  // Live Countdown Discount Timer State (e.g., starts at 2h 45m 30s)
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 18 });

  // Interactive WebRTC Consultation Stage State
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [callDuration, setCallDuration] = useState(262); // 04:22 in seconds
  const [heartRate, setHeartRate] = useState(72);
  const [activeTelemetryTab, setActiveTelemetryTab] = useState<"vitals" | "notes">("vitals");
  const [selectedSlot, setSelectedSlot] = useState("10:30 AM");

  // Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // WebRTC Call duration counter & slight vitals pulse fluctuation
  useEffect(() => {
    const callTimer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
      // Subtle natural heart rate variance between 71 and 74 bpm
      setHeartRate((prev) => 72 + Math.floor(Math.sin(Date.now() / 2000) * 2));
    }, 1000);
    return () => clearInterval(callTimer);
  }, []);

  const formatCallTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <section className="relative pt-36 sm:pt-44 md:pt-48 pb-20 sm:pb-28 overflow-hidden bg-background">
      {/* Real Interactive Three.js WebGL 3D DNA Double-Helix & Particle Field */}
      <ThreeHeroCanvas />

      {/* Subtle ambient glow behind hero copy */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,109,119,0.10),rgba(131,197,190,0.05),transparent_70%)]" />
      </div>

      {/* Floating Healthcare Badges (GSAP Scroll Parallax + Framer Motion Spring Float) */}
      <motion.div
        data-gsap-parallax="45"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="hidden xl:flex absolute top-52 left-10 items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/85 dark:bg-[#0B1F33]/85 backdrop-blur-xl px-4 py-2.5 shadow-xl z-20 pointer-events-none"
      >
        <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-900 dark:text-white">NMC Board Verified</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">100% Licensed Clinicians</p>
        </div>
      </motion.div>

      <motion.div
        data-gsap-parallax="65"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="hidden xl:flex absolute top-60 right-10 items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/85 dark:bg-[#0B1F33]/85 backdrop-blur-xl px-4 py-2.5 shadow-xl z-20 pointer-events-none"
      >
        <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-teal-500/15 text-[#006D77] dark:text-[#83C5BE]">
          <Clock className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-900 dark:text-white">&lt; 2 Mins Wait Time</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Instant Video Connect</p>
        </div>
      </motion.div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* ─── 1. TOP BADGES & SOCIAL PROOF ─── */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {/* Advertising ₹199 Discount Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-2xs"
            >
              <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>Introductory Consults at <strong>₹199</strong> (60% Off)</span>
            </motion.div>

            {/* Countdown Discount Timer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted shadow-2xs"
            >
              <Clock className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
              <span>Ends in:</span>
              <span className="font-mono font-bold text-foreground">
                {String(timeLeft.hours).padStart(2, "0")}h : {String(timeLeft.minutes).padStart(2, "0")}m : {String(timeLeft.seconds).padStart(2, "0")}s
              </span>
            </motion.div>
          </div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0B1F33] dark:text-white leading-[1.14]"
          >
            Clinical precision.{" "}
            <span className="font-serif italic font-normal text-[#006D77] dark:text-[#83C5BE]">
              Quiet care.
            </span>
            <span className="block mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold">
              Talk to India&apos;s top doctors{" "}
              <span className="text-[#006D77] dark:text-[#83C5BE]">in 2 minutes.</span>
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-5 text-base sm:text-lg text-muted max-w-2xl leading-relaxed"
          >
            Consult board-certified specialists for diabetes, heart health, pediatrics, and everyday sick visits.
            Browser-native HD video, real-time vitals monitoring, and instant verified prescriptions.
          </motion.p>

          {/* Trustpilot & 100k+ Patient Avatar Stack */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8"
          >
            {/* Avatar Stack */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5 overflow-hidden">
                {[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
                ].map((src, i) => (
                  <div
                    key={i}
                    className="relative h-8 w-8 rounded-full border-2 border-white dark:border-[#0B1F33] overflow-hidden"
                  >
                    <Image
                      src={src}
                      alt="Verified patient"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-left text-xs">
                <p className="font-bold text-foreground">100,000+ Patients</p>
                <p className="text-[11px] text-muted">Treated across 18+ Indian States</p>
              </div>
            </div>

            <div className="h-6 w-px bg-border hidden sm:block" />

            {/* Trustpilot 4.9/5 Rating */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-emerald-500 text-emerald-500"
                  />
                ))}
              </div>
              <div className="text-left">
                <span className="font-bold text-foreground">4.9 / 5</span>
                <span className="text-muted ml-1 text-[11px]">on Trustpilot (12,400+ reviews)</span>
              </div>
            </div>
          </motion.div>

          {/* Primary Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto"
          >
            <Link
              href="/find-doctor"
              className="group relative overflow-hidden inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#006D77] via-[#0D9488] to-[#0A8896] hover:from-[#005a63] hover:to-[#08727e] px-8 text-sm font-bold text-white shadow-lg shadow-teal-700/25 hover:shadow-xl hover:shadow-teal-700/35 transition-all duration-200"
            >
              {/* Shimmer light sweep */}
              <motion.span
                animate={{ x: ["-100%", "250%"] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
                className="pointer-events-none absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              />
              <span className="relative z-10">Consult Doctor for ₹199</span>
              <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/symptom-checker"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-slate-200/90 dark:border-white/[0.12] bg-white/70 dark:bg-[#0B1F33]/60 backdrop-blur-md px-7 text-sm font-semibold text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Sparkles className="h-4 w-4 text-[#006D77] dark:text-[#83C5BE]" />
              <span>AI Symptom Triage (Free)</span>
            </Link>
          </motion.div>
        </div>

        {/* ─── 2. INTERACTIVE SIMULATED WEBRTC CONSULTATION STAGE (GSAP 3D Scroll Scrub + Framer Motion) ─── */}
        <motion.div
          data-gsap-hero-stage
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.28 }}
          className="mt-14 sm:mt-18 max-w-5xl mx-auto will-change-transform"
        >
          <div className="rounded-3xl border border-border bg-[#0B1F33] text-white shadow-[0_28px_80px_rgba(11,31,51,0.38)] overflow-hidden">
            {/* Top WebRTC Stage Status Bar */}
            <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-[#071320] border-b border-white/10 gap-2">
              <div className="flex items-center gap-3">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-white/90">
                  Live WebRTC Clinical Session #MED-8842
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold">
                  <ShieldCheck className="h-3 w-3" />
                  E2E 256-Bit AES Encrypted
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-white/70">
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <span className="flex gap-0.5 items-end h-3">
                    <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full" />
                    <span className="w-0.5 h-2 bg-emerald-400 rounded-full" />
                    <span className="w-0.5 h-2.5 bg-emerald-400 rounded-full" />
                    <span className="w-0.5 h-3 bg-emerald-400 rounded-full" />
                  </span>
                  <span>HD 1080p · 60 FPS</span>
                </div>

                <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  <Clock className="h-3.5 w-3.5 text-[#83C5BE]" />
                  <span>Call Duration: <strong className="text-white">{formatCallTime(callDuration)}</strong></span>
                </div>
              </div>
            </div>

            {/* Video Consultation Main Grid */}
            <div className="grid lg:grid-cols-12 gap-0 relative">
              {/* Doctor Main Video Stream Area (8 cols) */}
              <div className="lg:col-span-8 relative aspect-video bg-slate-950 overflow-hidden flex items-center justify-center">
                {/* Doctor Video Poster / Local High-Res Photo Stream */}
                <Image
                  src="/doctor-consultation.jpg"
                  alt="Dr. Priya Sharma, MD - Live Consultation"
                  fill
                  priority
                  className="object-cover object-center opacity-95"
                />

                {/* Subtle dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#071320] via-transparent to-transparent opacity-80" />

                {/* Doctor Overlay Info & Live Audio Meters */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10">
                  <div className="flex items-center gap-3 bg-[#0B1F33]/90 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 shadow-lg">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#006D77] to-[#0A8896] flex items-center justify-center font-bold text-white text-xs shadow-xs ring-2 ring-teal-500/30">
                      Dr
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white tracking-tight">Dr. Priya Sharma, MD</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Speaking
                        </span>
                      </div>
                      <p className="text-[10px] text-white/75 mt-0.5">Endocrinologist · AIIMS Faculty (12 yrs exp)</p>
                    </div>

                    {/* LIVE AUDIO METERS (Fluctuating frequency bars) */}
                    <div className="ml-2 pl-3 border-l border-white/20 flex items-center gap-1.5" title="Real-time HD audio meter">
                      <Volume2 className="h-3.5 w-3.5 text-[#83C5BE]" />
                      <div className="flex items-end gap-0.5 h-4">
                        <span className="w-1 bg-[#83C5BE] rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3" />
                        <span className="w-1 bg-[#83C5BE] rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-4" />
                        <span className="w-1 bg-[#83C5BE] rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-2" />
                        <span className="w-1 bg-[#83C5BE] rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Patient Picture-in-Picture Stream (Bottom Right) */}
                  <div className="hidden sm:block relative w-36 h-26 rounded-2xl border-2 border-teal-500/40 overflow-hidden shadow-2xl bg-black ring-2 ring-black/40">
                    {isCamOff ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white/60">
                        <VideoOff className="h-5 w-5 mb-1 text-slate-400" />
                        <span className="text-[10px] font-medium">Camera Off</span>
                      </div>
                    ) : (
                      <Image
                        src="/patient-webcam.jpg"
                        alt="Patient preview"
                        fill
                        className="object-cover"
                      />
                    )}
                    <span className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-xs text-[10px] px-2 py-0.5 rounded-md text-white font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      You (HD)
                    </span>
                  </div>
                </div>

                {/* WebRTC Interactive Control Bar */}
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#0B1F33]/90 backdrop-blur-md border border-white/15 rounded-2xl p-1.5 z-10 shadow-lg">
                  <button
                    type="button"
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    className={`flex h-8.5 w-8.5 items-center justify-center rounded-xl text-xs transition-all cursor-pointer ${
                      isMicMuted ? "bg-red-500/80 text-white" : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                    title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
                  >
                    {isMicMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCamOff(!isCamOff)}
                    className={`flex h-8.5 w-8.5 items-center justify-center rounded-xl text-xs transition-all cursor-pointer ${
                      isCamOff ? "bg-red-500/80 text-white" : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                    title={isCamOff ? "Turn Camera On" : "Turn Camera Off"}
                  >
                    {isCamOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => alert("WebRTC Simulation: In a live consultation, this ends the session and instantly downloads your cryptographically signed prescription.")}
                    className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all cursor-pointer shadow-sm"
                    title="End Consultation"
                  >
                    <PhoneOff className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Live Clinical Telemetry & Slot Booker (4 cols) */}
              <div className="lg:col-span-4 p-5 sm:p-6 bg-[#071320] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-between">
                <div>
                  {/* Telemetry Tabs */}
                  <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTelemetryTab("vitals")}
                      className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                        activeTelemetryTab === "vitals"
                          ? "bg-gradient-to-r from-[#006D77] to-[#0A8896] text-white shadow-sm"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      Live Vitals
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTelemetryTab("notes")}
                      className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                        activeTelemetryTab === "notes"
                          ? "bg-gradient-to-r from-[#006D77] to-[#0A8896] text-white shadow-sm"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      Doctor Notes
                    </button>
                  </div>

                  {activeTelemetryTab === "vitals" ? (
                    <div className="mt-4 space-y-3">
                      {/* Heart Rate Metric */}
                      <div className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.04]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-white/70 font-medium">
                            <Heart className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
                            <span>Heart Rate (PPG)</span>
                          </span>
                          <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full">
                            Normal Sinus
                          </span>
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-mono font-extrabold text-white">{heartRate}</span>
                            <span className="text-xs text-white/60 font-mono">BPM</span>
                          </div>
                          {/* Mini Animated Cardiac SVG Line */}
                          <div className="w-28 h-6 overflow-hidden">
                            <svg className="w-full h-full text-[#83C5BE]" viewBox="0 0 100 20" fill="none">
                              <path
                                d="M 0 10 L 20 10 L 24 8 L 28 10 L 32 10 L 36 2 L 40 18 L 44 6 L 48 10 L 56 10 L 60 8 L 64 10 L 100 10"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* SpO2 & Blood Pressure Grid */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="p-3 rounded-2xl border border-white/10 bg-white/[0.04]">
                          <span className="text-[10px] text-white/60 uppercase font-semibold block">Blood Oxygen</span>
                          <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-2xl font-mono font-extrabold text-white">98%</span>
                            <span className="text-[10px] text-emerald-400 font-mono font-bold">SpO2</span>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">Room air saturation</span>
                        </div>

                        <div className="p-3 rounded-2xl border border-white/10 bg-white/[0.04]">
                          <span className="text-[10px] text-white/60 uppercase font-semibold block">Blood Pressure</span>
                          <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-2xl font-mono font-extrabold text-white">120/80</span>
                            <span className="text-[10px] text-white/60 font-mono">mmHg</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 mt-0.5 block">Normotensive</span>
                        </div>
                      </div>

                      {/* Temperature Metric */}
                      <div className="p-3 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-amber-400" />
                          <span className="text-xs text-white/80 font-medium">Core Temperature</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded-md">
                          98.4 °F (Afebrile)
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 p-4 rounded-2xl border border-white/10 bg-white/[0.04] text-xs text-white/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#83C5BE]" />
                          Clinical Assessment:
                        </span>
                        <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                          AIIMS Protocol
                        </span>
                      </div>
                      <p className="text-[11px] text-white/70 leading-relaxed">
                        Patient presenting with postprandial fatigue and elevated fasting glucose (128 mg/dL).
                        Initiating clinical management protocol.
                      </p>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[11px] space-y-1">
                        <p className="font-bold text-white">Prescribed:</p>
                        <p className="text-[#83C5BE] font-mono">• Tab. Metformin 500mg (Daily)</p>
                        <p className="text-[#83C5BE] font-mono">• HbA1c Lab Panel (Ordered)</p>
                      </div>
                      <div className="pt-2 border-t border-white/10 text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>NMC Digital Rx Ready (Cryptographically Signed)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Instant Consult Booking Action */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="text-white/80 font-medium">Available Slots Today:</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full">₹199 only</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3.5">
                    {["10:30 AM", "11:15 AM", "02:30 PM"].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 text-xs rounded-xl font-bold transition-all cursor-pointer ${
                          selectedSlot === slot
                            ? "bg-gradient-to-r from-[#006D77] to-[#0A8896] text-white shadow-sm ring-2 ring-[#83C5BE]/50"
                            : "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>

                  <Link
                    href={`/find-doctor?doctor=Dr.%20Priya%20Sharma&slot=${encodeURIComponent(selectedSlot)}`}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#006D77] via-[#0D9488] to-[#0A8896] hover:from-[#005a63] hover:to-[#08727e] py-3.5 px-4 text-xs sm:text-sm font-bold text-white shadow-lg shadow-teal-900/40 hover:shadow-teal-700/60 transition-all group"
                  >
                    <Calendar className="h-4 w-4 text-[#83C5BE] transition-transform group-hover:scale-110" />
                    <span>Confirm Consultation ({selectedSlot})</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
