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
      {/* Background ambient light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,109,119,0.09),rgba(131,197,190,0.05),transparent_70%)]" />
      </div>

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
            className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0B1F33] dark:text-white leading-[1.12]"
          >
            India&apos;s #1 Rated Telehealth Platform.{" "}
            <span className="text-[#006D77] dark:text-[#83C5BE]">
              Talk to a Doctor in 2 Minutes.
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
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto"
          >
            <Link
              href="/find-doctor"
              className="group inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#006D77] hover:bg-[#00565e] px-7 text-sm font-semibold text-white shadow-sm hover:shadow-[0_0_24px_rgba(131,197,190,0.5)] transition-all duration-200"
            >
              <span>Consult Doctor for ₹199</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/symptom-checker"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 text-sm font-medium text-foreground hover:bg-surface-elevated transition-colors"
            >
              <Sparkles className="h-4 w-4 text-[#006D77] dark:text-[#83C5BE]" />
              <span>AI Symptom Triage (Free)</span>
            </Link>
          </motion.div>
        </div>

        {/* ─── 2. INTERACTIVE SIMULATED WEBRTC CONSULTATION STAGE ─── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-14 sm:mt-18 max-w-5xl mx-auto"
        >
          <div className="rounded-3xl border border-border bg-[#0B1F33] text-white shadow-[0_20px_60px_rgba(11,31,51,0.25)] overflow-hidden">
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
                <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  <Clock className="h-3.5 w-3.5 text-[#83C5BE]" />
                  <span>Call Duration: <strong className="text-white">{formatCallTime(callDuration)}</strong></span>
                </div>
              </div>
            </div>

            {/* Video Consultation Main Grid */}
            <div className="grid lg:grid-cols-12 gap-0 relative">
              {/* Doctor Main Video Stream Area (8 cols) */}
              <div className="lg:col-span-8 relative aspect-video bg-slate-900 overflow-hidden flex items-center justify-center">
                {/* Doctor Video Poster / Stream */}
                <Image
                  src="https://images.unsplash.com/photo-1594824813568-154df6686e58?auto=format&fit=crop&w=1200&q=80"
                  alt="Dr. Priya Sharma, MD - Live Consultation"
                  fill
                  unoptimized
                  className="object-cover object-top opacity-95"
                />

                {/* Subtle dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F33] via-transparent to-transparent opacity-80" />

                {/* Doctor Overlay Info & Live Audio Meters */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10">
                  <div className="flex items-center gap-3 bg-[#0B1F33]/85 backdrop-blur-md border border-white/15 rounded-xl p-2.5">
                    <div className="h-9 w-9 rounded-lg bg-[#006D77] flex items-center justify-center font-bold text-white text-xs">
                      Dr
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">Dr. Priya Sharma, MD</span>
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-medium">
                          Speaking
                        </span>
                      </div>
                      <p className="text-[10px] text-white/70">Endocrinologist · AIIMS Faculty (12 yrs exp)</p>
                    </div>

                    {/* LIVE AUDIO METERS (Fluctuating frequency bars) */}
                    <div className="ml-2 pl-3 border-l border-white/20 flex items-center gap-1" title="Real-time HD audio meter">
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
                  <div className="hidden sm:block relative w-32 h-24 rounded-xl border-2 border-white/30 overflow-hidden shadow-lg bg-black">
                    {isCamOff ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white/60">
                        <VideoOff className="h-5 w-5 mb-1" />
                        <span className="text-[9px]">Camera Off</span>
                      </div>
                    ) : (
                      <Image
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80"
                        alt="Patient preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    )}
                    <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-xs text-[9px] px-1.5 py-0.5 rounded text-white font-medium">
                      You (HD)
                    </span>
                  </div>
                </div>

                {/* WebRTC Interactive Control Bar */}
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#0B1F33]/85 backdrop-blur-md border border-white/15 rounded-xl p-1.5 z-10">
                  <button
                    type="button"
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs transition-colors cursor-pointer ${
                      isMicMuted ? "bg-red-500/80 text-white" : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                    title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
                  >
                    {isMicMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCamOff(!isCamOff)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs transition-colors cursor-pointer ${
                      isCamOff ? "bg-red-500/80 text-white" : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                    title={isCamOff ? "Turn Camera On" : "Turn Camera Off"}
                  >
                    {isCamOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => alert("Simulation: In a live consult, this smoothly ends your call and generates the cryptographically signed prescription.")}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
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
                  <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTelemetryTab("vitals")}
                      className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        activeTelemetryTab === "vitals"
                          ? "bg-[#006D77] text-white shadow-xs"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      Live Vitals
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTelemetryTab("notes")}
                      className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        activeTelemetryTab === "notes"
                          ? "bg-[#006D77] text-white shadow-xs"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      Doctor Notes
                    </button>
                  </div>

                  {activeTelemetryTab === "vitals" ? (
                    <div className="mt-4 space-y-3">
                      {/* Heart Rate Metric */}
                      <div className="p-3 rounded-xl border border-white/10 bg-white/[0.03]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-white/70">
                            <Heart className="h-3.5 w-3.5 text-rose-400 animate-ping" />
                            <span>Heart Rate (PPG)</span>
                          </span>
                          <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-1.5 py-0.5 rounded">
                            Normal Sinus
                          </span>
                        </div>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-mono font-bold text-white">{heartRate}</span>
                          <span className="text-xs text-white/60">BPM</span>
                        </div>
                      </div>

                      {/* SpO2 & Blood Pressure Grid */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="p-2.5 rounded-xl border border-white/10 bg-white/[0.03]">
                          <span className="text-[10px] text-white/60 block">Blood Oxygen</span>
                          <div className="mt-0.5 flex items-baseline gap-1">
                            <span className="text-xl font-mono font-bold text-white">98%</span>
                            <span className="text-[10px] text-emerald-400">SpO2</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl border border-white/10 bg-white/[0.03]">
                          <span className="text-[10px] text-white/60 block">Blood Pressure</span>
                          <div className="mt-0.5 flex items-baseline gap-1">
                            <span className="text-xl font-mono font-bold text-white">120/80</span>
                            <span className="text-[10px] text-white/60">mmHg</span>
                          </div>
                        </div>
                      </div>

                      {/* Temperature Metric */}
                      <div className="p-2.5 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-3.5 w-3.5 text-amber-400" />
                          <span className="text-xs text-white/70">Body Temp</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-white">98.4 °F (Afebrile)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 p-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-xs text-white/80 space-y-2">
                      <p className="font-semibold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#83C5BE]" />
                        <span>Clinical Assessment:</span>
                      </p>
                      <p className="text-[11px] text-white/70 leading-relaxed">
                        Patient reports 3-month history of postprandial fatigue. Fasting blood sugar 128 mg/dL.
                        Initiating Metformin 500mg titration with continuous HbA1c telemetry.
                      </p>
                      <div className="pt-2 border-t border-white/10 text-[10px] text-emerald-300 font-medium">
                        ✓ Digital Rx Generated (Ready for PDF download)
                      </div>
                    </div>
                  )}
                </div>

                {/* Instant Consult Booking Action */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-white/70 font-medium">Available Slots Today:</span>
                    <span className="text-emerald-400 font-bold">₹199 only</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 mb-3">
                    {["10:30 AM", "11:15 AM", "02:30 PM"].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 text-[11px] rounded-lg font-semibold transition-all cursor-pointer ${
                          selectedSlot === slot
                            ? "bg-[#006D77] text-white border border-[#83C5BE]/60"
                            : "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>

                  <Link
                    href="/find-doctor"
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-slate-100 py-2.5 px-4 text-xs font-bold text-[#0B1F33] shadow-sm transition-all"
                  >
                    <Calendar className="h-3.5 w-3.5 text-[#006D77]" />
                    <span>Confirm Consultation ({selectedSlot})</span>
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
