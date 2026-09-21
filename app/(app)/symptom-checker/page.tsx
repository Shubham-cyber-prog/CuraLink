"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  AlertTriangle,
  Bot,
  ArrowLeft,
  ShieldCheck,
  Siren,
  Phone,
  CalendarPlus,
  HeartPulse,
  Activity,
  Leaf,
  Info,
} from "lucide-react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

/** Structured analysis response from the API */
interface SymptomAnalysis {
  urgencyLevel: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
  triageCategory: "GREEN" | "YELLOW" | "RED";
  summary: string;
  possibleCauses: string[];
  recommendedAction: string;
  suggestBooking: boolean;
  disclaimer: string;
  isEmergency: boolean;
  responseTimeMs?: number;
  error?: string;
  mlPrediction?: {
    urgencyLevel: string;
    confidence: number;
    confidencePercentage?: number;
    modelType?: string;
  } | null;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  analysis?: SymptomAnalysis;
}

/** Urgency config for visual treatment */
const URGENCY_CONFIG = {
  EMERGENCY: {
    icon: Siren,
    label: "EMERGENCY",
    bgClass:
      "bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-800",
    textClass: "text-red-900 dark:text-red-100",
    badgeClass: "bg-red-600 text-white animate-pulse",
    iconColor: "text-red-600 dark:text-red-400",
    avatarBg: "bg-red-100 dark:bg-red-900/60",
  },
  HIGH: {
    icon: HeartPulse,
    label: "HIGH URGENCY",
    bgClass:
      "bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800",
    textClass: "text-orange-900 dark:text-orange-100",
    badgeClass: "bg-orange-600 text-white",
    iconColor: "text-orange-600 dark:text-orange-400",
    avatarBg: "bg-orange-100 dark:bg-orange-900/60",
  },
  MEDIUM: {
    icon: Activity,
    label: "MODERATE",
    bgClass:
      "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800",
    textClass: "text-amber-900 dark:text-amber-100",
    badgeClass: "bg-amber-600 text-white",
    iconColor: "text-amber-600 dark:text-amber-400",
    avatarBg: "bg-amber-100 dark:bg-amber-900/60",
  },
  LOW: {
    icon: Leaf,
    label: "LOW",
    bgClass:
      "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800",
    textClass: "text-teal-900 dark:text-teal-100",
    badgeClass: "bg-teal-600 text-white",
    iconColor: "text-teal-600 dark:text-teal-400",
    avatarBg: "bg-teal-100 dark:bg-teal-900/60",
  },
} as const;

