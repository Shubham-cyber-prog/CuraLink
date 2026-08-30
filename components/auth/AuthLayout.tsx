"use client";

import React from "react";
import { ShieldCheck, Sparkles, Activity } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

interface AuthLayoutProps {
  children: React.ReactNode;
  subtitle: string;
}

export function AuthLayout({ children, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background md:flex-row">
      <div className="relative hidden select-none overflow-hidden bg-teal-950 p-12 text-white md:flex md:w-[44%] md:flex-col md:justify-between lg:w-[40%]">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
        <div className="pointer-events-none absolute -right-16 top-24 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="z-10">
          <Logo inverted />
        </div>

        <div className="z-10 my-auto space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-400/20 bg-teal-400/10 px-3.5 py-1 text-xs font-semibold text-teal-200">
            <ShieldCheck size={14} />
            <span>HIPAA-aligned security</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl leading-tight tracking-tight lg:text-4xl">
              Clinical precision.
              <br />
              <span className="font-display italic text-teal-200">Quiet communication.</span>
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-teal-100/75 lg:text-base">
              Licensed clinicians and patients meet in an encrypted workspace — with AI triage that
              prepares the visit, not replaces it.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-1.5 text-teal-300">
                <Sparkles size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">AI triage</span>
              </div>
              <p className="text-xs text-white/65">Structured intake before the consult</p>
            </div>
            <div className="space-y-1 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-1.5 text-teal-300">
                <Activity size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Encrypted</span>
              </div>
              <p className="text-xs text-white/65">End-to-end visit threads</p>
            </div>
          </div>
        </div>

        <div className="z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-white/40">
          <span>© {new Date().getFullYear()} CuraLink</span>
          <span className="capitalize">{subtitle}</span>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 md:px-12 lg:px-20">
        <div className="mb-6 flex select-none items-center md:hidden">
          <Logo />
        </div>

        <div className="flex w-full max-w-[440px] flex-col gap-6">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-5 sm:p-8 shadow-sm shadow-slate-900/5">
            {children}
          </div>
          <div className="flex justify-center gap-4 text-center text-xs text-slate-400">
            <Link href="#" className="transition-colors hover:text-slate-600">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="#" className="transition-colors hover:text-slate-600">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
