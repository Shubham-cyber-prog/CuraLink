"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Video,
  Star,
  ArrowRight,
  Lock,
  Stethoscope,
} from "lucide-react";
import { motion } from "framer-motion";

export function ProductMock() {
  const [selectedSlot, setSelectedSlot] = useState("10:30 AM");

  const slots = ["10:30 AM", "11:15 AM", "2:15 PM"];

  return (
    <div className="relative mx-auto w-full max-w-[460px]" aria-label="Healthcare consultation preview">
      {/* Subtle warm ambient backdrop - no harsh glowing neon */}
      <div className="absolute -inset-2 rounded-3xl bg-teal-500/5 dark:bg-teal-400/5 blur-xl" />

      {/* Main Healthcare Interaction Card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#151B2E] shadow-sm"
      >
        {/* Top Clinical Status Bar */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-slate-800 bg-[#F5F7F6] dark:bg-slate-900/80 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Licensed Telehealth Provider
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <Lock className="h-3 w-3 text-[#0D9488]" />
            <span>Private Consultation</span>
          </div>
        </div>

        {/* Doctor Profile Showcase */}
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4">
            <div className="flex items-center gap-3.5">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-200">
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

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Dr. Priya Sharma, MD
                  </h4>
                </div>
                <p className="text-xs text-[#0D9488] dark:text-[#14B8A6] font-medium">
                  Primary Care & Internal Medicine
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    4.9
                  </span>
                  <span>•</span>
                  <span>10+ yrs exp.</span>
                  <span>•</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">₹500 / visit</span>
                </div>
              </div>
            </div>

            <span className="shrink-0 rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/40">
              Verified
            </span>
          </div>

          {/* Appointment Booking Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#0D9488]" />
                <span>Available Today</span>
              </span>
              <span className="text-[#0D9488] dark:text-[#14B8A6] font-medium">
                Instant Confirmation
              </span>
            </div>

            {/* Time Slot Chips */}
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`flex flex-col items-center justify-center rounded-xl py-2 px-1 text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border border-[#0D9488] bg-teal-50 dark:bg-teal-950/50 shadow-2xs"
                        : "border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold ${
                        isSelected
                          ? "text-[#0D9488] dark:text-[#14B8A6]"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {slot}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Video Visit
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Consultation Feature Card */}
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/40 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                <Video className="h-3.5 w-3.5 text-[#0D9488]" />
                Direct HD Video Consultation
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">Encrypted</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                <Clock className="h-3.5 w-3.5 text-[#0D9488]" />
                Electronic Prescription & Notes
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">Same Day</span>
            </div>
          </div>

          {/* Direct Join Action Button */}
          <Link
            href="/find-doctor"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] py-2.5 px-4 text-xs font-semibold text-white shadow-2xs transition-colors"
          >
            <span>Book Consultation Slot ({selectedSlot})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Footer Clinical Note */}
        <div className="border-t border-[#E2E8F0] dark:border-slate-800 bg-[#F5F7F6]/80 dark:bg-slate-900/60 px-5 py-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Verified Practitioner Credentials
          </span>
          <span>Zero Waiting Room</span>
        </div>
      </motion.div>
    </div>
  );
}
