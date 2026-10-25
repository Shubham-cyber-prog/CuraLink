"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Smartphone,
  QrCode,
  Send,
  CheckCircle2,
  BellRing,
  ShieldCheck,
  Zap,
  Flame,
  Star,
  Download,
  Heart,
  Video,
  Mic,
  PhoneOff,
  Clock,
  ArrowRight,
  WifiOff,
  Ambulance,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AppDownloadSection() {
  const [phone, setPhone] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleSendLink = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = phone.replace(/\D/g, "");
    if (cleanNumber.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setError("");
    setIsSent(true);
  };

  return (
    <section className="py-20 sm:py-28 border-b border-border bg-[#0B1F33] text-white overflow-hidden relative">
      {/* Background radial teal gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/4 w-[750px] h-[750px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,109,119,0.22),rgba(131,197,190,0.06),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 right-10 w-[600px] h-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(11,31,51,0.5),transparent_70%)]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* ─── LEFT COLUMN: DOWNLOAD VALUE PROPS & ACTIONS ─── */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#83C5BE]/30 bg-[#006D77]/20 px-3.5 py-1 text-xs font-semibold text-[#83C5BE]">
              <Smartphone className="h-3.5 w-3.5" />
              <span>CuraLink Mobile App · iOS & Android</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Your doctor, prescription vault, & emergency care — in your pocket.
            </h2>

            {/* Description */}
            <p className="text-base text-white/75 leading-relaxed max-w-2xl">
              Get faster appointments, instant push medicine reminders, and emergency 1-tap SOS triage. 
              Works seamlessly on any 4G/5G connection across India.
            </p>

            {/* 3 Key App-Exclusive Features */}
            <div className="grid sm:grid-cols-3 gap-3.5 pt-2">
              <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm">
                <div className="h-8 w-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center mb-2.5">
                  <Ambulance className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Instant SOS Routing</h4>
                <p className="text-[11px] text-white/60 mt-1 leading-snug">
                  1-tap emergency triage & nearest hospital alert.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm">
                <div className="h-8 w-8 rounded-lg bg-[#006D77]/30 text-[#83C5BE] flex items-center justify-center mb-2.5">
                  <BellRing className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Push Dose Reminders</h4>
                <p className="text-[11px] text-white/60 mt-1 leading-snug">
                  Automated pill alerts & refilling countdowns.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-2.5">
                  <WifiOff className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Offline Health Vault</h4>
                <p className="text-[11px] text-white/60 mt-1 leading-snug">
                  Prescriptions & lab reports saved without internet.
                </p>
              </div>
            </div>

            {/* Direct App Store & Google Play Download Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {/* Apple App Store Badge */}
              <a
                href="#download-ios"
                className="group flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 px-5 py-3 transition-all hover:scale-[1.02] shadow-sm"
              >
                {/* Apple SVG Icon */}
                <svg className="h-6 w-6 fill-white" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.89c.65-.8 1.1-1.92.98-3.04-1 .04-2.15.67-2.83 1.47-.59.69-1.12 1.83-.98 2.92 1.12.09 2.19-.57 2.83-1.35z"/>
                </svg>
                <div className="text-left">
                  <span className="block text-[10px] uppercase font-medium text-white/60 leading-tight">
                    Download on the
                  </span>
                  <span className="block text-sm font-bold text-white tracking-tight leading-tight">
                    App Store
                  </span>
                </div>
                <div className="ml-1 pl-3 border-l border-white/15 text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                  <Star className="h-2.5 w-2.5 fill-amber-400" />
                  <span>4.9</span>
                </div>
              </a>

              {/* Google Play Badge */}
              <a
                href="#download-android"
                className="group flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 px-5 py-3 transition-all hover:scale-[1.02] shadow-sm"
              >
                {/* Google Play SVG Icon */}
                <svg className="h-6 w-6 fill-white" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a1.94 1.94 0 0 1-.61-.954V2.768c.15-.36.368-.694.61-.954zm11.235 11.238l2.25 2.25-11.758 6.78 9.508-9.03zm0-2.104L5.336 1.918l11.758 6.78-2.25 2.25zm1.488 1.487l3.857-2.222a1.88 1.88 0 0 1 0 3.256l-3.857-2.222v-.068l-.001.002.001-.002z"/>
                </svg>
                <div className="text-left">
                  <span className="block text-[10px] uppercase font-medium text-white/60 leading-tight">
                    GET IT ON
                  </span>
                  <span className="block text-sm font-bold text-white tracking-tight leading-tight">
                    Google Play
                  </span>
                </div>
                <div className="ml-1 pl-3 border-l border-white/15 text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                  <Star className="h-2.5 w-2.5 fill-amber-400" />
                  <span>4.8</span>
                </div>
              </a>
            </div>

            {/* Interactive Phone Number SMS Sender & QR Code Row */}
            <div className="pt-3 grid sm:grid-cols-12 gap-4 items-center">
              {/* Phone SMS Input (8 cols) */}
              <div className="sm:col-span-7 p-4 rounded-2xl border border-white/15 bg-white/[0.03] backdrop-blur-md">
                <span className="text-xs font-semibold text-white/80 block mb-1.5">
                  Get download link via SMS:
                </span>
                {isSent ? (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>SMS link sent to +91 {phone}!</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSent(false);
                        setPhone("");
                      }}
                      className="text-[10px] text-white/60 underline hover:text-white"
                    >
                      Reset
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSendLink} className="space-y-1.5">
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1 rounded-xl bg-white/10 px-3 py-2 text-xs text-white border border-white/15 shrink-0">
                        <span>🇮🇳</span>
                        <span className="font-mono font-bold">+91</span>
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="Enter 10-digit mobile"
                        maxLength={10}
                        className="flex-1 rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#83C5BE]"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-[#006D77] hover:bg-[#00565e] px-4 py-2 text-xs font-bold text-white transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Send</span>
                      </button>
                    </div>
                    {error && <p className="text-[10px] text-red-400">{error}</p>}
                  </form>
                )}
                <span className="text-[10px] text-white/50 block mt-1.5">
                  Free SMS · No spam · Instant secure app install link
                </span>
              </div>

              {/* QR Code Card (5 cols) */}
              <div className="sm:col-span-5 p-4 rounded-2xl border border-white/15 bg-white/[0.03] backdrop-blur-md flex items-center gap-3">
                {/* SVG Rendered High-Resolution QR Code */}
                <div className="h-16 w-16 shrink-0 bg-white p-1 rounded-xl shadow-md flex items-center justify-center relative">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full"
                    shapeRendering="crispEdges"
                  >
                    {/* Corner Position Detection Squares */}
                    <rect x="5" y="5" width="28" height="28" fill="#0B1F33" rx="4" />
                    <rect x="11" y="11" width="16" height="16" fill="#ffffff" />
                    <rect x="15" y="15" width="8" height="8" fill="#006D77" />

                    <rect x="67" y="5" width="28" height="28" fill="#0B1F33" rx="4" />
                    <rect x="73" y="11" width="16" height="16" fill="#ffffff" />
                    <rect x="77" y="15" width="8" height="8" fill="#006D77" />

                    <rect x="5" y="67" width="28" height="28" fill="#0B1F33" rx="4" />
                    <rect x="11" y="73" width="16" height="16" fill="#ffffff" />
                    <rect x="15" y="77" width="8" height="8" fill="#006D77" />

                    {/* Data Matrix Dots */}
                    <rect x="38" y="10" width="6" height="6" fill="#0B1F33" />
                    <rect x="48" y="10" width="6" height="6" fill="#0B1F33" />
                    <rect x="58" y="14" width="6" height="6" fill="#0B1F33" />
                    <rect x="38" y="24" width="6" height="6" fill="#0B1F33" />
                    <rect x="48" y="24" width="6" height="6" fill="#006D77" />
                    <rect x="10" y="44" width="6" height="6" fill="#0B1F33" />
                    <rect x="22" y="48" width="6" height="6" fill="#0B1F33" />
                    <rect x="38" y="40" width="6" height="6" fill="#0B1F33" />
                    <rect x="48" y="40" width="6" height="6" fill="#006D77" />
                    <rect x="58" y="40" width="6" height="6" fill="#0B1F33" />
                    <rect x="70" y="44" width="6" height="6" fill="#0B1F33" />
                    <rect x="84" y="48" width="6" height="6" fill="#0B1F33" />
                    <rect x="38" y="56" width="6" height="6" fill="#0B1F33" />
                    <rect x="50" y="56" width="6" height="6" fill="#0B1F33" />
                    <rect x="70" y="60" width="6" height="6" fill="#006D77" />
                    <rect x="80" y="70" width="6" height="6" fill="#0B1F33" />
                    <rect x="44" y="74" width="6" height="6" fill="#0B1F33" />
                    <rect x="54" y="80" width="6" height="6" fill="#0B1F33" />
                    <rect x="84" y="84" width="6" height="6" fill="#006D77" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-white">
                    <QrCode className="h-3 w-3 text-[#83C5BE]" />
                    <span>Scan with camera</span>
                  </div>
                  <p className="text-[10px] text-white/60 mt-0.5 leading-snug">
                    Scan with phone camera to download instantly
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN: 3D-ANGLED MOBILE PHONE CONSULTATION MOCKUP ─── */}
          <div className="lg:col-span-5 flex justify-center items-center py-6">
            <div className="relative [perspective:1200px] group">
              {/* Floating glow behind phone */}
              <div className="absolute inset-0 bg-[#006D77]/40 blur-3xl rounded-full scale-90 -z-10 group-hover:scale-100 transition-transform duration-500" />

              {/* 3D-Angled Phone Device Chassis */}
              <motion.div
                initial={{ rotateY: -12, rotateX: 6 }}
                whileHover={{ rotateY: 0, rotateX: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-[285px] sm:w-[310px] h-[580px] sm:h-[620px] rounded-[48px] bg-slate-950 p-3.5 border-4 border-slate-700/80 shadow-[0_25px_60px_rgba(0,0,0,0.7)] relative overflow-hidden"
                style={{
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Hardware Speaker Notch & Dynamic Island */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-center gap-2 px-2 shadow-inner">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-900 border border-slate-800" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                {/* Inner Screen Display */}
                <div className="w-full h-full rounded-[38px] bg-slate-900 overflow-hidden relative flex flex-col justify-between">
                  {/* Doctor Full Screen Video Feed */}
                  <Image
                    src="https://images.unsplash.com/photo-1594824813568-154df6686e58?auto=format&fit=crop&w=640&q=80"
                    alt="Active Video Consult"
                    fill
                    unoptimized
                    className="object-cover object-top opacity-95"
                  />

                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

                  {/* Top Status Bar Inside App */}
                  <div className="relative z-20 pt-7 px-5 flex items-center justify-between text-[11px] text-white font-mono">
                    <span>11:15</span>
                    <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[9px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>HD WebRTC</span>
                    </span>
                  </div>

                  {/* Doctor Floating Nameplate */}
                  <div className="relative z-20 px-4 mt-2">
                    <div className="bg-black/60 backdrop-blur-md p-2.5 rounded-2xl border border-white/15 flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-[#006D77] flex items-center justify-center text-xs font-bold text-white">
                        MD
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <h5 className="text-xs font-bold text-white truncate">Dr. Priya Sharma</h5>
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        </div>
                        <p className="text-[9px] text-white/70">Endocrinologist · Call 04:22</p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Controls & Floating Patient PIP */}
                  <div className="relative z-20 p-4 space-y-3">
                    {/* Live Vitals Telemetry HUD Strip */}
                    <div className="flex items-center justify-between bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-[10px]">
                      <span className="flex items-center gap-1 text-rose-300">
                        <Heart className="h-3 w-3 animate-ping" />
                        <strong>72 BPM</strong>
                      </span>
                      <span className="text-emerald-300">
                        SpO2: <strong>98%</strong>
                      </span>
                      <span className="text-white/80">
                        BP: <strong>120/80</strong>
                      </span>
                    </div>

                    {/* Patient PIP Thumbnail Preview */}
                    <div className="flex justify-end">
                      <div className="relative w-20 h-24 rounded-xl border-2 border-white/40 overflow-hidden shadow-xl bg-slate-800">
                        <Image
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80"
                          alt="Patient PIP"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        <span className="absolute bottom-1 left-1 bg-black/60 text-[8px] px-1 py-0.5 rounded text-white font-medium">
                          You
                        </span>
                      </div>
                    </div>

                    {/* Bottom Call Controls Dock */}
                    <div className="flex items-center justify-center gap-3 bg-black/75 backdrop-blur-md py-2.5 px-4 rounded-2xl border border-white/20">
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white"
                      >
                        <Mic className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white"
                      >
                        <Video className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="flex h-10 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-md"
                      >
                        <PhoneOff className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
