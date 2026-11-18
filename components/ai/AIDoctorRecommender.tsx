"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Send,
  Loader2,
  ArrowRight,
  AlertTriangle,
  Stethoscope,
  CheckCircle2,
  X,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ReactMarkdown from "react-markdown";

const EXAMPLE_QUERIES = [
  "Chest tightness & high BP",
  "Skin rash or acne flare-up",
  "Child has mild fever & cough",
  "Frequent migraines & dizziness",
];

const SPECIALTY_KEYWORDS: Array<{ specialty: string; keywords: string[]; reason: string; urgency: string }> = [
  {
    specialty: "Cardiology",
    keywords: ["heart", "chest", "bp", "blood pressure", "palpitation", "cholesterol", "breathless", "ecg"],
    reason: "Cardiologists evaluate heart rhythm, blood pressure, and cardiovascular symptoms.",
    urgency: "If you have severe chest pain or shortness of breath, seek emergency care immediately (112).",
  },
  {
    specialty: "Dermatology",
    keywords: ["skin", "rash", "acne", "itch", "hair", "eczema", "allergy", "pimple", "fungal"],
    reason: "Dermatologists diagnose and treat skin rashes, acne, allergies, and scalp concerns.",
    urgency: "Routine — book a Video or Clinic visit at your convenience.",
  },
  {
    specialty: "Pediatrics",
    keywords: ["child", "baby", "kid", "infant", "toddler", "son", "daughter", "pediatric"],
    reason: "Pediatricians specialize in infant, child, and adolescent fevers, infections, and growth care.",
    urgency: "See a doctor within 24 hours if fever persists above 101°F.",
  },
  {
    specialty: "Neurology",
    keywords: ["migraine", "headache", "dizzy", "dizziness", "nerve", "numbness", "seizure", "vertigo", "memory"],
    reason: "Neurologists treat recurring migraines, nerve pain, vertigo, and neurological symptoms.",
    urgency: "Schedule promptly; seek urgent care for sudden weakness or vision changes.",
  },
  {
    specialty: "Psychiatry",
    keywords: ["anxiety", "stress", "depress", "sleep", "insomnia", "panic", "mental", "mood", "overwhelmed"],
    reason: "Psychiatrists provide confidential evaluation and care for anxiety, sleep, and mood concerns.",
    urgency: "Routine — confidential video consultations are available.",
  },
  {
    specialty: "General Practice",
    keywords: ["fever", "cold", "cough", "back", "pain", "stomach", "fatigue", "weakness", "throat", "body ache"],
    reason: "General Physicians are the ideal first step for fevers, body aches, infections, and checkups.",
    urgency: "Same-day video consultation recommended.",
  },
];

function detectSpecialtyFromText(text: string): { specialty: string; reason: string; urgency: string } {
  const lower = text.toLowerCase();
  for (const item of SPECIALTY_KEYWORDS) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return { specialty: item.specialty, reason: item.reason, urgency: item.urgency };
    }
  }
  return {
    specialty: "General Practice",
    reason: "A General Physician can thoroughly assess your symptoms and coordinate any specialist follow-up.",
    urgency: "Schedule a consultation at your convenience.",
  };
}

interface AIDoctorRecommenderProps {
  onSelectSpecialty?: (specialty: string) => void;
  onClose?: () => void;
}

