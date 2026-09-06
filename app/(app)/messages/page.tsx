"use client";

import React, { useState } from "react";
import { Send, Stethoscope, CheckCheck, Phone, Video } from "lucide-react";

interface Message {
  id: string;
  sender: "doctor" | "patient";
  text: string;
  time: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      sender: "doctor",
      text: "Hello Subham! I reviewed your recent blood report. Everything looks stable, but please continue the Vitamin D supplements.",
      time: "10:15 AM",
    },
    {
      id: "m2",
      sender: "patient",
      text: "Thank you Dr. Ananya! Should I repeat the lab test next month?",
      time: "10:18 AM",
    },
    {
      id: "m3",
      sender: "doctor",
      text: "Yes, after 6 weeks we will do a quick follow-up check. Let me know if you experience any mild fatigue in the meantime.",
      time: "10:20 AM",
    },
  ]);

  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `m_${Date.now()}`,
        sender: "patient",
        text: input.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setInput("");
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-[#E2E8F0] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          Doctor Messages
        </h1>
        <p className="text-sm text-[#64748B]">
          Direct secure messaging with your attending healthcare professionals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px] rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden shadow-xs">
        {/* Active Conversations Sidebar */}
        <div className="border-r border-[#E2E8F0] bg-[#F8FAFC] p-3 space-y-2">
          <h2 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Consultations
          </h2>
          <div className="flex items-center gap-3 rounded-xl bg-white p-3 border border-[#E2E8F0] shadow-xs cursor-pointer">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-[#0F9D8C] font-bold">
              A
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#0F172A] truncate">
                Dr. Ananya Sharma
              </p>
              <p className="text-xs text-[#64748B] truncate">
                General Physician
              </p>
            </div>
          </div>
        </div>

        {/* Chat Thread */}
        <div className="md:col-span-2 flex flex-col h-full bg-white">
          {/* Thread Header */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-3.5 bg-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-[#0F9D8C] font-bold text-sm">
                A
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Dr. Ananya Sharma
                </h3>
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Online for Consultation
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] text-slate-600 hover:bg-slate-50">
                <Video className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === "patient" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-md rounded-2xl px-4 py-2.5 text-sm ${
                    m.sender === "patient"
                      ? "bg-[#0F9D8C] text-white rounded-br-none"
                      : "bg-white text-[#0F172A] border border-[#E2E8F0] shadow-xs rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>
                <span className="mt-1 text-[10px] text-slate-400 px-1">
                  {m.time}
                </span>
              </div>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-[#E2E8F0] p-3 bg-white"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your health query..."
              className="flex-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2 text-sm text-[#0F172A] focus:border-[#0F9D8C] focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F9D8C] text-white hover:bg-[#0C8577]"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
