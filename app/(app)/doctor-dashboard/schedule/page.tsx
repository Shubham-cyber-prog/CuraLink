"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Video,
  Building2,
  ChevronRight,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Moon,
  Coffee,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

const DAYS_OF_WEEK = [
  { key: "MON", label: "Monday", active: true, morning: "09:00 - 13:00", evening: "16:00 - 20:00" },
  { key: "TUE", label: "Tuesday", active: true, morning: "09:00 - 13:00", evening: "16:00 - 20:00" },
  { key: "WED", label: "Wednesday", active: true, morning: "09:00 - 13:00", evening: "16:00 - 20:00" },
  { key: "THU", label: "Thursday", active: true, morning: "09:00 - 13:00", evening: "16:00 - 20:00" },
  { key: "FRI", label: "Friday", active: true, morning: "09:00 - 13:00", evening: "16:00 - 20:00" },
  { key: "SAT", label: "Saturday", active: true, morning: "10:00 - 14:00", evening: "Off" },
  { key: "SUN", label: "Sunday", active: false, morning: "Off", evening: "Off" },
];

export default function DoctorSchedulePage() {
  const [days, setDays] = useState(DAYS_OF_WEEK);
  const [slotDuration, setSlotDuration] = useState<number>(15);
  const [bufferTime, setBufferTime] = useState<number>(5);
  const [acceptingEmergency, setAcceptingEmergency] = useState(true);
  const [isVacationMode, setIsVacationMode] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newSlotModalOpen, setNewSlotModalOpen] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [newSlotTime, setNewSlotTime] = useState("03:00 PM");

  const todayTimeline = [
    { time: "09:30 AM", patient: "Ramesh Gupta", type: "HD Video", status: "COMPLETED" },
    { time: "10:15 AM", patient: "Aarav Sharma", type: "HD Video", status: "CONFIRMED" },
    { time: "11:00 AM", patient: "Pooja Verma", type: "In-Clinic", status: "CONFIRMED" },
    { time: "12:00 PM", patient: "Clinical Break & Charting", type: "Break", status: "BREAK" },
    { time: "02:30 PM", patient: "Devansh Reddy", type: "HD Video", status: "CONFIRMED" },
    { time: "04:00 PM", patient: "Meenakshi Iyer", type: "HD Video", status: "CONFIRMED" },
  ];

  const handleToggleDay = (key: string) => {
    setDays((prev) =>
      prev.map((d) => (d.key === key ? { ...d, active: !d.active } : d))
    );
  };

  const handleSaveSchedule = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleAddSlot = () => {
    setNewSlotModalOpen(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#071320] text-[#0B1F33] dark:text-slate-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/doctor-dashboard" className="hover:text-[#006D77] transition-colors">
            Doctor Cockpit
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-[#006D77] dark:text-[#83C5BE]">
            Schedule &amp; Slot Management
          </span>
        </div>

        {/* ── 1. HEADER & ACTIONS ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1F33] dark:text-white">
                Clinical Practice Schedule
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 px-2.5 py-0.5 text-xs font-bold text-cyan-700 dark:text-cyan-300">
                Live Slots Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure weekly operational hours, slot duration intervals, buffers, and blackout periods.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setNewSlotModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#006D77] text-white text-xs font-bold hover:bg-[#005159] transition-all shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Custom Slot</span>
            </button>

            <button
              type="button"
              onClick={handleSaveSchedule}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B1F33] text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
            >
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Save Schedule</span>
            </button>
          </div>
        </div>

        {/* Save feedback alert */}
        <AnimatePresence>
          {savedSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-3 shadow-xs"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>
                Schedule preferences updated! Public patient booking calendar is now synced with your availability.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 2. LIVE TODAY'S TIMELINE & WEEKLY SCHEDULE GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Weekly Timings (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-[#0B1F33] p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0B1F33] dark:text-white">
                  Weekly Consultation Timetable
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Toggle working days and manage morning/evening consultation shifts.
                </p>
              </div>

              {/* Vacation Mode Toggle */}
              <button
                type="button"
                onClick={() => setIsVacationMode(!isVacationMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isVacationMode
                    ? "bg-amber-500 text-white border-amber-600"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                }`}
              >
                {isVacationMode ? "🌴 Vacation Mode Active" : "Vacation Mode: Off"}
              </button>
            </div>

            <div className="space-y-3">
              {days.map((d) => (
                <div
                  key={d.key}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    d.active && !isVacationMode
                      ? "bg-white dark:bg-[#112A44] border-slate-200/80 dark:border-slate-700/60"
                      : "bg-slate-50 dark:bg-[#0A1826] border-slate-200/50 dark:border-slate-800 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleDay(d.key)}
                      className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                        d.active && !isVacationMode
                          ? "bg-[#006D77] text-white"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      {d.active && !isVacationMode ? <Check className="h-3.5 w-3.5" /> : null}
                    </button>
                    <div>
                      <span className="font-bold text-sm text-[#0B1F33] dark:text-white block">
                        {d.label}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {d.active && !isVacationMode ? "Open for bookings" : "Clinic Closed"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Sun className="h-3.5 w-3.5 text-amber-500" />
                      <span className="font-mono font-medium">{d.morning}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Moon className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="font-mono font-medium">{d.evening}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Slot Duration & Interval Controls */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
                  Consultation Duration
                </label>
                <div className="flex items-center gap-2">
                  {[15, 30, 45].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setSlotDuration(mins)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        slotDuration === mins
                          ? "bg-[#006D77] text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
                  Rest Buffer Between Visits
                </label>
                <div className="flex items-center gap-2">
                  {[0, 5, 10].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setBufferTime(mins)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        bufferTime === mins
                          ? "bg-[#006D77] text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {mins === 0 ? "None" : `${mins} mins`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Today's Clinical Timeline (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-[#0B1F33] p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0B1F33] dark:text-white">
                  Today&apos;s Chronological Queue
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>

              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
              {todayTimeline.map((item, idx) => {
                const isBreak = item.status === "BREAK";
                const isDone = item.status === "COMPLETED";

                return (
                  <div key={idx} className="relative group">
                    {/* Circle Node on Timeline */}
                    <div
                      className={`absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 ${
                        isBreak
                          ? "bg-amber-400 border-white dark:border-[#0B1F33]"
                          : isDone
                          ? "bg-emerald-500 border-white dark:border-[#0B1F33]"
                          : "bg-[#006D77] border-white dark:border-[#0B1F33]"
                      }`}
                    />

                    <div
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isBreak
                          ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/40"
                          : isDone
                          ? "bg-slate-50 dark:bg-[#112A44]/50 border-slate-200/60 dark:border-slate-800 opacity-70"
                          : "bg-white dark:bg-[#112A44] border-slate-200/90 dark:border-slate-700/80 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#006D77] dark:text-[#83C5BE]">
                          {item.time}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isBreak
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300"
                              : isDone
                              ? "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center justify-between">
                        <span className="font-bold text-sm text-[#0B1F33] dark:text-white">
                          {item.patient}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.type}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal: Add Custom Slot */}
        {newSlotModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0B1F33] p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-[#0B1F33] dark:text-white">
                Add Emergency Consultation Slot
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instantly open an ad-hoc clinical appointment window for high-priority patients.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newSlotDate}
                    onChange={(e) => setNewSlotDate(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112A44] px-3 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Slot Time
                  </label>
                  <input
                    type="text"
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    placeholder="e.g. 03:00 PM"
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112A44] px-3 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewSlotModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="px-4 py-2 rounded-xl bg-[#006D77] text-white text-xs font-bold hover:bg-[#005159] cursor-pointer"
                >
                  Create Slot
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
