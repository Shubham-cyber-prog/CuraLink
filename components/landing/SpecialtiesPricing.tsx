"use client";

import React from "react";
import Link from "next/link";
import {
  Stethoscope,
  Sparkles,
  Heart,
  Baby,
  Smile,
  Activity,
  Clock,
  CheckCircle2,
  ArrowRight,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

const SPECIALTIES = [
  {
    name: "General Physician",
    tagline: "Fever, Viral, Infections & Common Sick Care",
    icon: Stethoscope,
    originalPrice: "₹499",
    salePrice: "₹199",
    discount: "60% OFF",
    waitTime: "< 2 mins",
    availableNow: true,
    credential: "NMC Registered MBBS/MD",
    popularCondition: "Cough, Seasonal Flu, Migraine, Food Poisoning",
    doctorCount: "120+ Doctors Online",
    href: "/find-doctor?specialty=general",
  },
  {
    name: "Dermatology & Skin",
    tagline: "Acne, Eczema, Hair Fall & Rashes",
    icon: Sparkles,
    originalPrice: "₹699",
    salePrice: "₹299",
    discount: "57% OFF",
    waitTime: "< 5 mins",
    availableNow: true,
    credential: "MD Dermatology & Venereology",
    popularCondition: "Cystic Acne, Alopecia, Fungal Infections, Psoriasis",
    doctorCount: "45+ Doctors Online",
    href: "/find-doctor?specialty=dermatology",
  },
  {
    name: "Psychiatry & Mental Well-being",
    tagline: "Anxiety, Stress, Therapy & Insomnia",
    icon: Smile,
    originalPrice: "₹1,200",
    salePrice: "₹499",
    discount: "58% OFF",
    waitTime: "< 10 mins",
    availableNow: true,
    credential: "MD Psychiatry / M.Phil Clinical",
    popularCondition: "Panic Attacks, Work Burnout, Depressive Episodes, Sleep",
    doctorCount: "35+ Specialists Online",
    href: "/find-doctor?specialty=psychiatry",
  },
  {
    name: "Pediatrics & Child Wellness",
    tagline: "Newborn Care, Fevers, Growth & Nutrition",
    icon: Baby,
    originalPrice: "₹750",
    salePrice: "₹349",
    discount: "53% OFF",
    waitTime: "< 3 mins",
    availableNow: true,
    credential: "MD Pediatrics (Gold Medalists)",
    popularCondition: "Colic, Childhood Vaccinations, Stomach Ache, Allergies",
    doctorCount: "40+ Doctors Online",
    href: "/find-doctor?specialty=pediatrics",
  },
  {
    name: "Gynecology & Women's Health",
    tagline: "PCOS/PCOD, Pregnancy, Menopause & Periods",
    icon: Activity,
    originalPrice: "₹850",
    salePrice: "₹399",
    discount: "53% OFF",
    waitTime: "< 5 mins",
    availableNow: true,
    credential: "MS / DNB Obstetrics & Gynecology",
    popularCondition: "Irregular Periods, Pelvic Pain, Hormonal Imbalance",
    doctorCount: "50+ Doctors Online",
    href: "/find-doctor?specialty=gynecology",
  },
  {
    name: "Cardiology & Hypertension",
    tagline: "High BP, Chest Health & Lipid Reviews",
    icon: Heart,
    originalPrice: "₹1,500",
    salePrice: "₹499",
    discount: "67% OFF",
    waitTime: "< 8 mins",
    availableNow: true,
    credential: "DM Cardiology (AIIMS/Apollo)",
    popularCondition: "Hypertension Triage, Palpitations, ECG Interpretation",
    doctorCount: "25+ Specialists Online",
    href: "/find-doctor?specialty=cardiology",
  },
];

export function SpecialtiesPricing() {
  return (
    <section id="specialties" className="py-20 sm:py-24 border-b border-border bg-surface-elevated/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <Zap className="h-3.5 w-3.5" />
              <span>Specialist Pricing · Valid for Today</span>
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0B1F33] dark:text-white leading-tight">
              Top specialties. Real doctors. Transparent pricing.
            </h2>
            <p className="mt-3 text-base text-muted leading-relaxed">
              No hidden fees or unexpected surge charges. Connect with India&apos;s most sought-after medical practitioners from ₹199.
            </p>
          </div>

          <Link
            href="/find-doctor"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#006D77] dark:text-[#83C5BE] hover:underline"
          >
            <span>View all 20+ specialties</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* 6 Specialty Advertising Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SPECIALTIES.map((spec, index) => {
            const Icon = spec.icon;
            return (
              <motion.div
                key={spec.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 hover:border-[#83C5BE]/60 hover:shadow-[0_12px_36px_rgba(0,109,119,0.12)] transition-all duration-300"
              >
                <div>
                  {/* Top Bar: Icon + Wait Time Pill */}
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-xl bg-[#006D77]/10 text-[#006D77] dark:text-[#83C5BE] flex items-center justify-center transition-transform group-hover:scale-105">
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <Clock className="h-3 w-3" />
                      <span>Wait: {spec.waitTime}</span>
                    </div>
                  </div>

                  {/* Specialty Title & Tagline */}
                  <h3 className="mt-5 text-lg font-bold text-foreground group-hover:text-[#006D77] dark:group-hover:text-[#83C5BE] transition-colors">
                    {spec.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted leading-relaxed">
                    {spec.tagline}
                  </p>

                  {/* Doctor credential & online count */}
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-muted">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
                    <span>{spec.credential}</span>
                  </div>

                  {/* Common conditions treated */}
                  <div className="mt-3 pt-3 border-t border-border/60">
                    <p className="text-[10px] uppercase font-bold text-muted tracking-wider">
                      Common Complaints:
                    </p>
                    <p className="text-xs text-foreground mt-0.5 font-medium truncate">
                      {spec.popularCondition}
                    </p>
                  </div>
                </div>

                {/* Bottom Pricing & CTA Row */}
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-extrabold font-mono text-[#006D77] dark:text-[#83C5BE]">
                        {spec.salePrice}
                      </span>
                      <span className="text-xs text-muted line-through">
                        {spec.originalPrice}
                      </span>
                      <span className="text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded">
                        {spec.discount}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted block mt-0.5">
                      {spec.doctorCount}
                    </span>
                  </div>

                  <Link
                    href={spec.href}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#006D77] hover:bg-[#00565e] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:shadow-[0_0_16px_rgba(131,197,190,0.45)] transition-all"
                  >
                    <span>Consult</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
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
