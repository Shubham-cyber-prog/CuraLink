"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  Star,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Quote,
  Sparkles,
  ArrowRight,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PRICING_PLANS = [
  {
    name: "Pay-Per-Consult",
    badge: "Pay As You Go",
    price: "₹199",
    period: "per visit",
    popular: false,
    description: "Ideal for common viral fevers, single second opinions, and urgent prescriptions.",
    features: [
      "15-min HD WebRTC video consultation",
      "Instant cryptographically signed e-Prescription",
      "Free follow-up messaging for 48 hours",
      "No recurring monthly subscription",
      "Standard pharmacy delivery integration",
    ],
    ctaText: "Book Instant Consult",
    ctaHref: "/find-doctor",
  },
  {
    name: "Chronic Care Pass",
    badge: "Most Popular for Diabetes & BP",
    price: "₹999",
    period: "for 3 months",
    popular: true,
    description: "Designed for managing diabetes, hypertension, thyroid, and cholesterol trends.",
    features: [
      "Unlimited specialist follow-up video consults",
      "Continuous glucose & blood pressure trend reviews",
      "Free lab test interpretation (Thyroid, HbA1c)",
      "Priority same-day doctor slot booking",
      "Dedicated WhatsApp care coordinator",
      "10% discount on partner diagnostic tests",
    ],
    ctaText: "Start Chronic Care Pass",
    ctaHref: "/find-doctor",
  },
  {
    name: "Family Annual Shield",
    badge: "Complete Household Coverage",
    price: "₹2,499",
    period: "per year",
    popular: false,
    description: "Comprehensive 365-day healthcare coverage for up to 4 family members.",
    features: [
      "Covers up to 4 family members (Parents + Kids)",
      "Instant < 60-second emergency doctor triage",
      "Unlimited digital health records cloud storage",
      "Free pediatric & geriatric specialist visits",
      "Complimentary annual comprehensive blood panel",
      "Direct phone access to senior consultants",
    ],
    ctaText: "Protect Your Family",
    ctaHref: "/find-doctor",
  },
];

const TESTIMONIALS = [
  {
    id: 1,
    name: "Rajeshwar Sengupta",
    city: "Kolkata, WB",
    age: "54 yrs",
    condition: "Type-2 Diabetes Management",
    rating: 5,
    doctor: "Consulted Dr. Priya Sharma, MD",
    quote:
      "My fasting blood sugar was constantly 180+ mg/dL. Dr. Priya adjusted my medication over video and monitored my weekly log on CuraLink. Within 6 weeks, my HbA1c came down from 8.6 to 7.1. The instant prescription PDF made getting medicines effortless.",
  },
  {
    id: 2,
    name: "Ananya Iyer",
    city: "Bengaluru, KA",
    age: "31 yrs",
    condition: "Sudden Toddler High Fever (103°F)",
    rating: 5,
    doctor: "Consulted Dr. Vikram Seth, MD",
    quote:
      "At 11:30 PM, my 3-year-old daughter spiked a 103°F fever. We connected with a pediatrician on CuraLink in less than 90 seconds. The doctor calmed our panic, gave exact paracetamol dosing, and checked in the next morning. Absolute lifesaver for working parents.",
  },
  {
    id: 3,
    name: "Meera Kulkarni",
    city: "Pune, MH",
    age: "42 yrs",
    condition: "Hypertension & Work-Stress Insomnia",
    rating: 5,
    doctor: "Consulted Dr. Subham Nayak, MD",
    quote:
      "I had been suffering from constant morning headaches and high BP readings. Dr. Subham Nayak gave a comprehensive clinical review without rushing. He looked at my vitals on the screen and explained everything clearly. The level of care matches top private hospitals.",
  },
];

export function PricingAndTestimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const activeTest = TESTIMONIALS[currentTestimonial];

  return (
    <section className="py-20 sm:py-28 border-b border-border bg-surface-elevated/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* ─── 1. TRANSPARENT PRICING PLANS ─── */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#006D77]/10 px-3 py-1 text-xs font-semibold text-[#006D77] dark:text-[#83C5BE]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Honest & Predictable Care</span>
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0B1F33] dark:text-white leading-tight">
            Transparent pricing. Zero surprises.
          </h2>
          <p className="mt-3 text-base text-muted leading-relaxed">
            Choose pay-as-you-go visits or unlock unlimited continuous chronic care management for you and your family.
          </p>
        </div>

        {/* 3 Pricing Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                plan.popular
                  ? "border-2 border-[#006D77] dark:border-[#83C5BE] bg-surface shadow-[0_16px_50px_rgba(0,109,119,0.18)] -translate-y-2"
                  : "border border-border bg-surface hover:border-[#83C5BE]/60"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#006D77] px-4 py-1 text-xs font-bold text-white shadow-sm">
                  {plan.badge}
                </span>
              )}

              <div>
                {!plan.popular && (
                  <span className="inline-block text-[11px] font-bold text-muted uppercase tracking-wider mb-2">
                    {plan.badge}
                  </span>
                )}

                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="mt-2 text-xs text-muted leading-relaxed">{plan.description}</p>

                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-extrabold font-mono text-[#006D77] dark:text-[#83C5BE]">
                    {plan.price}
                  </span>
                  <span className="text-xs text-muted font-medium">{plan.period}</span>
                </div>

                <div className="mt-8 space-y-3 pt-6 border-t border-border">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 text-xs text-foreground">
                      <div className="h-4 w-4 shrink-0 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mt-0.5">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                      <span className="leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <Link
                  href={plan.ctaHref}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold transition-all ${
                    plan.popular
                      ? "bg-[#006D77] hover:bg-[#00565e] text-white shadow-sm hover:shadow-[0_0_20px_rgba(131,197,190,0.5)]"
                      : "bg-[#f4f8f8] dark:bg-[#112a44] hover:bg-[#e2eeee] dark:hover:bg-[#1a3c60] text-foreground border border-border"
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* ─── 2. TESTIMONIAL CAROUSEL ─── */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#006D77] dark:text-[#83C5BE]">
              Patient Experiences
            </span>
            <h3 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Real stories from recovered patients across India.
            </h3>
          </div>

          <div className="relative rounded-3xl border border-border bg-surface p-7 sm:p-10 shadow-lg">
            <Quote className="h-10 w-10 text-[#006D77]/20 dark:text-[#83C5BE]/20 mb-4" />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTest.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-1">
                  {[...Array(activeTest.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-2 text-xs font-bold text-foreground">5.0 Verified Consultation</span>
                </div>

                <p className="text-base sm:text-lg text-foreground italic leading-relaxed">
                  &ldquo;{activeTest.quote}&rdquo;
                </p>

                <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h5 className="text-sm font-bold text-foreground">{activeTest.name}</h5>
                    <p className="text-xs text-muted">
                      {activeTest.age} · {activeTest.city} · <span className="font-semibold text-[#006D77] dark:text-[#83C5BE]">{activeTest.condition}</span>
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">{activeTest.doctor}</p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-3 py-1 text-xs font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Verified Patient Record</span>
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Controls */}
            <div className="mt-8 flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      currentTestimonial === i ? "w-6 bg-[#006D77] dark:bg-[#83C5BE]" : "w-2 bg-muted/40"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevTestimonial}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface hover:bg-surface-elevated text-foreground cursor-pointer"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={nextTestimonial}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface hover:bg-surface-elevated text-foreground cursor-pointer"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
