/**
 * CuraLink — Landing Page
 *
 * Design philosophy: Calm, trustworthy, clinical precision.
 * References: Linear, Stripe, Cal.com — typographic hierarchy,
 * generous white space, restrained color palette.
 *
 * Architecture: Single-file page with small co-located components
 * for readability and interview explainability.
 *
 * Why "use client"? We use scroll-based intersection observers
 * for fade-in animations and a mobile menu toggle — both require
 * browser APIs / useState. In a production app, you'd split
 * just the interactive parts into client components.
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bot,
  CalendarCheck,
  MessageCircle,
  ArrowRight,
  Menu,
  X,
  HeartPulse,
  Shield,
  Clock,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS (centralized so changes propagate everywhere)
// Primary: calm teal-blue — medical trust without feeling sterile
// Text: soft charcoal — warmer and easier on the eye than pure #000
// ─────────────────────────────────────────────────────────────────────────────
const accent = "text-teal-600";
const accentBg = "bg-teal-600";
const accentHover = "hover:bg-teal-700";
const accentBorder = "border-teal-600";
const charcoal = "text-slate-800";
const muted = "text-slate-500";

// ─────────────────────────────────────────────────────────────────────────────
// HOOK: Fade-in on scroll using IntersectionObserver
// Returns a ref and a boolean `isVisible`. Attach ref to any element
// you want to animate into view. Threshold 0.15 = trigger when 15% visible.
// ─────────────────────────────────────────────────────────────────────────────
function useFadeIn(threshold = 0.15): [(node: HTMLDivElement | null) => void, boolean] {
  const [isVisible, setIsVisible] = useState(false);
  const [element, setElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [element, threshold]);

  return [setElement, isVisible];
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: FeatureCard
// Minimal card with lucide icon, title, and short description.
// Subtle border + shadow on hover to create depth without noise.
// ─────────────────────────────────────────────────────────────────────────────
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <article
      className="group flex flex-col gap-4 rounded-xl border border-slate-100 bg-white p-8
                 shadow-sm transition-all duration-300 hover:border-teal-100 hover:shadow-md"
    >
      {/* Icon container — restrained teal tint, not fluorescent */}
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-600
                      transition-colors duration-300 group-hover:bg-teal-100">
        {icon}
      </div>
      <h3 className={`text-lg font-semibold tracking-tight ${charcoal}`}>{title}</h3>
      <p className={`text-sm leading-relaxed ${muted}`}>{description}</p>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: StepCard
// Numbered step card for the "How it works" section.
// Number is displayed large, acting as a visual anchor.
// ─────────────────────────────────────────────────────────────────────────────
interface StepCardProps {
  step: number;
  title: string;
  description: string;
}