export function AIDoctorRecommender({ onSelectSpecialty, onClose }: AIDoctorRecommenderProps) {
  const shouldReduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string>("");
  const [matchedSpecialty, setMatchedSpecialty] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    async (searchQuery?: string) => {
      const q = (searchQuery ?? query).trim();
      if (!q || isLoading) return;

      setIsLoading(true);
      setHasSearched(true);
      setResult("");

      const fallbackMatch = detectSpecialtyFromText(q);
      setMatchedSpecialty(fallbackMatch.specialty);

      try {
        const res = await fetch("/api/ai/recommend-doctor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
        });

        if (!res.ok) {
          throw new Error("AI endpoint unavailable");
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            setResult(fullText);
          }
        }

        if (!fullText.trim()) {
          setResult(
            `**Recommended Specialty: ${fallbackMatch.specialty}**\n\n- ${fallbackMatch.reason}\n- **Guidance:** ${fallbackMatch.urgency}`
          );
        } else {
          // Refine matched specialty chip based on AI text
          const detectedFromAi = SPECIALTY_KEYWORDS.find((s) =>
            fullText.toLowerCase().includes(s.specialty.toLowerCase())
          );
          if (detectedFromAi) {
            setMatchedSpecialty(detectedFromAi.specialty);
          }
        }
      } catch {
        // Instant deterministic clinical fallback so users ALWAYS get actionable help
        setResult(
          `**Recommended Specialty: ${fallbackMatch.specialty}**\n\n- ${fallbackMatch.reason}\n- **Guidance:** ${fallbackMatch.urgency}`
        );
      } finally {
        setIsLoading(false);
      }
    },
    [query, isLoading]
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    handleSubmit(example);
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="rounded-[24px] border border-[#006D77]/20 dark:border-[#83C5BE]/20 bg-white dark:bg-[#0B1F33] shadow-[0_8px_30px_-8px_rgba(11,31,51,0.08)] overflow-hidden"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-white/[0.08] bg-[#F4F7F8]/80 dark:bg-white/[0.03] px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#006D77]/10 dark:bg-[#83C5BE]/15 text-[#006D77] dark:text-[#83C5BE]">
            <Stethoscope className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0B1F33] dark:text-white">
              Smart Specialty Assistant
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tell us your symptoms in simple words — we&apos;ll suggest the right doctor specialty.
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200/70 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close assistant"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. I have chest tightness and high BP for 3 days..."
            className="flex-1 rounded-full border border-slate-200 dark:border-white/12 bg-[#F4F7F8] dark:bg-[#071525] px-4 py-2.5 text-sm text-[#0B1F33] dark:text-white placeholder:text-slate-400 focus:border-[#006D77] dark:focus:border-[#83C5BE] focus:bg-white dark:focus:bg-[#071525] focus:outline-none focus:ring-2 focus:ring-[#006D77]/15"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#006D77] hover:bg-[#005860] px-5 text-xs font-semibold text-white disabled:opacity-45 transition-all cursor-pointer whitespace-nowrap"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Match Specialty</span>
              </>
            )}
          </button>
        </form>

        {/* Quick-Tap Examples */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium text-slate-400">Try:</span>
          {EXAMPLE_QUERIES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => handleExampleClick(ex)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/[0.04] px-3 py-1 text-xs text-slate-600 dark:text-slate-300 hover:border-[#006D77]/50 hover:text-[#006D77] dark:hover:text-[#83C5BE] transition-colors cursor-pointer"
            >
              <ArrowRight className="h-3 w-3 opacity-60" />
              {ex}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {hasSearched && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="rounded-2xl border border-[#006D77]/20 dark:border-[#83C5BE]/20 bg-[#006D77]/[0.04] dark:bg-[#83C5BE]/[0.06] p-4 space-y-3"
            >
              {isLoading && !result ? (
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <Loader2 className="h-4 w-4 animate-spin text-[#006D77] dark:text-[#83C5BE]" />
                  <span>Finding the right specialist for your symptoms...</span>
                </div>
              ) : (
                <>
                  <div className="prose-sm prose-slate dark:prose-invert max-w-none [&>p]:text-[13px] [&>p]:leading-relaxed [&>ul]:text-[13px] [&>ul>li]:leading-relaxed">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                  {matchedSpecialty && onSelectSpecialty && (
                    <div className="pt-2 border-t border-[#006D77]/15 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006D77] dark:text-[#83C5BE]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Best match: {matchedSpecialty}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectSpecialty(matchedSpecialty)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#006D77] hover:bg-[#005860] text-white px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <span>Filter {matchedSpecialty} Doctors</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-1.5 text-[11px] text-amber-700/90 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>Guidance only — not a medical diagnosis. For emergencies, call 112.</span>
        </div>
      </div>
    </motion.div>
  );
}
