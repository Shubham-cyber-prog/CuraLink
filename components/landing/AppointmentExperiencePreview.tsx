"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Video,
  BellRing,
  ShieldCheck,
  FileCheck2,
  ArrowRight,
  Clock,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const TELEHEALTH_PILLARS = [
  {
    icon: Video,
    title: "Video consultations",
    description: "High-definition, browser-native clinical video rooms. Connect directly from your computer or phone with zero software downloads.",
  },
  {
    icon: BellRing,
    title: "Appointment reminders",
    description: "Timely SMS and email notifications before your appointment so you never miss a scheduled visit or follow-up check-in.",
  },
  {
    icon: ShieldCheck,
    title: "Secure communication",
    description: "End-to-end encrypted consultations and authenticated sessions safeguarding your medical dialogue and identity.",
  },
  {
    icon: FileCheck2,
    title: "Consultation notes where supported",
    description: "Receive digital clinical summaries, doctor recommendations, and electronic prescriptions directly in your account post-visit.",
  },
];

export function AppointmentExperiencePreview() {
  return (
    <section
      id="telehealth"
      className="px-4 sm:px-6 py-20 bg-white dark:bg-[#0B1120] border-b border-[#E2E8F0] dark:border-slate-800"
      aria-labelledby="telehealth-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Natural Healthcare Consultation Image */}
          <motion.div
            className="lg:col-span-6 relative"
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-900">
              <Image
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80"
                alt="Doctor conducting a clinical digital consultation on a tablet"
                width={800}
                height={600}
                unoptimized
                className="w-full h-[380px] sm:h-[440px] object-cover"
              />

              {/* Inset clinical badge overlay */}
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl p-3.5 border border-[#E2E8F0] dark:border-slate-700/80 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0D9488]">
                    <Video className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <p className="text-xs font-semibold text-[#0F172A] dark:text-white">
                        Private Telehealth Room
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Encrypted connection · Direct doctor-patient video
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Copy & Details */}
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0D9488] dark:text-[#14B8A6]">
              Online Consultations
            </span>
            <h2
              id="telehealth-heading"
              className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-white"
            >
              Care from wherever you are.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Consult experienced physicians from the comfort of home or on the go. Experience compassionate healthcare with seamless video, calendar reminders, and instant digital prescription records.
            </p>

            {/* Explanatory 4 Pillars */}
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {TELEHEALTH_PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-[#FAFAFA] dark:bg-slate-900/60"
                  >
                    <div className="flex items-center gap-2 text-[#0D9488] dark:text-[#14B8A6]">
                      <Icon className="h-4 w-4 shrink-0" />
                      <h3 className="text-xs font-semibold text-[#0F172A] dark:text-white">
                        {pillar.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="mt-8 flex items-center gap-4">
              <Button asChild className="bg-[#0D9488] hover:bg-[#0F766E] text-white px-6 py-2.5 rounded-lg shadow-xs font-medium">
                <Link href="/appointments" className="inline-flex items-center gap-2">
                  <span>Explore consultations</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