function StepCard({ step, title, description }: StepCardProps) {
  return (
    <article className="flex flex-col gap-3">
      {/* Step number — oversized, light teal, purely decorative so aria-hidden */}
      <span aria-hidden="true" className="text-5xl font-bold text-teal-100 select-none">
        {String(step).padStart(2, "0")}
      </span>
      <h3 className={`text-base font-semibold tracking-tight ${charcoal}`}>{title}</h3>
      <p className={`text-sm leading-relaxed ${muted}`}>{description}</p>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: Navbar
// Sticky, minimal. Solid white background on scroll.
// Mobile: hamburger toggles a simple full-width menu.
// ─────────────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "About", href: "#" },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300
        ${scrolled ? "border-b border-slate-100 bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent"}`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className={`flex items-center gap-2 text-xl font-bold tracking-tight ${charcoal}`}
          aria-label="CuraLink home"
        >
          <HeartPulse className="h-5 w-5 text-teal-600" aria-hidden="true" />
          CuraLink
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-sm font-medium ${muted} transition-colors hover:text-slate-800`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className={`text-sm font-medium ${muted} transition-colors hover:text-slate-800`}
          >
            Log in
          </Link>
          <Link
            href="/register"
            className={`rounded-lg ${accentBg} ${accentHover} px-4 py-2 text-sm font-medium text-white
                       transition-colors duration-200`}
          >
            Get started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex items-center md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen
            ? <X className="h-5 w-5 text-slate-600" />
            : <Menu className="h-5 w-5 text-slate-600" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-6 pb-6 pt-4 md:hidden">
          <nav className="flex flex-col gap-4" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium ${muted}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-slate-100" />
            <Link
              href="/login"
              className={`text-sm font-medium ${muted}`}
              onClick={() => setMobileOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/register"
              className={`rounded-lg ${accentBg} px-4 py-2.5 text-center text-sm font-medium text-white`}
              onClick={() => setMobileOpen(false)}
            >
              Get started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: HeroGraphic
// Abstract SVG visual — overlapping circles/rings representing connection
// and health. No stock photography — clean, geometric, on-brand.
// Using aria-hidden because it's purely decorative.
// ─────────────────────────────────────────────────────────────────────────────
function HeroGraphic() {
  return (
    <div className="pointer-events-none select-none" aria-hidden="true">
      <svg
        width="480"
        height="340"
        viewBox="0 0 480 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-lg opacity-90"
        role="presentation"
      >
        {/* Outer ring — teal, low opacity */}
        <circle cx="240" cy="170" r="150" stroke="#0d9488" strokeWidth="1" opacity="0.15" />
        <circle cx="240" cy="170" r="120" stroke="#0d9488" strokeWidth="1" opacity="0.2" />
        <circle cx="240" cy="170" r="90" stroke="#0d9488" strokeWidth="1.5" opacity="0.25" />

        {/* Central circle — solid teal fill */}
        <circle cx="240" cy="170" r="48" fill="#f0fdfa" stroke="#0d9488" strokeWidth="1.5" />

        {/* Heart pulse icon path centered */}
        <path
          d="M218 170 h10 l5-16 l8 32 l6-20 h10 h6"
          stroke="#0d9488"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Satellite node — Doctor */}
        <circle cx="90" cy="90" r="32" fill="#f0fdfa" stroke="#0d9488" strokeWidth="1" opacity="0.8" />
        <line x1="90" y1="90" x2="195" y2="138" stroke="#0d9488" strokeWidth="0.75" strokeDasharray="4 3" opacity="0.4" />

        {/* Satellite node — Patient */}
        <circle cx="390" cy="90" r="32" fill="#f0fdfa" stroke="#0d9488" strokeWidth="1" opacity="0.8" />
        <line x1="390" y1="90" x2="285" y2="138" stroke="#0d9488" strokeWidth="0.75" strokeDasharray="4 3" opacity="0.4" />

        {/* Satellite node — AI */}
        <circle cx="240" cy="295" r="28" fill="#f0fdfa" stroke="#0d9488" strokeWidth="1" opacity="0.8" />
        <line x1="240" y1="267" x2="240" y2="218" stroke="#0d9488" strokeWidth="0.75" strokeDasharray="4 3" opacity="0.4" />

        {/* Label text */}
        <text x="90" y="94" textAnchor="middle" fontSize="9" fill="#0f766e" fontFamily="system-ui" fontWeight="500">DOCTOR</text>
        <text x="390" y="94" textAnchor="middle" fontSize="9" fill="#0f766e" fontFamily="system-ui" fontWeight="500">PATIENT</text>
        <text x="240" y="299" textAnchor="middle" fontSize="9" fill="#0f766e" fontFamily="system-ui" fontWeight="500">AI</text>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [featuresRef, isFeaturesVisible] = useFadeIn();
  const [stepsRef, isStepsVisible] = useFadeIn();
  const [ctaRef, isCtaVisible] = useFadeIn();

  return (
    <>
      {/* ── Metadata is handled in layout.tsx — page is a client component ── */}
      <Navbar />

      <main className="flex flex-col">

        {/* ──────────────────────────────────────────────────────────────────
            SECTION 1: HERO
            Full-height section. Large typographic headline is the first
            thing a user reads. Subheading clarifies the value proposition.
            Two CTAs: primary (filled) and secondary (ghost border).
        ────────────────────────────────────────────────────────────────── */}
        <section
          className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden
                     bg-white px-6 pt-24 pb-16 text-center"
          aria-label="Hero"
        >
          {/* Subtle background grid — geometric texture, not a gradient */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            aria-hidden="true"
            style={{
              backgroundImage:
                "linear-gradient(#0d9488 1px, transparent 1px), linear-gradient(90deg, #0d9488 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-6 max-w-4xl mx-auto">
            {/* Trust badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full border border-teal-100
                         bg-teal-50 px-4 py-1.5 text-xs font-medium text-teal-700"
            >
              <Shield className="h-3 w-3" aria-hidden="true" />
              HIPAA-aligned. Built for healthcare.
            </div>

            {/* Primary headline — typography is the hero */}
            <h1
              className={`text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl ${charcoal}`}
            >
              Healthcare that meets you{" "}
              <span className={accent}>where you are.</span>
            </h1>

            {/* Subheading — one clear, calm sentence */}
            <p className={`max-w-xl text-lg leading-relaxed ${muted}`}>
              CuraLink connects you with licensed doctors instantly. Describe your symptoms,
              get AI-powered guidance, and book a real-time consultation — from your phone or desktop.
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className={`inline-flex items-center gap-2 rounded-lg ${accentBg} ${accentHover}
                           px-6 py-3 text-sm font-semibold text-white shadow-sm
                           transition-all duration-200 hover:shadow-md`}
              >
                Get started free
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="#how-it-works"
                className={`inline-flex items-center gap-2 rounded-lg border ${accentBorder}
                           bg-transparent px-6 py-3 text-sm font-semibold text-teal-600
                           transition-colors duration-200 hover:bg-teal-50`}
              >
                See how it works
              </Link>
            </div>

            {/* Hero graphic */}
            <div className="mt-8">
              <HeroGraphic />
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────────────
            SECTION 2: SOCIAL PROOF / TRUST STRIP
            Minimal stat row. Placeholder numbers — replace with real data.
            The dividing line above/below keeps it visually contained.
        ────────────────────────────────────────────────────────────────── */}
        <section
          className="border-y border-slate-100 bg-slate-50 py-12 px-6"
          aria-label="Platform statistics"
        >
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 text-center md:grid-cols-4">
            {[
              { stat: "10,000+", label: "Patients served" },
              { stat: "500+", label: "Licensed doctors" },
              { stat: "<5 min", label: "Average wait time" },
              { stat: "24/7", label: "AI availability" },
            ].map(({ stat, label }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className={`text-2xl font-bold tracking-tight ${charcoal}`}>{stat}</span>
                <span className={`text-xs uppercase tracking-widest ${muted}`}>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────────────
            SECTION 3: FEATURES
            Three-column card grid. Each card: icon, title, description.
            Fades in on scroll via IntersectionObserver.
            aria-labelledby ties the section heading to its content.
        ────────────────────────────────────────────────────────────────── */}
        <section
          id="features"
          className="bg-white px-6 py-24"
          aria-labelledby="features-heading"
        >
          <div
            ref={featuresRef}
            className={`mx-auto max-w-6xl transition-all duration-700
              ${isFeaturesVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
          >
            {/* Section label + heading */}
            <div className="mb-14 flex flex-col items-center gap-3 text-center">
              <span className={`text-xs font-semibold uppercase tracking-widest ${accent}`}>
                What we offer
              </span>
              <h2
                id="features-heading"
                className={`text-3xl font-bold tracking-tight md:text-4xl ${charcoal}`}
              >
                Everything you need for modern healthcare
              </h2>
              <p className={`max-w-md text-base leading-relaxed ${muted}`}>
                Three core features — designed to remove friction between you and quality medical care.
              </p>
            </div>

            {/* Feature cards grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Bot className="h-5 w-5" aria-hidden="true" />}
                title="AI Symptom Checker"
                description="Describe what you're feeling in plain language. Our AI analyses your symptoms and provides informed, preliminary guidance before you speak to a doctor."
              />
              <FeatureCard
                icon={<CalendarCheck className="h-5 w-5" aria-hidden="true" />}
                title="Instant Doctor Booking"
                description="Browse verified, licensed doctors by specialty and availability. Book a confirmed appointment in under a minute — no waiting rooms, no phone calls."
              />
              <FeatureCard
                icon={<MessageCircle className="h-5 w-5" aria-hidden="true" />}
                title="Real-time Consultation Chat"
                description="Connect with your doctor through a secure, real-time chat interface. Share documents, images, and get professional medical advice from wherever you are."
              />
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────────────
            SECTION 4: HOW IT WORKS
            3-step horizontal process on desktop, stacked on mobile.
            Step numbers are large, decorative (aria-hidden), acting as
            visual anchors to guide the reader's eye through the flow.
        ────────────────────────────────────────────────────────────────── */}
        <section
          id="how-it-works"
          className="bg-slate-50 px-6 py-24"
          aria-labelledby="steps-heading"
        >
          <div
            ref={stepsRef}
            className={`mx-auto max-w-6xl transition-all duration-700 delay-100
              ${isStepsVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
          >
            <div className="mb-14 flex flex-col items-center gap-3 text-center">
              <span className={`text-xs font-semibold uppercase tracking-widest ${accent}`}>
                The process
              </span>
              <h2
                id="steps-heading"
                className={`text-3xl font-bold tracking-tight md:text-4xl ${charcoal}`}
              >
                Three steps to better care
              </h2>
            </div>

            <div className="grid gap-12 md:grid-cols-3 md:gap-8">
              {/* Divider lines between steps on desktop */}
              <StepCard
                step={1}
                title="Describe your symptoms"
                description="Tell our AI what you're experiencing — in your own words, at any time of day. No medical jargon required."
              />
              <StepCard
                step={2}
                title="Get matched with a doctor"
                description="Based on your symptoms and preferences, CuraLink surfaces the most relevant licensed specialists available right now."
              />
              <StepCard
                step={3}
                title="Chat and book instantly"
                description="Confirm your appointment, jump into a secure real-time consultation, and receive professional guidance within minutes."
              />
            </div>

            {/* Subtle connector line — desktop only, decorative */}
            <div className="mt-8 hidden justify-center md:flex" aria-hidden="true">
              <div className="h-px w-2/3 bg-gradient-to-r from-transparent via-teal-200 to-transparent" />
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────────────
            SECTION 5: CLOSING CTA
            Clean, centered, one strong call-to-action.
            No competing elements — the button should be unmissable.
        ────────────────────────────────────────────────────────────────── */}
        <section
          className="bg-white px-6 py-28 text-center"
          aria-labelledby="cta-heading"
        >
          <div
            ref={ctaRef}
            className={`mx-auto max-w-2xl flex flex-col items-center gap-6 transition-all duration-700 delay-150
              ${isCtaVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
          >
            {/* Clock icon — reinforces the "anytime" message */}
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
              <Clock className="h-6 w-6 text-teal-600" aria-hidden="true" />
            </div>

            <h2
              id="cta-heading"
              className={`text-3xl font-bold tracking-tight md:text-4xl ${charcoal}`}
            >
              Your health can&apos;t wait.
            </h2>
            <p className={`text-base leading-relaxed ${muted} max-w-md`}>
              Join thousands of patients who have taken control of their healthcare.
              Get started in minutes — no insurance required.
            </p>

            <Link
              href="/register"
              className={`inline-flex items-center gap-2 rounded-lg ${accentBg} ${accentHover}
                         px-8 py-3.5 text-sm font-semibold text-white shadow-sm
                         transition-all duration-200 hover:shadow-md`}
            >
              Create your free account
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <p className={`text-xs ${muted}`}>
              No credit card required &middot; Cancel anytime
            </p>
          </div>
        </section>
      </main>

      {/* ──────────────────────────────────────────────────────────────────
          FOOTER
          Minimal. Medical disclaimer is prominent — this is a healthcare
          product and this text is ethically and legally important.
          Links are secondary — focus is on the disclaimer.
      ────────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-6xl flex flex-col gap-8 md:flex-row md:items-start md:justify-between">

          {/* Brand column */}
          <div className="flex flex-col gap-3 max-w-xs">
            <Link
              href="/"
              className={`flex items-center gap-2 text-base font-bold tracking-tight ${charcoal}`}
              aria-label="CuraLink home"
            >
              <HeartPulse className="h-4 w-4 text-teal-600" aria-hidden="true" />
              CuraLink
            </Link>
            <p className={`text-xs leading-relaxed ${muted}`}>
              Connecting patients and doctors through intelligent, accessible telehealth.
            </p>
          </div>

          {/* Footer nav */}
          <nav
            className="flex flex-wrap gap-x-8 gap-y-3 text-sm"
            aria-label="Footer navigation"
          >
            {[
              { label: "About", href: "#" },
              { label: "Privacy Policy", href: "#" },
              { label: "Terms of Service", href: "#" },
              { label: "Contact", href: "#" },
              { label: "For Doctors", href: "#" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`${muted} transition-colors hover:text-slate-700`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Medical disclaimer — given its own visual weight (border-top, smaller text) */}
        <div className="mx-auto mt-8 max-w-6xl border-t border-slate-100 pt-6">
          <p className="text-xs leading-relaxed text-slate-400 max-w-3xl">
            <span className="font-semibold text-slate-500">Medical Disclaimer: </span>
            CuraLink&apos;s AI provides preliminary informational guidance only and does not constitute
            a medical diagnosis. Always consult a licensed healthcare professional for medical advice,
            diagnosis, or treatment. In case of emergency, call your local emergency services immediately.
          </p>
          <p className={`mt-4 text-xs ${muted}`}>
            &copy; {new Date().getFullYear()} CuraLink. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
