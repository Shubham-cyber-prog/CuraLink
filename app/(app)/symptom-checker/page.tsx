"use client";

import { useChat } from "ai/react";
import { useEffect, useRef } from "react";
import { Send, User, Sparkles, AlertTriangle, Bot, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import ReactMarkdown from "react-markdown";

export default function SymptomCheckerPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/symptom-checker",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen flex-col bg-slate-50 text-slate-900">
      <DashboardHeader />
      
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-hidden px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <Sparkles className="h-5 w-5 text-teal-600" />
                AI Symptom Checker
              </h1>
              <p className="text-sm text-slate-500">Describe your symptoms for an initial assessment.</p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200/60 bg-white/60 shadow-lg backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-50/30 to-white/10 pointer-events-none" />
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-hide space-y-6">
            <AnimatePresence>
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex h-full flex-col items-center justify-center text-center p-8"
                >
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-teal-600 shadow-inner">
                    <Sparkles className="h-10 w-10" />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-slate-800">How can I help you today?</h2>
                  <p className="max-w-md text-slate-500 mb-8">
                    Describe how you're feeling in detail. Include when the symptoms started, severity, and any other relevant context.
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-2">
                    {["I have a headache that won't go away.", "My stomach hurts after eating.", "I've had a fever and cough for 3 days."].map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleInputChange({ target: { value: suggestion } } as any)}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm transition-all hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex max-w-[85%] gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm ${message.role === "user" ? "bg-teal-600 text-white" : "bg-white text-teal-600 ring-1 ring-slate-200"}`}>
                        {message.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                      </div>
                      
                      <div className={`rounded-2xl px-5 py-4 ${message.role === "user" ? "bg-teal-600 text-white shadow-md rounded-tr-sm" : "bg-white text-slate-700 shadow-md ring-1 ring-slate-100 rounded-tl-sm prose prose-sm prose-slate max-w-none"}`}>
                        {message.role === "user" ? (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              
              {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-teal-600 shadow-sm ring-1 ring-slate-200">
                      <Bot className="h-5 w-5 animate-pulse" />
                    </div>
                    <div className="flex h-12 w-20 items-center justify-center gap-1 rounded-2xl bg-white shadow-md ring-1 ring-slate-100 rounded-tl-sm">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-teal-400 [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-teal-400 [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-teal-400"></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Warning Banner */}
          <div className="bg-amber-50/80 px-4 py-2 text-xs font-medium text-amber-800 flex items-center justify-center gap-2 backdrop-blur-md border-t border-amber-100">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p>For medical emergencies, call 911 immediately. This AI is not a substitute for professional medical advice.</p>
          </div>

          {/* Input Form */}
          <div className="bg-white/80 p-4 backdrop-blur-xl border-t border-slate-200/60 rounded-b-3xl">
            <form
              onSubmit={handleSubmit}
              className="relative mx-auto flex w-full max-w-4xl items-center gap-2"
            >
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Describe your symptoms (e.g., 'I have had a mild fever since yesterday...')"
                className="flex-1 rounded-full border border-slate-300 bg-white/50 px-6 py-4 pr-16 text-sm text-slate-900 shadow-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 backdrop-blur-sm"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-2 bottom-2 aspect-square h-auto rounded-full bg-teal-600 hover:bg-teal-700 shadow-md transition-transform active:scale-95 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
