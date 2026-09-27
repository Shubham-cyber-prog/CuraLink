"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Capabilities", href: "/#capabilities" },
  { label: "Intake Flow", href: "/#clinical-intake" },
  { label: "Physicians", href: "/#physicians" },
  { label: "Security", href: "/#security" },
  { label: "For Clinicians", href: "/#for-doctors" },
];

export function SiteHeader() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  // Smooth scroll transformations (shrinks ~18% in height, intensifies blur & border)
  const navPaddingY = useTransform(scrollY, [0, 80], ["8px", "6px"]);
  const navPaddingX = useTransform(scrollY, [0, 80], ["20px", "16px"]);
  const navBackground = useTransform(
    scrollY,
    [0, 80],
    ["rgba(10, 15, 13, 0.82)", "rgba(10, 15, 13, 0.94)"]
  );
  const navBorderColor = useTransform(
    scrollY,
    [0, 80],
    ["rgba(255, 255, 255, 0.10)", "rgba(255, 255, 255, 0.18)"]
  );
  const navShadow = useTransform(
    scrollY,
    [0, 80],
    [
      "0 8px 30px -4px rgba(0, 0, 0, 0.4)",
      "0 14px 40px -4px rgba(0, 0, 0, 0.6)",
    ]
  );

  return (
    <header className="fixed inset-x-0 top-4 sm:top-6 z-50 flex justify-center px-4 sm:px-6 pointer-events-none">
      {/* Floating Pill Container */}
      <motion.nav
        initial={{ y: -24, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          paddingTop: navPaddingY,
          paddingBottom: navPaddingY,
          paddingLeft: navPaddingX,
          paddingRight: navPaddingX,
          backgroundColor: navBackground,
          borderColor: navBorderColor,
          boxShadow: navShadow,
        }}
        className="pointer-events-auto relative flex items-center justify-between gap-2 sm:gap-4 lg:gap-6 rounded-full border backdrop-blur-md max-w-5xl w-full text-white/90 shadow-2xl"
        aria-label="Primary Navigation"
      >
        {/* Left: Two-Tone Brand Logo from Logo.tsx */}
        <div className="flex items-center gap-2 shrink-0">
          <Logo href="/" size="sm" inverted />
          <span className="hidden xl:inline-block text-[10px] uppercase font-mono tracking-widest text-emerald-400/80 bg-emerald-950/60 border border-emerald-500/20 px-1.5 py-0.5 rounded-full ml-1">
            CLINICAL
          </span>
        </div>

        {/* Center: Sliding Pill Navigation (Desktop: lg+) */}
        <div
          className="hidden lg:flex items-center gap-0.5 xl:gap-1 relative"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {NAV_LINKS.map((link, idx) => (
            <Link
              key={link.label}
              href={link.href}
              onMouseEnter={() => setHoveredIndex(idx)}
              className="relative px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-colors duration-150 rounded-full"
            >
              {hoveredIndex === idx && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-white/10 border border-white/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Right: Theme Toggle, Auth & Primary Action CTA */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <ThemeToggle className="h-8 w-8 rounded-full text-white/80 hover:bg-white/10 hover:text-white border border-white/10" />

          <Link
            href="/login"
            className="hidden sm:inline-flex text-xs font-medium text-white/70 hover:text-white transition-colors px-2 py-1.5"
          >
            Sign In
          </Link>

          {/* Premium CTA with Sweep-Fill Hover Effect, nested cleanly within pill */}
          <Link
            href="/register"
            className="group relative inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-full bg-[#085041] px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-white border border-emerald-400/35 transition-all hover:border-emerald-400/70 hover:bg-[#0b5f4e] shadow-xs shrink-0"
          >
            <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
              <span>Get Started</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
            {/* Animated sweep highlight on hover */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-emerald-500/0 via-emerald-400/25 to-emerald-500/0 transition-transform duration-500 group-hover:translate-x-full" />
          </Link>

          {/* Mobile/tablet hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-colors shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile/Tablet Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto absolute top-16 inset-x-4 max-w-sm mx-auto rounded-3xl bg-[#0A0F0D]/95 border border-white/15 p-5 shadow-2xl backdrop-blur-xl lg:hidden text-white"
          >
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 mt-1 border-t border-white/10 flex flex-col gap-2">
                <div className="flex items-center justify-between px-3.5 py-1 text-sm font-medium text-white/70">
                  <span>Theme</span>
                  <ThemeToggle className="h-8 w-8 rounded-full text-white/80 hover:bg-white/10 hover:text-white border border-white/10" />
                </div>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-sm font-medium text-center text-white/70 hover:text-white hover:bg-white/10"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="px-3.5 py-2.5 rounded-full text-xs font-semibold text-center bg-[#085041] text-white border border-emerald-400/30"
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
