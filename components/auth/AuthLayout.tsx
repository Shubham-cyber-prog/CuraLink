"use client";

import React from "react";
import { ShieldCheck, Sparkles, Activity } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface AuthLayoutProps {
  children: React.ReactNode;
  subtitle: string;
}

export function AuthLayout({ children, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 dark:bg-[#0B1120] md:flex-row transition-colors duration-200">
      {/* Left Clinical Editorial Panel (Desktop) */}
      <div className="relative hidden select-none overflow-hidden bg-[#06241C] p-10 lg:p-14 text-white md:flex md:w-[46%] md:flex-col md:justify-between lg:w-[42%] border-r border-teal-900/30">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-15" />
        
        {/* Top Logo */}
        <div className="z-10 flex items-center justify-between">
          <Logo inverted />
          <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-[11px] font-semibold text-teal-300">
            Clinical Telehealth
          </span>
        </div>

        {/* Center Editorial Value Proposition */}
        <div className="z-10 my-auto space-y-8 max-w-md">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-900/40 px-3.5 py-1 text-xs font-semibold text-teal-200">
              <ShieldCheck size={14} className="text-teal-400" />
              <span>HIPAA & ABDM Compliant</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white leading-[1.2]">
              Clinical precision.
              <br />
              <span className="italic font-serif font-normal text-teal-200">Quiet communication.</span>
            </h1>

            <p className="text-sm leading-relaxed text-teal-100/75">
              Verified clinicians and patients meet in an encrypted workspace with AI-assisted intake that prepares your consultation — never replacing doctor judgment.
            </p>
          </div>

          {/* Testimonial / Doctor Trust Card */}
          <div className="rounded-2xl border border-teal-800/60 bg-[#0A3025] p-5 space-y-3 shadow-inner">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={14} />
              <span>Verified Physician Practice</span>
            </div>
            <p className="text-xs text-teal-100/85 italic leading-relaxed">
              &ldquo;CuraLink connects clinical precision with patient trust. Instant triage, clear medication histories, and zero friction in video consultations.&rdquo;
            </p>
            <div className="flex items-center gap-2.5 pt-1 border-t border-teal-800/40">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-700/80 text-[10px] font-bold text-white">
                DR
              </div>
              <div className="text-[11px]">
                <p className="font-semibold text-white">Dr. Priya Sharma, MD</p>
                <p className="text-teal-300/70">General Medicine • Verified Physician</p>
              </div>
            </div>
          </div>

          {/* Clinical Pillars */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="rounded-xl border border-teal-800/40 bg-teal-950/40 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-teal-300 text-xs font-semibold">
                <Activity size={14} />
                <span>256-Bit SSL</span>
              </div>
              <p className="text-[11px] text-teal-100/60">End-to-end encrypted telehealth</p>
            </div>
            <div className="rounded-xl border border-teal-800/40 bg-teal-950/40 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-teal-300 text-xs font-semibold">
                <ShieldCheck size={14} />
                <span>Verified MDs</span>
              </div>
              <p className="text-[11px] text-teal-100/60">Licensed practitioner network</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="z-10 flex items-center justify-between border-t border-teal-900/40 pt-5 text-xs text-teal-200/50">
          <span>© {new Date().getFullYear()} CuraLink Telehealth</span>
          <span className="capitalize">{subtitle}</span>
        </div>
      </div>

      {/* Right Form Area */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8 md:px-12 lg:px-16">
        {/* Top bar with back to home & theme toggle */}
        <div className="w-full max-w-[460px] flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <span>← Back to CuraLink</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Mobile Header Logo */}
        <div className="mb-6 flex select-none items-center md:hidden">
          <Logo />
        </div>

        {/* The Card */}
        <div className="w-full max-w-[460px] space-y-5">
          <div className="rounded-3xl border border-slate-200/80 dark:border-[#263049] bg-white dark:bg-[#111726] p-7 sm:p-9 shadow-sm shadow-slate-900/5 dark:shadow-black/40 transition-colors duration-200">
            {children}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-center text-xs text-slate-400 dark:text-slate-500 pt-1">
            <Link href="/privacy-policy" target="_self" className="transition-colors hover:text-slate-600 dark:hover:text-slate-300">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms-of-service" target="_self" className="transition-colors hover:text-slate-600 dark:hover:text-slate-300">
              Terms of Service
            </Link>
            <span>•</span>
            <span className="text-slate-400 dark:text-slate-500">HIPAA Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
