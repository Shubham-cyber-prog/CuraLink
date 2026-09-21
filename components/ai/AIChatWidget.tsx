"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Sparkles,
  Minimize2,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function AIChatWidget() {
  const shouldReduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello, I am your **CuraLink AI Assistant**. I can assist you with:\n\n• Clinical triage & guidance\n• Locating verified doctors\n• Health record preparation\n\nHow can I assist your care today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: `usr_${Date.now()}`,
        role: "user",
        content: input.trim(),
      };

      const currentInput = input.trim();
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);
      setHasError(false);

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMsg]
              .filter((m) => m.id !== "welcome")
              .map((m) => ({
                role: m.role,
                content: m.content,
              })),
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to contact AI assistant");
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        const assistantMsgId = `ai_${Date.now()}`;
        setMessages((prev) => [
          ...prev,
          { id: assistantMsgId, role: "assistant", content: "" },
        ]);

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId ? { ...m, content: fullText } : m
              )
            );
          }
        }

        if (!fullText) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content:
                      "I'm here to help! Could you rephrase your question?",
                  }
                : m
            )
          );
        }
      } catch (err) {
        setHasError(true);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_err_${Date.now()}`,
            role: "assistant",
            content: `I apologize, but I couldn't process your question about "${currentInput}". This might be because the AI service is temporarily unavailable. Please try again in a moment, or use the **AI Symptom Checker** for detailed health analysis.`,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages]
  );

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setIsOpen(true)}
            id="ai-chat-widget-fab"
            className="fixed bottom-24 right-5 z-50 md:bottom-8 md:right-8 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#0F9D8C] to-[#0C8577] dark:from-[#14B8A6] dark:to-[#0D9488] text-white shadow-lg shadow-teal-500/25 dark:shadow-teal-400/20 hover:shadow-xl hover:shadow-teal-500/30 transition-shadow cursor-pointer active:scale-95"
            aria-label="Open AI Health Assistant"
          >
            <Sparkles className="h-6 w-6" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full animate-ping bg-[#0F9D8C]/20 dark:bg-[#14B8A6]/20" style={{ animationDuration: "3s" }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-24 right-4 z-50 md:bottom-8 md:right-8 flex flex-col w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#263049] bg-gradient-to-r from-[#0F9D8C] to-[#0C8577] dark:from-[#14B8A6] dark:to-[#0D9488] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                  <Bot className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    CuraLink AI
                  </h3>
                  <p className="text-[11px] text-white/70 font-medium">
                    Health Assistant • Always available
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                aria-label="Close chat"
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC] dark:bg-[#0B1120]">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.role === "assistant" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/60 text-[#0F9D8C] dark:text-[#14B8A6]">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[260px] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      m.role === "user"
                        ? "bg-[#0F9D8C] dark:bg-[#14B8A6] text-white rounded-br-sm"
                        : "bg-white dark:bg-[#1C2338] text-[#0F172A] dark:text-[#F1F5F9] border border-[#E2E8F0] dark:border-[#263049] rounded-bl-sm shadow-xs"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose-sm prose-slate dark:prose-invert max-w-none [&>p]:mb-1.5 [&>p:last-child]:mb-0 [&>ul]:mb-1.5 [&>ul]:pl-4 [&>ul>li]:text-[13px]">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-line">{m.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/60 text-[#0F9D8C] dark:text-[#14B8A6]">
                    <Bot className="h-3.5 w-3.5 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#1C2338] px-3.5 py-2.5 shadow-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0F9D8C] dark:bg-[#14B8A6] animate-pulse" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0F9D8C] dark:bg-[#14B8A6] animate-pulse [animation-delay:200ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0F9D8C] dark:bg-[#14B8A6] animate-pulse [animation-delay:400ms]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Disclaimer */}
            <div className="flex items-center gap-1.5 border-t border-[#E2E8F0] dark:border-[#263049] bg-amber-50/70 dark:bg-amber-950/30 px-3 py-1.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-3 w-3 shrink-0 text-amber-500 dark:text-amber-400" />
              <span>AI guidance only — not medical advice. For emergencies call 112.</span>
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t border-[#E2E8F0] dark:border-[#263049] p-3 bg-white dark:bg-[#151B2E]"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about health..."
                className="flex-1 rounded-xl border border-[#E2E8F0] dark:border-[#263049] bg-[#F8FAFC] dark:bg-[#0B1120] px-3.5 py-2 text-sm text-[#0F172A] dark:text-[#F1F5F9] placeholder:text-[#94A3B8] dark:placeholder:text-[#64748B] focus:border-[#0F9D8C] dark:focus:border-[#14B8A6] focus:outline-none transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0F9D8C] dark:bg-[#14B8A6] text-white hover:bg-[#0C8577] dark:hover:bg-teal-500 disabled:opacity-40 transition-all active:scale-95 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
