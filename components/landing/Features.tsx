"use client";

import Link from "next/link";
import {
  Stethoscope,
  Baby,
  Sparkles,
  HeartPulse,
  Brain,
  Flower2,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

interface Specialty {
  title: string;
  query: string;
  icon: typeof Stethoscope;
  description: string;
  doctorCountText: string;
}

const SPECIALTIES: Specialty[] = [
  {
    title: "General Medicine",
    query: "General Medicine",
    icon: Stethoscope,
    description: "Preventive care, routine checkups, acute illness triage, and ongoing lifestyle management.",
    doctorCountText: "Available today",
  },
  {
    title: "Pediatrics",
    query: "Pediatrics",
    icon: Baby,
    description: "Compassionate child healthcare, developmental milestones, common childhood ailments, and guidance.",
    doctorCountText: "Verified pediatricians",
  },
  {
    title: "Dermatology",
    query: "Dermatology",
    icon: Sparkles,
    description: "Skin, hair, and scalp conditions with high-resolution clinical evaluation and treatment plans.",
    doctorCountText: "Consult online",
  },
  {
    title: "Cardiology",
    query: "Cardiology",
    icon: HeartPulse,
    description: "Heart health evaluations, blood pressure control, lipid guidance, and cardiovascular prevention.",
    doctorCountText: "Board-certified",
  },
  {
    title: "Mental Wellness",
    query: "Mental Wellness",
    icon: Brain,
    description: "Confidential consultations for stress, anxiety, sleep disturbances, and emotional health support.",
    doctorCountText: "Private sessions",
  },
  {
    title: "Women's Health",
    query: "Women's Health",
    icon: Flower2,
    description: "Reproductive health, hormonal balance, prenatal check-ins, and holistic preventative care.",
    doctorCountText: "Specialized care",
  },
];

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  };

  return (
    <section
      id="services"
      className="px-4 sm:px-6 py-20 bg-white dark:bg-[#0B1120] border-b border-[#E2E8F0] dark:border-slate-800"
      aria-labelledby="specialties-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0D9488] dark:text-[#14B8A6]">
              Clinical Specialties
            </span>
            <h2
              id="specialties-heading"
              className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-white"
            >
              Healthcare across primary and specialized fields
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Connect with verified doctors across disciplines suited to your health concerns.
            </p>
          </div>

          <Link
            href="/doctors"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0D9488] hover:text-[#0F766E] transition-colors self-start sm:self-auto"
          >
            <span>View all specialties</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <motion.div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={containerVariants}
        >
          {SPECIALTIES.map((specialty) => {
            const Icon = specialty.icon;
            return (
              <motion.div
                key={specialty.title}
                variants={itemVariants}
                whileHover={{
                  y: -3,
                  scale: 1.01,
                  transition: { duration: 0.2 },
                }}
                className="group relative flex flex-col justify-between rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-xs hover:border-[#0D9488]/40 hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] dark:text-[#14B8A6] border border-teal-100 dark:border-teal-900/50 transition-transform group-hover:scale-105">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200/60 dark:border-slate-700/60">
                      {specialty.doctorCountText}
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-semibold text-[#0F172A] dark:text-white">
                    {specialty.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {specialty.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <Link
                    href={`/doctors?specialty=${encodeURIComponent(specialty.query)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D9488] group-hover:text-[#0F766E] transition-colors"
                  >
                    <span>Find doctors</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
