"use client";

import React from "react";
import {
  Brain,
  Video,
  Stethoscope,
  FileText,
  Activity,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Assisted Symptom Triage",
    description:
      "Describe symptoms in plain words. Our triage engine analyzes urgency and routes you to the exact specialist.",
    href: "/symptom-checker",
    linkText: "Try triage tool",
  },
  {
    icon: Video,
    title: "HD Video Consultations",
    description:
      "Crystal-clear video visits optimized for Indian mobile networks. Connect in one tap with zero software downloads.",
    href: "/find-doctor",
    linkText: "Book video visit",
  },
  {
    icon: Stethoscope,
    title: "NMC-Verified Specialists",
    description:
      "Consult board-certified endocrinologists, cardiologists, and physicians from premier institutions like AIIMS and Apollo.",
    href: "/find-doctor",
    linkText: "View specialists",
  },
  {
    icon: FileText,
    title: "Digital Prescriptions",
    description:
      "Receive cryptographically signed prescriptions as PDF right after your visit. Accepted at pharmacies nationwide.",
    href: "/records",
    linkText: "Records vault",
  },
  {
    icon: Activity,
    title: "Chronic Care Monitoring",
    description:
      "Track blood sugar, BP, and key vitals over time. Your doctor reviews continuous trends to adjust dosages safely.",
    href: "/vitals",
    linkText: "Track vitals",
  },
  {
    icon: Smartphone,
    title: "Works on Any Browser",
    description:
      "No app store downloads or phone storage needed. Opens smoothly on Android, iPhone, tablet, or desktop.",
    href: "/find-doctor",
    linkText: "Get started",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-24 border-b border-border">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#006D77]">
            Platform Capabilities
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Everything you need for specialist care.
          </h2>
          <p className="mt-3 text-base text-muted leading-relaxed">
            Designed for chronic condition management, acute sick visits, and ongoing patient recovery.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 hover:border-[#83C5BE]/60 hover:shadow-[0_8px_30px_rgba(0,109,119,0.1)] transition-all duration-200"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-[#006D77]/10 text-[#006D77] flex items-center justify-center">
                  <feature.icon className="h-5 w-5" />
                </div>

                <h3 className="mt-4 text-base font-bold text-foreground">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60">
                <Link
                  href={feature.href}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006D77] hover:text-[#00565e] transition-colors"
                >
                  <span>{feature.linkText}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
