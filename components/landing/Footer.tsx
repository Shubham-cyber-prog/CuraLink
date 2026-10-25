"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Lock, ArrowUp } from "lucide-react";

const FOOTER_COLUMNS = [
  {
    title: "Clinical Platform",
    links: [
      { label: "AI Symptom Triage", href: "/symptom-checker" },
      { label: "Verified Specialists (380+)", href: "/find-doctor" },
      { label: "HD WebRTC Video Clinic", href: "/#capabilities" },
      { label: "Digital Prescription Vault", href: "/records" },
      { label: "Chronic Vitals Tracking", href: "/vitals" },
    ],
  },
  {
    title: "Specialties",
    links: [
      { label: "Endocrinology & Diabetes", href: "/find-doctor?specialty=endocrinology" },
      { label: "Cardiology & Hypertension", href: "/find-doctor?specialty=cardiology" },
      { label: "General Internal Medicine", href: "/find-doctor?specialty=general" },
      { label: "Dermatology & Skin Care", href: "/find-doctor?specialty=dermatology" },
      { label: "Mental Health & Counseling", href: "/find-doctor?specialty=psychiatry" },
      { label: "Pediatrics & Child Wellness", href: "/find-doctor?specialty=pediatrics" },
    ],
  },
  {
    title: "Patient Services",
    links: [
      { label: "Book an Appointment", href: "/find-doctor" },
      { label: "Patient Health Portal", href: "/login" },
      { label: "Track Vitals & Trends", href: "/vitals" },
      { label: "Download Prescriptions", href: "/records" },
      { label: "Patient Rights & Safety", href: "/#security" },
    ],
  },
  {
    title: "For Clinicians",
    links: [
      { label: "Join Doctor Network (0% Fee)", href: "/register?role=doctor" },
      { label: "Doctor Practice EMR", href: "/login" },
      { label: "NMC Credential Verification", href: "/#for-doctors" },
      { label: "Instant Daily Razorpay Payouts", href: "/#for-doctors" },
      { label: "Telemedicine Practice Standards", href: "/#security" },
    ],
  },
  {
    title: "Governance & Legal",
    links: [
      { label: "Privacy Policy (DPDP 2023)", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Cancellation & Refund Policy", href: "/cancellation-policy" },
      { label: "MeitY Data Sovereignty", href: "/#security" },
    ],
  },
];

export function Footer() {
  const stageRef = useRef<HTMLDivElement>(null);
  const radialGradientRef = useRef<SVGRadialGradientElement>(null);
  const targetPos = useRef({ x: 800, y: 160 });
  const currentPos = useRef({ x: 800, y: 160 });
  const rafId = useRef<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [cookieAccepted, setCookieAccepted] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const grad = radialGradientRef.current;
    if (!stage || !grad) return;

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const animate = () => {
      // Smooth physical inertia glide (0.09 factor)
      currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.09);
      currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.09);

      grad.setAttribute("cx", currentPos.current.x.toFixed(1));
      grad.setAttribute("cy", currentPos.current.y.toFixed(1));

      // Update ambient CSS glow on the container
      stage.style.setProperty("--ambient-x", `${((currentPos.current.x / 1600) * 100).toFixed(1)}%`);
      stage.style.setProperty("--ambient-y", `${((currentPos.current.y / 320) * 100).toFixed(1)}%`);

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    const onMouseEnter = (e: MouseEvent) => {
      setIsHovered(true);
      const r = stage.getBoundingClientRect();
      const newX = Math.max(0, Math.min(1600, ((e.clientX - r.left) / r.width) * 1600));
      const newY = Math.max(0, Math.min(320, ((e.clientY - r.top) / r.height) * 320));
      targetPos.current = { x: newX, y: newY };
      currentPos.current = { x: newX, y: newY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const r = stage.getBoundingClientRect();
      targetPos.current = {
        x: Math.max(0, Math.min(1600, ((e.clientX - r.left) / r.width) * 1600)),
        y: Math.max(0, Math.min(320, ((e.clientY - r.top) / r.height) * 320)),
      };
    };

    const onMouseLeave = () => {
      setIsHovered(false);
    };

    stage.addEventListener("mouseenter", onMouseEnter);
    stage.addEventListener("mousemove", onMouseMove);
    stage.addEventListener("mouseleave", onMouseLeave);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      stage.removeEventListener("mouseenter", onMouseEnter);
      stage.removeEventListener("mousemove", onMouseMove);
      stage.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#0A0B0E] text-slate-300 pt-16 sm:pt-20 overflow-hidden border-t border-slate-800/60">
      {/* ─── 1. TOP HEALTHCARE NAVIGATION DIRECTORY ─── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10 pb-12 border-b border-white/5">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                {col.title}
              </h4>
              <ul className="space-y-2 text-xs">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-[#83C5BE] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 24/7 Helpline & Compliance Bar */}
        <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              24/7 Clinical Emergency Line:{" "}
              <a href="tel:18002024455" className="font-bold text-[#83C5BE] hover:underline">
                1800-202-4455
              </a>{" "}
              (SOS: 112)
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#83C5BE]" />
              <span>NMC & DPDP 2023 Aligned</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-[#83C5BE]" />
              <span>256-Bit Encrypted WebRTC</span>
            </span>
          </div>
        </div>
      </div>

      {/* ─── 2. EXACT MICRO1-STYLE INTERACTIVE WATERMARK STAGE ─── */}
      <div
        ref={stageRef}
        className="relative w-full overflow-hidden select-none cursor-default pt-24 sm:pt-32 pb-0 flex flex-col justify-end bg-[#0A0B0E]"
      >
        {/* Subtle dot grid texture underneath */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_75%,transparent_100%)] opacity-20"
        />

        {/* Ambient flashlight glow behind text — only visible on hover */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-out"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(circle 850px at var(--ambient-x, 50%) var(--ambient-y, 50%), rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 45%, transparent 75%)`,
          }}
        />

        {/* 
          GPU-Accelerated SVG Native Text Fill:
          - By default (no hover): Text is purely in dark matte graphite (#181a22). Flash is completely OFF.
          - On mouse hover: The illuminated gradient smoothly fades in right under the cursor.
          - On mouse leave: Smoothly fades out back to the pure dark monolithic state.
        */}
        <div className="w-full relative z-10 overflow-hidden leading-none px-2 sm:px-6 flex justify-center">
          <svg
            viewBox="0 0 1600 320"
            className="w-full h-auto overflow-hidden block select-none pointer-events-none"
            preserveAspectRatio="xMidYMax meet"
            style={{ marginBottom: "-1.5%" }}
          >
            <defs>
              <radialGradient
                ref={radialGradientRef}
                id="micro1-torch-gradient"
                gradientUnits="userSpaceOnUse"
                cx="800"
                cy="160"
                r="700"
              >
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="18%" stopColor="#d4d8e2" />
                <stop offset="38%" stopColor="#9aa0ad" />
                <stop offset="56%" stopColor="#474d5c" />
                <stop offset="76%" stopColor="#222530" />
                <stop offset="100%" stopColor="#181a22" />
              </radialGradient>
            </defs>

            {/* Layer 1: Dark Matte Graphite Base (Always visible in dark, no flash) */}
            <text
              x="800"
              y="308"
              textAnchor="middle"
              fill="#181a22"
              fontSize="270"
              fontWeight="900"
              letterSpacing="-0.07em"
              fontFamily="var(--font-geist-sans), Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
            >
              curalink.
            </text>

            {/* Layer 2: Flashlight Illuminated Layer (Only visible when mouse enters / hovers) */}
            <text
              x="800"
              y="308"
              textAnchor="middle"
              fill="url(#micro1-torch-gradient)"
              fontSize="270"
              fontWeight="900"
              letterSpacing="-0.07em"
              fontFamily="var(--font-geist-sans), Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
              className="transition-opacity duration-300 ease-out"
              style={{ opacity: isHovered ? 1 : 0 }}
            >
              curalink.
            </text>
          </svg>

          {/* Floating Discreet Cookie Compliance Badge */}
          {!cookieAccepted && (
            <div className="absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-[#0d1420]/85 backdrop-blur-md px-4 py-1.5 text-xs text-slate-300 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
                <span className="text-[11px] sm:text-xs">
                  By using curalink, you accept our{" "}
                  <Link
                    href="/privacy-policy"
                    className="underline hover:text-white transition-colors"
                  >
                    medical tele-terms
                  </Link>
                  .
                </span>
                <button
                  type="button"
                  onClick={() => setCookieAccepted(true)}
                  className="rounded-full bg-slate-800 hover:bg-slate-700 text-white font-medium px-3 py-1 text-xs transition-colors cursor-pointer"
                >
                  Accept
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── 3. BOTTOM ROW: Copyright & Brand Tagline ─── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 w-full pt-4 pb-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 relative z-10">
          <div>
            &copy; {new Date().getFullYear()} curalink Telehealth Technologies Inc. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <span className="text-slate-400 font-medium tracking-tight">
              Engineered for Instant Medical Access
            </span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              aria-label="Back to top"
            >
              <span>Top</span>
              <ArrowUp className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
