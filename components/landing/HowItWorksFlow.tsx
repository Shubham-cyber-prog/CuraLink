"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageSquare, Video, FileCheck, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const STEPS = [
  {
    number: "01",
    title: "Tell Us What's Wrong",
    subtitle: "In 60 seconds",
    description:
      "Use our conversational AI triage to explain your symptoms in simple English or Hindi, or directly choose your preferred medical specialist.",
    icon: MessageSquare,
    badge: "Smart Clinical Intake",
    previewTitle: "AI Symptom Triage Active",
    previewDesc: "Urgency: Routine · Recommended: Dr. Priya Sharma, MD",
    actionText: "Try Free Triage",
    actionHref: "/symptom-checker",
  },
  {
    number: "02",
    title: "Connect on Instant HD Video",
    subtitle: "In under 2 minutes",
    description:
      "Join your encrypted video call directly in your browser. No app store downloads, no waiting in clinic lobbies. Real-time audio and vitals telemetry.",
    icon: Video,
    badge: "Browser WebRTC",
    previewTitle: "HD Consultation Room Live",
    previewDesc: "256-Bit Encrypted · Verified NMC Doctor Joined",
    actionText: "Explore Video Room",
    actionHref: "/find-doctor",
  },
  {
    number: "03",
    title: "Receive Prescription & Meds",
    subtitle: "Delivered in 15 minutes",
    description:
      "Get a cryptographically signed prescription PDF accepted at all Indian pharmacies, plus optional 15-minute doorstep medicine delivery.",
    icon: FileCheck,
    badge: "Verified E-Rx",
    previewTitle: "Prescription #RX-9920 Signed",
    previewDesc: "QR Code Verifiable · 15-min delivery available",
    actionText: "Records & Vault",
    actionHref: "/records",
  },
];

export function HowItWorksFlow() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="py-20 sm:py-24 border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#006D77]/10 px-3 py-1 text-xs font-semibold text-[#006D77] dark:text-[#83C5BE]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Effortless Care Journey</span>
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0B1F33] dark:text-white leading-tight">
            How CuraLink works in 3 simple steps.
          </h2>
          <p className="mt-3 text-base text-muted leading-relaxed">
            From feeling unwell to speaking with a doctor and getting medicine delivered — all within minutes.
          </p>
        </div>

        {/* 3 Step Flow Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === index;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                onMouseEnter={() => setActiveStep(index)}
                className={`rounded-2xl border p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                  isActive
                    ? "border-[#006D77] dark:border-[#83C5BE] bg-surface shadow-[0_12px_40px_rgba(0,109,119,0.12)] -translate-y-1"
                    : "border-border bg-surface hover:border-[#83C5BE]/50"
                }`}
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-3xl font-extrabold text-[#006D77] dark:text-[#83C5BE]">
                      {step.number}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-muted/60 text-muted px-2.5 py-1 rounded-full">
                      {step.subtitle}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="mt-6 h-12 w-12 rounded-xl bg-[#006D77]/10 text-[#006D77] dark:text-[#83C5BE] flex items-center justify-center">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-foreground">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm text-muted leading-relaxed">
                    {step.description}
                  </p>

                  {/* Mockup Preview Bubble */}
                  <div className="mt-5 p-3 rounded-xl border border-border/80 bg-surface-elevated text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#006D77] dark:text-[#83C5BE]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{step.previewTitle}</span>
                    </div>
                    <p className="text-[11px] text-muted">{step.previewDesc}</p>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-6 pt-4 border-t border-border">
                  <Link
                    href={step.actionHref}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006D77] dark:text-[#83C5BE] hover:underline"
                  >
                    <span>{step.actionText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
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
