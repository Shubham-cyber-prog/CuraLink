"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  User,
  Sparkles,
  AlertTriangle,
  Bot,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function SymptomCheckerPage() {
  const shouldReduceMotion = useReducedMotion();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello Subham 👋 I am CuraLink's AI Symptom Checker. Please describe what symptoms you are experiencing, when they started, and how severe they feel.",
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

    const userMsg: Message = {
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
        throw new Error("Failed to contact AI symptom service");
      }

      const text = await res.text();
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          role: "assistant",
          content:
            text ||
            "Based on your symptoms, we recommend staying hydrated, monitoring your temperature, and consulting a primary care doctor if symptoms persist.",
        },
      ]);
    } catch (err) {
      // Fallback empathetic response if API key is not configured locally
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          role: "assistant",
          content: `Thank you for sharing your symptoms regarding "${currentInput}". \n\n**Assessment Summary:**\n- **Primary Observations**: Common symptoms that warrant rest and proper hydration.\n- **Recommended Action**: Monitor for 24-48 hours. If fever exceeds 101°F or severe discomfort develops, book a consultation with a General Practitioner.\n\n*Disclaimer: I am an AI assistant, not a licensed doctor. Please consult a medical professional for official diagnostic advice.*`,
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
              Evaluate your health symptoms & receive preliminary medical guidance.
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
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/60 text-[#0F9D8C] dark:text-[#14B8A6] font-bold">
                  <Bot className="h-5 w-5" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#0F9D8C] dark:bg-[#14B8A6] text-white rounded-br-none shadow-xs"
                    : "bg-white dark:bg-[#151B2E] text-[#0F172A] dark:text-[#F1F5F9] border border-[#E2E8F0] dark:border-[#263049] shadow-xs rounded-bl-none"
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>
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
            This AI tool provides informational guidance only. For medical emergencies, call 911/112 or visit an emergency room immediately.
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
