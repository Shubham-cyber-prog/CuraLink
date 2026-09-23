"use client";

import { Activity, CalendarCheck, Video, FileText, ShieldCheck, HeartPulse } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const SERVICES = [
  {
    icon: Activity,
    title: "Clinical Symptom Assessment",
    description:
      "Structured health intake providing preliminary triage and guidance to prepare you before speaking with a doctor.",
  },
  {
    icon: CalendarCheck,
    title: "Verified Physician Booking",
    description:
      "Browse certified medical doctors by specialty, location, and real availability. Confirm a visit in seconds.",
  },
  {
    icon: Video,
    title: "Encrypted Video Consultation",
    description:
      "Consult directly in a private, encrypted clinical room without leaving your browser or installing third-party apps.",
  },
  {
    icon: FileText,
    title: "Digital Records & Prescriptions",
    description:
      "Receive e-prescriptions, clinical notes, and lab recommendations stored securely in your private patient vault.",
  },
  {
    icon: HeartPulse,
    title: "Vital Tracking & Health Trends",
    description:
      "Monitor blood pressure, heart rate, and health metrics over time with clinical trend alerts and doctor sharing.",
  },
  {
    icon: ShieldCheck,
    title: "Strict Patient Confidentiality",
    description:
      "Designed with medical privacy and least-privilege data access, ensuring your consultation stays completely private.",
  },
] as const;

export function Features() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" as const },
    },
  };

  return (
    <section id="services" className="px-4 sm:px-6 py-20 bg-white dark:bg-[#0B1120] border-b border-slate-200/80 dark:border-slate-800/80" aria-labelledby="services-heading">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0D9488] dark:text-[#14B8A6]">
            Healthcare Services
          </p>
          <h2
            id="services-heading"
            className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
          >
            Comprehensive care from intake to recovery
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            A cohesive telehealth workflow designed by clinical principles to remove waiting room friction.
          </p>
        </div>

        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={containerVariants}
        >
          {SERVICES.map((service) => (
            <motion.div
              key={service.title}
              variants={itemVariants}
              whileHover={shouldReduceMotion ? undefined : { y: -2 }}
              className="flex flex-col rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-6 shadow-2xs transition-shadow hover:shadow-xs"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] dark:text-[#14B8A6] border border-teal-100 dark:border-teal-900/50">
                <service.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                {service.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
