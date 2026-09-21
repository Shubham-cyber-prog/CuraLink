"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Send, Stethoscope, Video, MessageSquare, ArrowRight, User, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ChatMessage {
  id: string;
  sender: "self" | "other";
  text: string;
  time: string;
}

interface ChatContact {
  id: string;
  name: string;
  subtitle: string;
  appointmentId?: string;
  date?: string;
  time?: string;
  status?: string;
}

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Auth & Contacts (Doctors or Patients based on role)
  useEffect(() => {
    async function loadContacts() {
      try {
        setIsLoading(true);
        const meRes = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
        if (!meRes.ok) return;
        const meData = await meRes.json();
        const user = meData.data?.user || meData.data;
        setCurrentUser(user);

        if (user.role === "DOCTOR") {
          // Fetch Doctor's appointments to get patients
          const apptRes = await fetch(`${API_BASE}/doctor/me/appointments`, { credentials: "include" });
          if (apptRes.ok) {
            const apptData = await apptRes.json();
            if (apptData.success && Array.isArray(apptData.data)) {
              const map = new Map<string, ChatContact>();
              for (const a of apptData.data) {
                if (!map.has(a.patientId)) {
                  map.set(a.patientId, {
                    id: a.patientId,
                    name: a.patientName || "Patient",
                    subtitle: `Consultation on ${a.date}`,
                    appointmentId: a.id,
                    date: a.date,
                    time: a.time,
                    status: a.status,
                  });
                }
              }
              const contactList = Array.from(map.values());
              setContacts(contactList);
              if (contactList.length > 0) setSelectedContact(contactList[0]);
            }
          }
        } else {
          // Patient: fetch appointments & doctors
          const [apptRes, docRes] = await Promise.all([
            fetch(`${API_BASE}/appointments/my-appointments`, { credentials: "include" }),
            fetch(`${API_BASE}/doctors/verified`),
          ]);

          const docMap: Record<string, any> = {};
          if (docRes.ok) {
            const docData = await docRes.json();
            if (docData.success && Array.isArray(docData.data)) {
              for (const d of docData.data) {
                docMap[d.id] = d;
                if (d.userId) docMap[d.userId] = d;
              }
            }
          }

          if (apptRes.ok) {
            const apptData = await apptRes.json();
            if (apptData.success && Array.isArray(apptData.data)) {
              const map = new Map<string, ChatContact>();
              for (const a of apptData.data) {
                const doc = a.doctor || docMap[a.doctorId];
                const docId = a.doctorId;
                if (!map.has(docId)) {
                  map.set(docId, {
                    id: docId,
                    name: doc?.name ? `Dr. ${doc.name.replace(/^Dr\.\s*/i, "")}` : "Attending Doctor",
                    subtitle: doc?.specialty || doc?.specialization || "Telehealth Consultation",
                    appointmentId: a.id,
                    date: a.date,
                    time: a.time,
                    status: a.status,
                  });
                }
              }
              const contactList = Array.from(map.values());
              setContacts(contactList);
              if (contactList.length > 0) setSelectedContact(contactList[0]);
            }
          }
        }
      } catch (err) {
        console.warn("Error loading chat contacts:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadContacts();
  }, []);

  // 2. Load stored conversation for selected contact
  useEffect(() => {
    if (!selectedContact || !currentUser) return;
    const storageKey = `curalink_chat_${currentUser.id}_${selectedContact.id}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
  }, [selectedContact, currentUser]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedContact || !currentUser) return;

    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      sender: "self",
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    setInput("");

    try {
      const storageKey = `curalink_chat_${currentUser.id}_${selectedContact.id}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (err) {
      console.warn("Failed to persist message:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-[#E2E8F0] dark:border-[#263049] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
          Consultation Messages
        </h1>
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
          Direct secure messaging with your verified healthcare providers and patients.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[550px] rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] overflow-hidden p-4">
          <div className="space-y-3">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
          <div className="md:col-span-2 space-y-3 p-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-[#263049] bg-slate-50/50 dark:bg-[#151B2E]/60 py-24 text-center px-4">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950/60 text-[#0F9D8C] dark:text-teal-400">
            <MessageSquare className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9]">
            No Active Conversations
          </h3>
          <p className="mt-1 max-w-md text-sm text-[#64748B] dark:text-[#94A3B8]">
            {currentUser?.role === "DOCTOR"
              ? "When patients book consultations with you, secure direct messaging channels will be established here."
              : "Direct messaging opens once you book a consultation with any attending doctor."}
          </p>
          <Link
            href={currentUser?.role === "DOCTOR" ? "/doctor-dashboard" : "/find-doctor"}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0F9D8C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0C8577] transition-colors"
          >
            {currentUser?.role === "DOCTOR" ? "Go to Doctor Dashboard" : "Find a Doctor & Book"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px] rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] overflow-hidden shadow-xs">
          {/* Active Conversations Sidebar */}
          <div className="border-r border-[#E2E8F0] dark:border-[#263049] bg-[#F8FAFC] dark:bg-[#0f172a] p-3 space-y-2 overflow-y-auto">
            <h2 className="px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Active Consultations ({contacts.length})
            </h2>
            {contacts.map((c) => {
              const isSelected = selectedContact?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedContact(c)}
                  className={`flex items-center gap-3 rounded-xl p-3 border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white dark:bg-[#1C2338] border-[#0F9D8C] dark:border-teal-500/80 shadow-xs"
                      : "border-transparent hover:bg-white/60 dark:hover:bg-[#151B2E]"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-950/60 text-[#0F9D8C] dark:text-teal-300 font-bold text-sm">
                    {c.name.replace(/^Dr\.\s*/i, "").charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] truncate">
                      {c.name}
                    </p>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate">
                      {c.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Thread */}
          {selectedContact ? (
            <div className="md:col-span-2 flex flex-col h-full bg-white dark:bg-[#151B2E]">
              {/* Thread Header */}
              <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263049] px-5 py-3.5 bg-white dark:bg-[#151B2E]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0F9D8C] dark:text-teal-400 font-bold text-sm">
                    {selectedContact.name.replace(/^Dr\.\s*/i, "").charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                      {selectedContact.name}
                    </h3>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Consultation Channel Active
                    </span>
                  </div>
                </div>

                {selectedContact.appointmentId && (
                  <Link
                    href={`/consultation/${selectedContact.appointmentId}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs font-semibold text-[#0F9D8C] dark:text-teal-300 hover:bg-[#0F9D8C] hover:text-white transition-colors"
                  >
                    <Video className="h-3.5 w-3.5" />
                    Join Video
                  </Link>
                )}
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC] dark:bg-[#070b14]">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400 dark:text-slate-500 space-y-2">
                    <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                    <p className="text-xs">
                      Send a message to {selectedContact.name} regarding your consultation.
                    </p>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        m.sender === "self" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-md rounded-2xl px-4 py-2.5 text-sm ${
                          m.sender === "self"
                            ? "bg-[#0F9D8C] text-white rounded-br-none"
                            : "bg-white dark:bg-[#1C2338] text-[#0F172A] dark:text-[#F1F5F9] border border-[#E2E8F0] dark:border-[#263049] shadow-xs rounded-bl-none"
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="mt-1 text-[10px] text-slate-400 px-1">
                        {m.time}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Input Footer */}
              <form
                onSubmit={handleSend}
                className="flex items-center gap-2 border-t border-[#E2E8F0] dark:border-[#263049] p-3 bg-white dark:bg-[#151B2E]"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Message ${selectedContact.name}...`}
                  className="flex-1 rounded-xl border border-[#E2E8F0] dark:border-[#263049] bg-[#F8FAFC] dark:bg-[#070b14] px-4 py-2.5 text-sm text-[#0F172A] dark:text-[#F1F5F9] focus:border-[#0F9D8C] focus:bg-white dark:focus:bg-[#151B2E] focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F9D8C] text-white hover:bg-[#0C8577] transition-colors cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
