"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  PhoneCall,
  Search,
  Calendar,
  ArrowRight,
  ChevronDown,
  Activity,
  Heart,
  Brain,
  Bone,
  Baby,
  Smile,
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
  Star,
  Video,
  FileText,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SPECIALTIES = [
  { name: "General Medicine", desc: "Fevers, seasonal flu & infections", price: "₹199", wait: "< 2 min", icon: Stethoscope, href: "/find-doctor?specialty=general" },
  { name: "Endocrinology", desc: "Type 1 & 2 diabetes, thyroid, HbA1c", price: "₹299", wait: "< 4 min", icon: Activity, href: "/find-doctor?specialty=endocrinology" },
  { name: "Cardiology", desc: "High blood pressure, ECG & heart health", price: "₹499", wait: "< 8 min", icon: Heart, href: "/find-doctor?specialty=cardiology" },
  { name: "Dermatology", desc: "Acne, eczema, rashes & hair fall", price: "₹299", wait: "< 5 min", icon: Sparkles, href: "/find-doctor?specialty=dermatology" },
  { name: "Pediatrics", desc: "Infant wellness, fevers & vaccines", price: "₹349", wait: "< 3 min", icon: Baby, href: "/find-doctor?specialty=pediatrics" },
  { name: "Mental Health", desc: "Anxiety, stress, therapy & insomnia", price: "₹499", wait: "< 10 min", icon: Smile, href: "/find-doctor?specialty=psychiatry" },
];

