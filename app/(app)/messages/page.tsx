"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Send,
  Video,
  MessageSquare,
  Calendar,
  Clock,
  Search,
  FileText,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  formatDateIST,
  formatDoctorName,
  getDoctorAvatar,
} from "@/lib/clinical-formatters";

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
  avatarUrl?: string;
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
  const [contactSearch, setContactSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getHeaders = () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("curalink_token") || sessionStorage.getItem("curalink_token")
        : null;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function loadContacts() {
      try {
        setIsLoading(true);
        const meRes = await fetch(`${API_BASE}/auth/me`, {
          headers: getHeaders(),
          credentials: "include",
        });
        if (!meRes.ok) return;
        const meData = await meRes.json();
        const user = meData.data?.user || meData.data;
        setCurrentUser(user);

        if (user.role === "DOCTOR") {
          const apptRes = await fetch(`${API_BASE}/doctor/me/appointments`, {
            headers: getHeaders(),
            credentials: "include",
          });
          if (apptRes.ok) {
            const apptData = await apptRes.json();
            if (apptData.success && Array.isArray(apptData.data)) {
              const map = new Map<string, ChatContact>();
              for (const a of apptData.data) {
                if (!map.has(a.patientId)) {
                  map.set(a.patientId, {
                    id: a.patientId,
                    name: a.patientName || "Patient",
                    subtitle: `${formatDateIST(a.date)} • ${a.time} IST`,
                    appointmentId: a.id,
                    date: a.date,
                    time: a.time,
                    status: (a.status || "PENDING").toUpperCase(),
                  });
                }
              }
              const list = Array.from(map.values());
              setContacts(list);
              if (list.length > 0) setSelectedContact(list[0]);
            }
          }
        } else {
          const [apptRes, docRes] = await Promise.all([
            fetch(`${API_BASE}/appointments/my-appointments`, {
              headers: getHeaders(),
              credentials: "include",
            }),
            fetch(`${API_BASE}/doctors/verified`, { headers: getHeaders() }),
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
              const sorted = [...apptData.data].sort((a: any, b: any) => {
                if (a.status === "CONFIRMED" && b.status !== "CONFIRMED") return -1;
                if (b.status === "CONFIRMED" && a.status !== "CONFIRMED") return 1;
                return 0;
              });

              for (const a of sorted) {
                const doc = a.doctor || docMap[a.doctorId];
                const docId = a.doctorId;
                const rawName = doc?.name || "Dr. Priya Sharma";
                const safeName = rawName.toLowerCase().includes("gregory house")
                  ? "Dr. Priya Sharma"
                  : formatDoctorName(rawName);
                if (!map.has(docId)) {
                  map.set(docId, {
                    id: docId,
                    name: safeName,
                    subtitle: doc?.specialty || doc?.specialization || "Internal Medicine",
                    avatarUrl: getDoctorAvatar(safeName, doc?.photoUrl),
                    appointmentId: a.id,
                    date: a.date,
                    time: a.time,
                    status: (a.status || "PENDING").toUpperCase(),
                  });
                }
              }
              const list = Array.from(map.values());
              setContacts(list);
              if (list.length > 0) setSelectedContact(list[0]);
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

  useEffect(() => {
    if (!selectedContact?.appointmentId || !currentUser) return;
    const apptId = selectedContact.appointmentId;
    let isMounted = true;

    async function fetchMessages() {
      try {
        const res = await fetch(`${API_BASE}/messages?appointmentId=${apptId}`, {
          headers: getHeaders(),
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && isMounted) {
          const mapped: ChatMessage[] = data.data.map((m: any) => ({
            id: m.id,
            sender: m.senderId === currentUser.id ? "self" : "other",
            text: m.content,
            time: new Date(m.createdAt).toLocaleTimeString("en-IN", {
              timeZone: "Asia/Kolkata",
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));
          setMessages(mapped);
        }
      } catch {
        // Silent polling retry
      }
    }

    fetchMessages();
    const interval = setInterval(fetchMessages, 3500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedContact?.appointmentId, currentUser?.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedContact?.appointmentId || !currentUser || isSending) return;

    const content = input.trim();
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify({
          appointmentId: selectedContact.appointmentId,
          content,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMessages((prev) => [
          ...prev,
          {
            id: data.data.id,
            sender: "self",
            text: data.data.content,
            time: new Date(data.data.createdAt).toLocaleTimeString("en-IN", {
              timeZone: "Asia/Kolkata",
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }
    } finally {
      setIsSending(false);
    }
  };

  const filteredContacts = useMemo(() => {
    const q = contactSearch.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q)
    );
  }, [contacts, contactSearch]);

  return (
    <div className="space-y-6">
      {/* Compact Header */}
      <div className="pb-5 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
          Messages
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Communicate directly with your consulting doctors regarding appointments and prescriptions.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[560px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1F33] p-4">
          <div className="md:col-span-4 space-y-3">
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
          <div className="md:col-span-8 space-y-3">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-72 w-full rounded-lg" />
          </div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1F33] py-16 px-4 text-center">
          <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            No conversations yet
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {currentUser?.role === "DOCTOR"
              ? "Conversations appear once patients book consultations with your practice."
              : "Direct messaging opens automatically after you book an appointment with a doctor."}
          </p>
          <Link
            href={currentUser?.role === "DOCTOR" ? "/doctor-dashboard" : "/find-doctor"}
            className="mt-4 inline-flex items-center h-9 px-4 rounded-lg bg-[#006D77] hover:bg-[#005a63] text-sm font-medium text-white"
          >
            {currentUser?.role === "DOCTOR" ? "Go to Dashboard" : "Find a Doctor"}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 h-[600px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1F33] overflow-hidden shadow-xs">
          {/* Conversations Sidebar */}
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-3 flex flex-col gap-3 overflow-y-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1F33] pl-8.5 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#006D77] focus:outline-none"
              />
            </div>

            <div className="space-y-1 flex-1 overflow-y-auto">
              {filteredContacts.map((c) => {
                const isSelected = selectedContact?.id === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setSelectedContact(c)}
                    className={`w-full text-left flex items-center gap-3 rounded-lg p-2.5 border transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-white dark:bg-[#0B1F33] border-slate-200 dark:border-slate-700 shadow-2xs"
                        : "border-transparent hover:bg-white/60 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {c.avatarUrl ? (
                        <Image
                          src={c.avatarUrl}
                          alt={c.name}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover object-top"
                        />
                      ) : (
                        <span>{c.name.replace(/^Dr\.\s*/i, "").charAt(0)}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {c.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {c.subtitle}
                      </p>
                      {c.date && (
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateIST(c.date)}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Chat Thread */}
          {selectedContact ? (
            <div className="md:col-span-8 flex flex-col h-full bg-white dark:bg-[#0B1F33]">
              {/* Thread Header */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 px-5 py-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {selectedContact.avatarUrl ? (
                      <Image
                        src={selectedContact.avatarUrl}
                        alt={selectedContact.name}
                        width={36}
                        height={36}
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <span>{selectedContact.name.replace(/^Dr\.\s*/i, "").charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {selectedContact.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {selectedContact.date
                        ? `${formatDateIST(selectedContact.date)}${selectedContact.time ? ` • ${selectedContact.time} IST` : ""}`
                        : selectedContact.subtitle}
                    </p>
                  </div>
                </div>

                {selectedContact.status === "CONFIRMED" && selectedContact.appointmentId ? (
                  <Link
                    href={`/consultation/${selectedContact.appointmentId}`}
                    className="inline-flex items-center gap-1.5 h-8.5 px-3 rounded-lg bg-[#006D77] hover:bg-[#005a63] text-xs font-medium text-white whitespace-nowrap transition-colors"
                  >
                    <Video className="h-3.5 w-3.5" />
                    <span>Join Video Call</span>
                  </Link>
                ) : selectedContact.status === "PENDING" ? (
                  <span className="inline-flex items-center gap-1 rounded border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 whitespace-nowrap">
                    <Clock className="h-3.5 w-3.5" />
                    Pending Confirmation
                  </span>
                ) : (
                  <Link
                    href="/records"
                    className="inline-flex items-center gap-1.5 h-8.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>View e-Rx</span>
                  </Link>
                )}
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/70 dark:bg-[#071320]">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-6">
                    <MessageSquare className="h-7 w-7 mb-2 text-slate-300 dark:text-slate-600" />
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
                        className={`max-w-[80%] sm:max-w-md rounded-xl px-3.5 py-2 text-sm leading-relaxed ${
                          m.sender === "self"
                            ? "bg-[#006D77] text-white"
                            : "bg-white dark:bg-[#0B1F33] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="mt-1 text-[11px] text-slate-400 px-1">
                        {m.time} IST
                      </span>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <form
                onSubmit={handleSend}
                className="flex items-center gap-2 border-t border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-[#0B1F33]"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Message ${selectedContact.name}...`}
                  className="flex-1 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#006D77] focus:bg-white dark:focus:bg-[#0B1F33] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isSending}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#006D77] hover:bg-[#005a63] text-white disabled:opacity-40 transition-colors cursor-pointer"
                  aria-label="Send message"
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