/** Renders a structured analysis card */
function AnalysisCard({ analysis }: { analysis: SymptomAnalysis }) {
  const config =
    URGENCY_CONFIG[analysis.urgencyLevel] || URGENCY_CONFIG.LOW;
  const UrgencyIcon = config.icon;

  return (
    <div
      className={`rounded-2xl border-2 ${config.bgClass} overflow-hidden shadow-sm`}
    >
      {/* Urgency Header */}
      <div className="flex items-center gap-2 px-4 py-2.5">
        <UrgencyIcon className={`h-5 w-5 ${config.iconColor} shrink-0`} />
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.badgeClass}`}
        >
          {config.label}
        </span>
        {analysis.mlPrediction && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900/10 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700/60"
            title={`Clinical ML Text Classifier: ${analysis.mlPrediction.modelType || 'TF-IDF Logistic Regression'}`}
          >
            ML Classifier: {analysis.mlPrediction.urgencyLevel} (
            {analysis.mlPrediction.confidencePercentage
              ? `${analysis.mlPrediction.confidencePercentage}%`
              : `${Math.round(analysis.mlPrediction.confidence * 100)}%`}
            )
          </span>
        )}
        {analysis.responseTimeMs != null && (
          <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            {analysis.responseTimeMs}ms
          </span>
        )}
      </div>

      {/* Body */}
      <div className={`px-4 pb-4 space-y-3 ${config.textClass}`}>
        {/* Summary */}
        <p className="text-sm font-medium leading-relaxed">
          {analysis.summary}
        </p>

        {/* Possible Causes */}
        {analysis.possibleCauses.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">
              Possible Causes
            </p>
            <ul className="list-disc list-inside text-sm space-y-0.5 opacity-90">
              {analysis.possibleCauses.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Action */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">
            Recommended Action
          </p>
          <p className="text-sm leading-relaxed">{analysis.recommendedAction}</p>
        </div>

        {/* Emergency: Call Now CTA */}
        {analysis.isEmergency && (
          <a
            href="tel:112"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg transition-all active:scale-[0.97] animate-pulse"
          >
            <Phone className="h-5 w-5" />
            Call Emergency Services (112)
          </a>
        )}

        {/* Book a Doctor CTA */}
        {analysis.suggestBooking && !analysis.isEmergency && (
          <Link
            href="/find-doctor"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#0F9D8C] hover:bg-[#0C8577] dark:bg-[#14B8A6] dark:hover:bg-teal-500 text-white font-semibold text-sm shadow-sm transition-all active:scale-[0.97]"
          >
            <CalendarPlus className="h-4 w-4" />
            Book a Doctor on CuraLink
          </Link>
        )}

        {/* Disclaimer — present on EVERY response */}
        <div className="flex items-start gap-1.5 pt-2 border-t border-black/5 dark:border-white/5">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-50" />
          <p className="text-[11px] leading-snug opacity-60 italic">
            {analysis.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SymptomCheckerPage() {
  const shouldReduceMotion = useReducedMotion();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to CuraLink's Clinical Symptom Checker. Please describe what symptoms you are experiencing, when they started, and their severity.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/symptom-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        let errorDetail = `Server responded with status ${res.status}`;
        try {
          const errBody = await res.json();
          if (errBody?.error) errorDetail = errBody.error;
        } catch {
          try {
            const errText = await res.text();
            if (errText) errorDetail = errText;
          } catch {
            // Ignore parse failures
          }
        }
        console.error(
          "[Symptom Checker UI] API error:",
          res.status,
          errorDetail
        );
        throw new Error(errorDetail);
      }

      const data: SymptomAnalysis = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          role: "assistant",
          content: data.summary || "Assessment complete.",
          analysis: data,
        },
      ]);
    } catch (err: any) {
      console.error("[Symptom Checker UI] Error:", err);
      const errorMessage = err?.message || "An unexpected error occurred";
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content: `⚠️ **Unable to process your symptoms right now.**\n\n**Error:** ${errorMessage}\n\n**What you can do:**\n- Try sending your message again in a few seconds.\n- If the problem persists, please book a consultation with a CuraLink doctor directly.\n\n*If you are experiencing a medical emergency, please call 112 (India) or 911 immediately.*`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#263049] pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1C2338] transition-colors active:scale-[0.97]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9] flex items-center gap-2">
              <Bot className="h-6 w-6 text-[#0F9D8C] dark:text-[#14B8A6]" />
              AI Symptom Checker
            </h1>
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
              Evaluate your health symptoms & receive preliminary medical
              guidance.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/80 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-950/40 px-3 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300 self-start sm:self-auto">
          <ShieldCheck className="h-3.5 w-3.5 text-[#0F9D8C] dark:text-[#14B8A6]" />
          <span>Private & Secure Session</span>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex flex-col h-[580px] rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] shadow-xs dark:shadow-black/20 overflow-hidden transition-colors duration-200">
        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-200">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={`flex gap-3 ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" && (
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold ${
                    m.analysis?.isEmergency
                      ? "bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400"
                      : m.analysis?.urgencyLevel === "HIGH"
                        ? "bg-orange-100 dark:bg-orange-900/60 text-orange-600 dark:text-orange-400"
                        : "bg-teal-100 dark:bg-teal-900/60 text-[#0F9D8C] dark:text-[#14B8A6]"
                  }`}
                >
                  {m.analysis?.isEmergency ? (
                    <Siren className="h-5 w-5" />
                  ) : (
                    <Bot className="h-5 w-5" />
                  )}
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#0F9D8C] dark:bg-[#14B8A6] text-white rounded-br-none shadow-xs px-4 py-3"
                    : m.analysis
                      ? "w-full max-w-xl"
                      : "bg-white dark:bg-[#151B2E] text-[#0F172A] dark:text-[#F1F5F9] border border-[#E2E8F0] dark:border-[#263049] shadow-xs rounded-bl-none px-4 py-3"
                }`}
              >
                {m.analysis ? (
                  <AnalysisCard analysis={m.analysis} />
                ) : (
                  <p className="whitespace-pre-line">{m.content}</p>
                )}
              </div>

              {m.role === "user" && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-semibold text-xs">
                  S
                </div>
              )}
            </motion.div>
          ))}

          {/* Typing Indicator with 3 Animated Staggered Dots */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-3 justify-start items-center"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/60 text-[#0F9D8C] dark:text-[#14B8A6]">
                <Bot className="h-5 w-5 animate-pulse" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] px-4 py-3 text-xs text-[#64748B] dark:text-[#94A3B8] shadow-xs">
                <span>CuraLink AI is thinking</span>
                <span className="flex items-center gap-1 ml-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0F9D8C] dark:bg-[#14B8A6] animate-pulse" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0F9D8C] dark:bg-[#14B8A6] animate-pulse [animation-delay:200ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0F9D8C] dark:bg-[#14B8A6] animate-pulse [animation-delay:400ms]" />
                </span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Disclaimer Banner */}
        <div className="flex items-center gap-2 border-t border-[#E2E8F0] dark:border-[#263049] bg-amber-50/70 dark:bg-amber-950/30 px-4 py-2 text-xs font-medium text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            This AI tool provides informational guidance only. For medical
            emergencies, call 911/112 or visit an emergency room immediately.
          </span>
        </div>

        {/* Form Footer */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-[#E2E8F0] dark:border-[#263049] p-3 bg-white dark:bg-[#151B2E] transition-colors duration-200"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your symptoms (e.g. 'Mild fever and dry cough since yesterday')..."
            className="flex-1 rounded-xl border border-[#E2E8F0] dark:border-[#263049] bg-[#F8FAFC] dark:bg-[#0B1120] px-4 py-2.5 text-sm text-[#0F172A] dark:text-[#F1F5F9] placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] focus:border-[#0F9D8C] dark:focus:border-[#14B8A6] focus:bg-white dark:focus:bg-[#0B1120] focus:outline-none transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-10 min-w-[40px] items-center justify-center rounded-xl bg-[#0F9D8C] dark:bg-[#14B8A6] px-4 text-white hover:bg-[#0C8577] dark:hover:bg-teal-500 disabled:opacity-50 transition-all active:scale-[0.97] cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