const SEARCH_DATABASE = [
  { title: "Dr. Subham Nayak, MD", type: "Doctor", subtitle: "AIIMS New Delhi · Internal Medicine (12 yrs exp)", href: "/find-doctor?doctor=Dr.%20Subham%20Nayak" },
  { title: "Dr. Priya Sharma, MD", type: "Doctor", subtitle: "Apollo Hospitals · Endocrinology (9 yrs exp)", href: "/find-doctor?doctor=Dr.%20Priya%20Sharma" },
  { title: "Type-2 Diabetes Management", type: "Condition", subtitle: "HbA1c > 7.0, Insulin therapy", href: "/find-doctor?specialty=endocrinology" },
  { title: "High Blood Pressure (Hypertension)", type: "Condition", subtitle: "BP Readings > 130/85", href: "/find-doctor?specialty=cardiology" },
  { title: "AI Symptom Triage Tool", type: "Free AI", subtitle: "Check urgency in 60 seconds", href: "/symptom-checker" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSpecialtiesOpen, setIsSpecialtiesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { setTheme, resolvedTheme } = useTheme();

  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsSpecialtiesOpen(false);
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setIsSpecialtiesOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsSpecialtiesOpen(false);
    }, 150);
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const filteredResults = searchQuery.trim()
    ? SEARCH_DATABASE.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : SEARCH_DATABASE.slice(0, 4);

  return (
    <>
      {/* ─── FLOATING MODERN PREMIUM GLASSMORPHISM NAVBAR ─── */}
      <header className="fixed inset-x-0 top-3 sm:top-5 z-50 flex justify-center px-3 sm:px-6 pointer-events-none">
        <nav
          className={`pointer-events-auto flex items-center justify-between gap-3 sm:gap-6 rounded-full transition-all duration-300 w-full max-w-6xl px-4 sm:px-6 py-2.5 sm:py-3 ${
            isScrolled
              ? "bg-white/85 dark:bg-[#0B1F33]/85 backdrop-blur-2xl border border-border/80 shadow-[0_12px_36px_rgba(0,0,0,0.12)]"
              : "bg-white/70 dark:bg-[#0B1F33]/70 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
          }`}
        >
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#006D77] to-[#0B1F33] text-white shadow-sm p-1.5 transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="CuraLink Healthcare Logo"
                width={36}
                height={36}
                className="object-contain w-full h-full"
                priority
              />
            </div>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#0B1F33] dark:text-white leading-none">
              cura<span className="text-[#006D77] dark:text-[#83C5BE]">link</span>
            </span>
          </Link>

          {/* Centered Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-sm font-medium">
            {/* Specialties with Floating Dropdown */}
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors cursor-pointer text-xs sm:text-sm ${
                  isSpecialtiesOpen
                    ? "text-[#006D77] dark:text-[#83C5BE] bg-[#006D77]/10"
                    : "text-muted hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <span>Specialties</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    isSpecialtiesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isSpecialtiesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2 w-[540px] rounded-3xl border border-border bg-white/95 dark:bg-[#0B1F33]/95 backdrop-blur-2xl shadow-2xl p-4 z-50"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      {SPECIALTIES.map((spec) => (
                        <Link
                          key={spec.name}
                          href={spec.href}
                          onClick={() => setIsSpecialtiesOpen(false)}
                          className="flex items-start gap-2.5 p-2.5 rounded-2xl hover:bg-[#006D77]/8 dark:hover:bg-white/5 transition-colors group"
                        >
                          <div className="h-8 w-8 rounded-xl bg-[#006D77]/10 text-[#006D77] dark:text-[#83C5BE] flex items-center justify-center shrink-0 mt-0.5">
                            <spec.icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-bold text-foreground group-hover:text-[#006D77] dark:group-hover:text-[#83C5BE]">
                                {spec.name}
                              </h5>
                              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                {spec.price}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted truncate mt-0.5">{spec.desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
                      <span className="text-muted flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>380+ NMC Verified Doctors Online</span>
                      </span>
                      <Link
                        href="/find-doctor"
                        onClick={() => setIsSpecialtiesOpen(false)}
                        className="font-bold text-[#006D77] dark:text-[#83C5BE] hover:underline flex items-center gap-1"
                      >
                        <span>View all</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/find-doctor"
              className="px-3 py-1.5 rounded-full text-muted hover:text-foreground hover:bg-muted/40 transition-colors text-xs sm:text-sm"
            >
              Find Doctors
            </Link>

            <Link
              href="/#how-it-works"
              className="px-3 py-1.5 rounded-full text-muted hover:text-foreground hover:bg-muted/40 transition-colors text-xs sm:text-sm"
            >
              How It Works
            </Link>

            <Link
              href="/#for-doctors"
              className="px-3 py-1.5 rounded-full text-muted hover:text-foreground hover:bg-muted/40 transition-colors text-xs sm:text-sm flex items-center gap-1.5"
            >
              <span>For Doctors</span>
              <span className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.2 rounded-full">
                0% Fee
              </span>
            </Link>
          </div>

          {/* Right Action Elements */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Quick Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/60 px-3 py-1.5 text-xs text-muted hover:text-foreground hover:border-[#83C5BE]/60 transition-colors cursor-pointer"
              aria-label="Search doctors"
            >
              <Search className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
              <span className="hidden md:inline">Search</span>
              <kbd className="hidden sm:inline text-[9px] bg-muted/30 px-1 py-0.2 rounded font-mono">⌘K</kbd>
            </button>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-border/70 bg-surface/60 text-muted hover:text-foreground transition-colors cursor-pointer"
                aria-label="Toggle theme"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-4 w-4 text-[#83C5BE]" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            )}

            {/* High-Contrast Pill CTA: Consult for ₹199 */}
            <Link
              href="/find-doctor"
              className="group inline-flex items-center gap-1.5 rounded-full bg-[#006D77] hover:bg-[#00565e] px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-sm hover:shadow-[0_0_20px_rgba(131,197,190,0.5)] transition-all duration-200"
            >
              <span>Consult · ₹199</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-border bg-surface text-muted hover:text-foreground cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      </header>

      {/* ─── QUICK SEARCH MODAL (⌘K) ─── */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-xl rounded-3xl border border-border bg-white dark:bg-[#0B1F33] shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                <Search className="h-4 w-4 text-[#006D77] dark:text-[#83C5BE]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search doctors, conditions (e.g. Diabetes, Fever)..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="text-xs text-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-3 max-h-72 overflow-y-auto space-y-1">
                {filteredResults.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{item.title}</span>
                        <span className="text-[9px] bg-muted/60 text-muted px-1.5 py-0.2 rounded">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted mt-0.5">{item.subtitle}</p>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted" />
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MOBILE DRAWER MENU ─── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-3 top-16 z-40 lg:hidden rounded-3xl border border-border bg-white/95 dark:bg-[#0B1F33]/95 backdrop-blur-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold text-[#006D77] dark:text-[#83C5BE] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>24/7 Helpline: 1800-202-4455</span>
              </span>
              <span className="text-[10px] bg-red-500/15 text-red-500 font-bold px-2 py-0.5 rounded-full">
                SOS: 112
              </span>
            </div>

            <div className="space-y-1.5">
              <Link
                href="/find-doctor"
                onClick={() => setIsMobileOpen(false)}
                className="block py-2 text-sm font-bold text-foreground"
              >
                Find Doctors (380+ Verified)
              </Link>
              <Link
                href="/symptom-checker"
                onClick={() => setIsMobileOpen(false)}
                className="block py-2 text-sm font-semibold text-foreground"
              >
                AI Symptom Triage
              </Link>
              <Link
                href="/#how-it-works"
                onClick={() => setIsMobileOpen(false)}
                className="block py-2 text-sm text-muted"
              >
                How It Works
              </Link>
              <Link
                href="/#for-doctors"
                onClick={() => setIsMobileOpen(false)}
                className="block py-2 text-sm text-muted"
              >
                Join as Doctor (0% Fee)
              </Link>
            </div>

            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Link
                href="/find-doctor"
                onClick={() => setIsMobileOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-[#006D77] text-white text-xs font-bold shadow-sm"
              >
                Consult Doctor for ₹199
              </Link>
              <Link
                href="/login"
                onClick={() => setIsMobileOpen(false)}
                className="w-full text-center py-2 rounded-xl border border-border text-foreground text-xs font-medium"
              >
                Patient Portal Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
