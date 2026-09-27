"use client";

import React from "react";
import {
  Lock,
  ShieldCheck,
  KeyRound,
  FileCheck2,
  Server,
  UserCheck,
} from "lucide-react";
import { motion } from "framer-motion";

const SECURITY_MEASURES = [
  {
    icon: Lock,
    title: "Encrypted Data in Transit",
    description:
      "All web and mobile traffic is served over HTTPS using TLS 1.3, ensuring health data is encrypted during network transmission.",
  },
  {
    icon: UserCheck,
    title: "Role-Based Access Control",
    description:
      "Patients and healthcare practitioners are strictly isolated. Physicians only access medical profiles for active patient consultations.",
  },
  {
    icon: KeyRound,
    title: "JWT Authentication & Sessions",
    description:
      "Cryptographically signed JSON Web Tokens and secure HTTP cookie policies protect authenticated sessions against unauthorized access.",
  },
  {
    icon: Server,
    title: "Password Hashing & Credential Safety",
    description:
      "User credentials are protected using salted cryptographic hashing algorithms, ensuring credentials cannot be retrieved in plaintext.",
  },
  {
    icon: ShieldCheck,
    title: "Secure API Architecture",
    description:
      "All backend routes enforce server-side parameter validation, input sanitization, and strict CORS policies.",
  },
  {
    icon: FileCheck2,
    title: "Private Consultation Rooms",
    description:
      "Telehealth video rooms are generated per scheduled appointment and restricted exclusively to verified participants.",
  },
];

export function Security() {
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
      id="security"
      className="px-4 sm:px-6 py-20 bg-white dark:bg-[#0B1120] border-b border-[#E2E8F0] dark:border-slate-800"
      aria-labelledby="security-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0D9488] dark:text-[#14B8A6]">
            Privacy & Trust
          </span>
          <h2
            id="security-heading"
            className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-white"
          >
            Your care deserves privacy.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            We implement rigorous technical architecture and least-privilege standards to ensure your medical conversations, history, and records remain confidential.
          </p>
        </div>

        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={containerVariants}
        >
          {SECURITY_MEASURES.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className="flex flex-col rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-[#FAFAFA] dark:bg-slate-900/60 p-6 shadow-2xs"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] dark:text-[#14B8A6] border border-teal-100 dark:border-teal-900/50">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#0F172A] dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Clinical Privacy Guarantee Banner */}
        <div className="mt-10 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-[#F5F7F6] dark:bg-slate-900/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[#0D9488] shrink-0" />
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <strong className="font-semibold text-[#0F172A] dark:text-white">Our Privacy Guarantee: </strong>
              CuraLink never monetizes personal health data, serves commercial ads, or compromises patient-doctor privilege.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap self-start sm:self-auto">
            Audit-logged infrastructure
          </span>
        </div>
      </div>
    </section>
  );
}
