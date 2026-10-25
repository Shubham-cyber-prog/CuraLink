"use client";

import React from "react";
import { Shield, Lock, Server, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const SECURITY_ITEMS = [
  {
    icon: Shield,
    title: "NMC Guidelines Compliant",
    description: "Every doctor is NMC verified. Telemedicine practice standards are strictly followed for all virtual consults.",
  },
  {
    icon: Lock,
    title: "DPDP Act 2023 Protected",
    description: "Your health records are stored with explicit consent protocols. Zero non-consensual sharing or advertising.",
  },
  {
    icon: ShieldCheck,
    title: "256-Bit AES Encryption",
    description: "Video streams, medical chats, and clinical records are end-to-end encrypted in transit and at rest.",
  },
  {
    icon: Server,
    title: "Indian Data Sovereignty",
    description: "All electronic medical records are hosted strictly in domestic, MeitY-empaneled Indian data centers.",
  },
];

export function Security() {
  return (
    <section id="security" className="py-20 sm:py-24 border-b border-border bg-surface-elevated/40">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#006D77]">
            Security & Compliance
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Your medical privacy, rigorously protected.
          </h2>
          <p className="mt-3 text-base text-muted leading-relaxed">
            Built from the ground up to comply with Indian healthcare regulations and global privacy standards.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          {SECURITY_ITEMS.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
              className="flex gap-4 p-6 rounded-2xl border border-border bg-surface hover:border-[#83C5BE]/50 transition-colors"
            >
              <div className="h-10 w-10 shrink-0 rounded-xl bg-[#006D77]/10 text-[#006D77] flex items-center justify-center">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                <p className="mt-1.5 text-sm text-muted leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
