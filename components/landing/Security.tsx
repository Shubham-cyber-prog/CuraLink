"use client";

import { Lock, ShieldCheck, FileCheck2 } from "lucide-react";
import { motion } from "framer-motion";
import { staggerGrid, cardReveal, fadeInUp } from "@/components/motion/variants";

const ITEMS = [
  {
    icon: Lock,
    title: "Encryption in transit and at rest",
    body: "Consultations and attachments stay inside a locked workspace — not a consumer messenger.",
  },
  {
    icon: ShieldCheck,
    title: "HIPAA-aligned controls",
    body: "Access, audit, and least-privilege defaults designed for regulated care — not a generic SaaS template.",
  },
  {
    icon: FileCheck2,
    title: "Clear clinical boundaries",
    body: "AI is triage and context, never a diagnosis. Licensed clinicians remain accountable for care.",
  },
];

export function Security() {
  return (
    <section id="security" className="px-6 py-24" aria-labelledby="security-heading">
      <motion.div
        className="mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] bg-[#06241C] border border-teal-900/60 px-6 py-16 text-white sm:px-12 shadow-sm"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={staggerGrid}
      >
        <motion.p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300" variants={fadeInUp}>Trust</motion.p>
        <motion.h2 id="security-heading" className="mt-3 max-w-xl text-3xl tracking-tight sm:text-4xl" variants={fadeInUp}>
          Healthcare-grade privacy,{" "}
          <span className="font-display italic text-teal-200">without the theater</span>
        </motion.h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {ITEMS.map((item) => (
            <motion.article key={item.title} variants={cardReveal}>
              <item.icon className="h-5 w-5 text-teal-300" aria-hidden="true" />
              <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-teal-100/70">{item.body}</p>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
