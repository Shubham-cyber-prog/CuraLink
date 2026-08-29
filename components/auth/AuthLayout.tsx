"use client";

import React from "react";
import { ShieldCheck, HeartPulse, Sparkles, Activity } from "lucide-react";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
  subtitle: string;
}

export function AuthLayout({ children, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50">
      {/* Left panel (only on medium/desktop screens) */}
      <div className="hidden md:flex md:w-[45%] lg:w-[40%] bg-gradient-to-br from-teal-850 via-teal-900 to-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden select-none">
        {/* Subtle background graphics */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Top Branding */}
        <div className="z-10">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <HeartPulse size={24} className="text-teal-400 animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Cura<span className="text-teal-400">Link</span>
            </span>
          </Link>
        </div>

        {/* Center Content / Value Proposition */}
        <div className="my-auto space-y-6 z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-400/10 border border-teal-400/20 px-3.5 py-1 text-xs font-semibold text-teal-300">
            <ShieldCheck size={14} />
            <span>HIPAA Compliant Security</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              Clinical precision.<br />
              Secure communication.
            </h1>
            <p className="text-sm lg:text-base text-teal-100/80 leading-relaxed font-normal">
              Connecting licensed medical professionals with patients through real-time encrypted messaging, instant booking, and AI-assisted triage systems.
            </p>
          </div>

          {/* Mini Stat Cards */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-teal-400">
                <Sparkles size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">AI Triage</span>
              </div>
              <p className="text-xs text-white/70">Instant clinical assessment checker</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-teal-400">
                <Activity size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Encrypted</span>
              </div>
              <p className="text-xs text-white/70">End-to-end secure consultations</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-white/40 z-10 flex justify-between items-center border-t border-white/10 pt-6">
          <span>© {new Date().getFullYear()} CuraLink Inc.</span>
          <span>Version 1.0.0</span>
        </div>
      </div>

      {/* Right panel (Authentication Form - centered) */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 md:px-12 lg:px-20 relative bg-slate-50">
        {/* Mobile Header Branding (visible on mobile only) */}
        <div className="flex md:hidden items-center gap-2 mb-8 select-none">
          <div className="h-9 w-9 rounded-lg bg-teal-600 flex items-center justify-center">
            <HeartPulse size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Cura<span className="text-teal-600">Link</span>
          </span>
        </div>

        <div className="w-full max-w-[440px] flex flex-col gap-6">
          {/* Card Wrapper */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-6 sm:p-8 shadow-sm">
            {children}
          </div>

          <div className="text-center text-xs text-slate-400 flex justify-center gap-4">
            <Link href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="#" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
