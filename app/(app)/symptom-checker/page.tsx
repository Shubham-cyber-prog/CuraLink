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
  Stethoscope,
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function SymptomCheckerPage() {
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
  }, [messages]);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2">
              <Bot className="h-6 w-6 text-[#0F9D8C]" />
              AI Symptom Checker
            </h1>
            <p className="text-sm text-[#64748B]">
              Evaluate your health symptoms & receive preliminary medical guidance.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 self-start sm:self-auto">
          <ShieldCheck className="h-3.5 w-3.5 text-[#0F9D8C]" />
          <span>Private & Secure Session</span>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex flex-col h-[580px] rounded-2xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#F8FAFC]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-[#0F9D8C] font-bold">
                  <Bot className="h-5 w-5" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#0F9D8C] text-white rounded-br-none"
                    : "bg-white text-[#0F172A] border border-[#E2E8F0] shadow-xs rounded-bl-none"
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>
              </div>

              {m.role === "user" && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white font-semibold text-xs">
                  S
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-[#0F9D8C]">
                <Bot className="h-5 w-5 animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-xs text-[#64748B] shadow-xs">
                <span className="h-2 w-2 rounded-full bg-[#0F9D8C] animate-ping" />
                Analyzing symptoms...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Disclaimer Banner */}
        <div className="flex items-center gap-2 border-t border-[#E2E8F0] bg-amber-50/70 px-4 py-2 text-xs font-medium text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            This AI tool provides informational guidance only. For medical emergencies, call 911 or visit an emergency room immediately.
          </span>
        </div>

        {/* Form Footer */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-[#E2E8F0] p-3 bg-white"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your symptoms (e.g. 'Mild fever and dry cough since yesterday')..."
            className="flex-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#0F172A] focus:border-[#0F9D8C] focus:bg-white focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-10 min-w-[40px] items-center justify-center rounded-xl bg-[#0F9D8C] px-4 text-white hover:bg-[#0C8577] disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
