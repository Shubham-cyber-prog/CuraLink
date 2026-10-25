"use client";

import React from "react";
import Link from "next/link";
import { Video, FileCheck2, Sparkles, Truck, ArrowRight, ShieldCheck, Zap, QrCode } from "lucide-react";
import { motion } from "framer-motion";

const VALUE_PROPS = [
  {
    icon: Video,
    title: "End-to-End Encrypted HD Calls",
    description:
      "Browser-native WebRTC video rooms optimized for Indian 4G/5G mobile networks. Zero app downloads, zero account setup friction.",
    badge: "256-Bit AES WebRTC",
    metric: "0 Downloads Needed",
    actionText: "Try HD Video Demo",
    actionHref: "/find-doctor",
  },
  {
    icon: FileCheck2,
    title: "Instant Digitally-Signed Rx",
    description:
      "Receive an authentic NMC-compliant digital prescription with doctor registration number and verification QR code in under 60 seconds.",
    badge: "100% Pharmacy Accepted",
    metric: "Valid Nationwide",
    actionText: "View Sample Rx",
    actionHref: "/records",
  },
  {
    icon: Sparkles,
    title: "AI-Assisted Symptom Triage",
    description:
      "Conversational intake analyzes your primary complaints, flags red-flag symptoms, and routes you to the exact clinical specialist.",
    badge: "Clinical Accuracy",
    metric: "60-Second Triage",
    actionText: "Check Symptoms Free",
    actionHref: "/symptom-checker",
  },
  {
    icon: Truck,
    title: "15-Minute Medicine Delivery",
    description:
      "Direct integration with India's top hyper-local pharmacy networks. Prescribed antibiotics, insulin, and medications delivered right to your door.",
    badge: "Doorstep Express",
    metric: "15-Min Delivery",
    actionText: "Pharmacy Partners",
    actionHref: "/records",
  },
];

export function ValueProposition() {
  return (
    <section className="py-20 sm:py-24 border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#006D77]/10 px-3 py-1 text-xs font-semibold text-[#006D77] dark:text-[#83C5BE]">
            <Zap className="h-3.5 w-3.5" />
            <span>The CuraLink Advantage</span>
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0B1F33] dark:text-white leading-tight">
            Engineered for clinical precision. Built for patient ease.
          </h2>
          <p className="mt-3 text-base text-muted leading-relaxed">
            Every feature on CuraLink is designed by practicing Indian physicians to deliver the most reliable, secure, and rapid virtual care experience.
          </p>
        </div>

        {/* 4 Core Value Proposition Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUE_PROPS.map((prop, index) => {
            const Icon = prop.icon;
            return (
              <motion.div
                key={prop.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.35 }}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 hover:border-[#83C5BE]/60 hover:shadow-[0_12px_32px_rgba(0,109,119,0.12)] transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-xl bg-[#006D77]/10 text-[#006D77] dark:text-[#83C5BE] flex items-center justify-center transition-transform group-hover:scale-105">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-muted/60 text-muted px-2 py-0.5 rounded">
                      {prop.metric}
                    </span>
                  </div>

                  <span className="mt-4 inline-block text-[11px] font-semibold text-[#006D77] dark:text-[#83C5BE]">
                    {prop.badge}
                  </span>

                  <h3 className="mt-1 text-base font-bold text-foreground group-hover:text-[#006D77] dark:group-hover:text-[#83C5BE] transition-colors">
                    {prop.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
                    {prop.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/70">
                  <Link
                    href={prop.actionHref}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006D77] dark:text-[#83C5BE] group-hover:underline"
                  >
                    <span>{prop.actionText}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
