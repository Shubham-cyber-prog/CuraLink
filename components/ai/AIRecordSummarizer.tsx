"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Brain,
  FileText,
  Send,
  Loader2,
  AlertTriangle,
  RotateCcw,
  ClipboardPaste,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ReactMarkdown from "react-markdown";

const EXAMPLE_REPORT = `Test: Complete Blood Count (CBC)
Hemoglobin: 11.2 g/dL (Normal: 13.5-17.5)
WBC Count: 12,500 /µL (Normal: 4,500-11,000)
Platelet Count: 245,000 /µL (Normal: 150,000-400,000)
RBC Count: 4.1 million/µL (Normal: 4.7-6.1)
Hematocrit: 34% (Normal: 40-54%)
MCV: 78 fL (Normal: 80-100)
ESR: 28 mm/hr (Normal: 0-15)
Fasting Blood Sugar: 118 mg/dL (Normal: 70-100)`;

export function AIRecordSummarizer() {
  const shouldReduceMotion = useReducedMotion();
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSummarized, setHasSummarized] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!content.trim() || isLoading) return;

      setIsLoading(true);
      setHasSummarized(true);
      setSummary("");

      try {
        const res = await fetch("/api/ai/summarize-record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: content.trim() }),
        });

        if (!res.ok) {
          throw new Error("Failed to summarize report");
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
            setSummary(fullText);
          }
        }

        if (!fullText) {
          setSummary(
            "I couldn't generate a summary. Please check that you've pasted a valid medical report."
          );
        }
      } catch (err) {
        setSummary(
          "⚠️ AI summarizer is temporarily unavailable. Please try again in a moment."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [content, isLoading]
  );

  const handleReset = () => {
    setContent("");
    setSummary("");
    setHasSummarized(false);
    textareaRef.current?.focus();
  };

  const handlePasteExample = () => {
    setContent(EXAMPLE_REPORT);
    textareaRef.current?.focus();
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setContent(text);
        textareaRef.current?.focus();
      }
    } catch (err) {
      // Clipboard API might not be available
    }
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] shadow-xs overflow-hidden transition-colors duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#263049] bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/20 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-sm">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] flex items-center gap-1.5">
              AI Report Analyzer
              <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-300">
                NEW
              </span>
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Paste any medical report → Get a plain-English explanation
            </p>
          </div>
        </div>

        {hasSummarized && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#64748B] dark:text-[#94A3B8] hover:bg-white/60 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            New
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {!hasSummarized ? (
          <>
            {/* Textarea Input */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your lab report, blood test results, or any medical document here…"
                  rows={6}
                  maxLength={8000}
                  className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#263049] bg-[#F8FAFC] dark:bg-[#0B1120] px-4 py-3 text-sm text-[#0F172A] dark:text-[#F1F5F9] placeholder:text-[#94A3B8] dark:placeholder:text-[#64748B] focus:border-[#0F9D8C] dark:focus:border-[#14B8A6] focus:outline-none resize-none transition-colors font-mono"
                />
                <div className="absolute bottom-2.5 right-3 text-[10px] text-[#94A3B8] dark:text-[#64748B]">
                  {content.length}/8000
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="submit"
                  disabled={isLoading || !content.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-purple-600 hover:to-indigo-700 disabled:opacity-40 transition-all active:scale-[0.97] cursor-pointer shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Analyze Report
                </button>

                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#1C2338] px-3 py-2.5 text-xs font-medium text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-50 dark:hover:bg-[#263049] transition-colors cursor-pointer"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  Paste from clipboard
                </button>

                <button
                  type="button"
                  onClick={handlePasteExample}
                  className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#1C2338] px-3 py-2.5 text-xs font-medium text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-50 dark:hover:bg-[#263049] transition-colors cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Try example report
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Summary Result */
          <AnimatePresence>
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Original Report (collapsed) */}
              <details className="group rounded-xl border border-[#E2E8F0] dark:border-[#263049] bg-[#F8FAFC] dark:bg-[#0B1120] overflow-hidden">
                <summary className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[#64748B] dark:text-[#94A3B8] cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1C2338] transition-colors">
                  <FileText className="h-3.5 w-3.5" />
                  View original report
                </summary>
                <div className="px-4 pb-3 pt-1 text-xs text-[#64748B] dark:text-[#94A3B8] font-mono whitespace-pre-wrap border-t border-[#E2E8F0] dark:border-[#263049] max-h-40 overflow-y-auto">
                  {content}
                </div>
              </details>

              {/* AI Summary */}
              <div className="rounded-xl border border-purple-200/60 dark:border-purple-800/40 bg-purple-50/40 dark:bg-purple-950/20 p-4">
                {isLoading && !summary ? (
                  <div className="flex items-center gap-2 text-sm text-[#64748B] dark:text-[#94A3B8]">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                    <span>Analyzing your medical report...</span>
                  </div>
                ) : (
                  <div className="prose-sm prose-slate dark:prose-invert max-w-none [&>p]:text-[13px] [&>p]:leading-relaxed [&>ul]:text-[13px] [&>ul>li]:leading-relaxed [&>h2]:text-sm [&>h2]:font-bold [&>h2]:mt-3 [&>h2]:mb-1.5">
                    <ReactMarkdown>{summary}</ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-1.5 text-[10px] text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
          <span>
            AI-generated summary for educational purposes only. Always discuss results with your healthcare provider.
          </span>
        </div>
      </div>
    </motion.div>
  );
}
