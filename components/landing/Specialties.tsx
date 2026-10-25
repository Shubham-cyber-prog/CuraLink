"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  Heart,
  Stethoscope,
  Smile,
  Baby,
  Thermometer,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

const SPECIALTIES = [
  {
    icon: Activity,
    name: "Endocrinology & Diabetes",
    conditions: "Type-1 & Type-2 Diabetes, Thyroid, Hormonal health, HbA1c control",
    href: "/find-doctor?specialty=endocrinology",
  },
  {
    icon: Heart,
    name: "Cardiology & Hypertension",
    conditions: "High Blood Pressure, Heart Health, Cholesterol, Lipid reviews",
    href: "/find-doctor?specialty=cardiology",
  },
  {
    icon: Thermometer,
    name: "General & Internal Medicine",
    conditions: "Fevers, Infections, Fatigue, Chronic illness, Preventive care",
    href: "/find-doctor?specialty=general",
  },
  {
    icon: Stethoscope,
    name: "Dermatology & Skin Care",
    conditions: "Acne, Eczema, Psoriasis, Hair loss, Rashes & fungal care",
    href: "/find-doctor?specialty=dermatology",
  },
  {
    icon: Smile,
    name: "Mental Well-Being & Stress",
    conditions: "Anxiety, Sleep issues, Depression, Burnout, Counseling",
    href: "/find-doctor?specialty=psychiatry",
  },
  {
    icon: Baby,
    name: "Pediatrics & Child Care",
    conditions: "Childhood fevers, Growth milestones, Nutrition, Vaccinations",
    href: "/find-doctor?specialty=pediatrics",
  },
];

export function Specialties() {
  return (
    <section id="specialties" className="py-20 sm:py-24 border-b border-border">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#006D77]">
            Specialties
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Specialized care for everyday and chronic conditions.
          </h2>
          <p className="mt-3 text-base text-muted leading-relaxed">
            Connect with board-certified physicians experienced in handling both common symptoms and long-term treatment plans.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SPECIALTIES.map((spec, index) => (
            <motion.div
              key={spec.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
              className="rounded-2xl border border-border bg-surface p-6 flex flex-col justify-between hover:border-[#83C5BE]/60 hover:shadow-[0_8px_30px_rgba(0,109,119,0.1)] transition-all"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-[#006D77]/10 text-[#006D77] flex items-center justify-center">
                  <spec.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">
                  {spec.name}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
                  {spec.conditions}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60">
                <Link
                  href={spec.href}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006D77] hover:text-[#00565e] transition-colors"
                >
                  <span>Find specialist</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
