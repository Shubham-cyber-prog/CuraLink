"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ReactMarkdown from "react-markdown";

const EXAMPLE_QUERIES = [
  "I have lower back pain for 2 weeks",
  "My child has a rash and mild fever",
  "Need a Hindi-speaking dermatologist",
  "Persistent migraines with nausea",
];

export function AIDoctorRecommender() {
  const shouldReduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    async (searchQuery?: string) => {
      const q = searchQuery || query;
      if (!q.trim() || isLoading) return;

      setIsLoading(true);
      setHasSearched(true);
      setResult("");

      try {
        const res = await fetch("/api/ai/recommend-doctor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q.trim() }),
        });

        if (!res.ok) {
          throw new Error("Failed to get recommendation");
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

        if (!fullText) {
          setResult(
            "I couldn't generate a recommendation. Please try describing your concern in more detail."
          );
        }
      } catch (err) {
        setResult(
          "⚠️ AI recommender is temporarily unavailable. Please browse the doctor listings below or try again in a moment."
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
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] shadow-xs overflow-hidden transition-colors duration-200"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E2E8F0] dark:border-[#263049] bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/30 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F9D8C] to-[#0C8577] dark:from-[#14B8A6] dark:to-[#0D9488] text-white shadow-sm">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] flex items-center gap-1.5">
            AI Doctor Finder
            <span className="inline-flex items-center rounded-full bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 text-[10px] font-semibold text-[#0F9D8C] dark:text-[#14B8A6]">
              NEW
            </span>
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Describe your concern → Get matched to the right specialty
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Search Form */}
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Bot className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0F9D8C] dark:text-[#14B8A6]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe your health concern…"
              className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#263049] bg-[#F8FAFC] dark:bg-[#0B1120] pl-10 pr-4 py-2.5 text-sm text-[#0F172A] dark:text-[#F1F5F9] placeholder:text-[#94A3B8] dark:placeholder:text-[#64748B] focus:border-[#0F9D8C] dark:focus:border-[#14B8A6] focus:bg-white dark:focus:bg-[#0B1120] focus:outline-none transition-colors"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-[#0F9D8C] dark:bg-[#14B8A6] px-4 text-sm font-semibold text-white hover:bg-[#0C8577] dark:hover:bg-teal-500 disabled:opacity-40 transition-all active:scale-[0.97] cursor-pointer whitespace-nowrap"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Find
              </>
            )}
          </button>
        </form>

        {/* Example Queries */}
        {!hasSearched && (
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((ex) => (
              <button
                key={ex}
                onClick={() => handleExampleClick(ex)}
                className="inline-flex items-center gap-1 rounded-full border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#1C2338] px-3 py-1.5 text-xs text-[#64748B] dark:text-[#94A3B8] hover:border-[#0F9D8C]/40 dark:hover:border-[#14B8A6]/40 hover:text-[#0F9D8C] dark:hover:text-[#14B8A6] transition-colors cursor-pointer"
              >
                <ArrowRight className="h-3 w-3" />
                {ex}
              </button>
            ))}
          </div>
        )}

        {/* Result */}
        <AnimatePresence>
          {hasSearched && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border border-teal-200/60 dark:border-teal-800/40 bg-teal-50/50 dark:bg-teal-950/20 p-4"
            >
              {isLoading && !result ? (
                <div className="flex items-center gap-2 text-sm text-[#64748B] dark:text-[#94A3B8]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#0F9D8C] dark:text-[#14B8A6]" />
                  <span>Analyzing your concern...</span>
                </div>
              ) : (
                <div className="prose-sm prose-slate dark:prose-invert max-w-none [&>p]:text-[13px] [&>p]:leading-relaxed [&>ul]:text-[13px] [&>ul>li]:leading-relaxed">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disclaimer */}
        <div className="flex items-start gap-1.5 text-[10px] text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
          <span>AI-powered guidance only. Not a substitute for professional medical advice.</span>
        </div>
      </div>
    </motion.div>
  );
}
