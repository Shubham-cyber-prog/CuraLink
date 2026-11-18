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
  AlertCircle,
  Loader2,
  CheckCheck,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import {
  formatDateIST,
  formatDoctorName,
  getDoctorAvatar,
} from "@/lib/clinical-formatters";

interface ChatMessage {
  id: string;
  sender: "self" | "other";
  text: string;
  time: string;
  read?: boolean;
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
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 1. Load authenticated user & appointment-linked contacts via shared api client
  useEffect(() => {
    let mounted = true;
    async function loadContacts() {
      try {
        setIsLoading(true);
        const meRes = await api.get("/auth/me");
        if (!meRes?.success || !meRes.data) return;
        const user = meRes.data.user || meRes.data;
        if (!mounted) return;
        setCurrentUser(user);

        if (user.role === "DOCTOR") {
          const apptRes = await api.get("/doctor/me/appointments");
          if (apptRes?.success && Array.isArray(apptRes.data) && mounted) {
            const map = new Map<string, ChatContact>();
            for (const a of apptRes.data) {
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
        } else {
          const [apptRes, docRes] = await Promise.all([
            api.get("/appointments/my-appointments").catch(() => null),
            api.get("/doctors/verified").catch(() => null),
          ]);

          const docMap: Record<string, any> = {};
          if (docRes?.success && Array.isArray(docRes.data)) {
            for (const d of docRes.data) {
              docMap[d.id] = d;
              if (d.userId) docMap[d.userId] = d;
            }
          }

          if (apptRes?.success && Array.isArray(apptRes.data) && mounted) {
            const map = new Map<string, ChatContact>();
            const sorted = [...apptRes.data].sort((a: any, b: any) => {
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
      } catch (err) {
        console.warn("Error loading chat contacts:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadContacts();
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Live message polling using shared api client (Bearer + cookies)
  useEffect(() => {
    if (!selectedContact?.appointmentId || !currentUser) return;
    const apptId = selectedContact.appointmentId;
    let isMounted = true;
    setSendError(null);

    async function fetchMessages() {
      try {
        const data = await api.get(`/messages?appointmentId=${encodeURIComponent(apptId)}&limit=100`);
        if (data?.success && Array.isArray(data.data) && isMounted) {
          const mapped: ChatMessage[] = data.data.map((m: any) => ({
            id: m.id,
            sender: m.senderId === currentUser.id ? "self" : "other",
            text: m.content,
            read: Boolean(m.read),
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
    const interval = setInterval(fetchMessages, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedContact?.appointmentId, currentUser?.id]);

  // 3. Send message with automatic CSRF token + Bearer auth via api.post
  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || !selectedContact?.appointmentId || !currentUser || isSending) return;

    const content = textToSend.trim();
    setInput("");
    setSendError(null);
    setIsSending(true);

    try {
      const data = await api.post("/messages", {
        appointmentId: selectedContact.appointmentId,
        content,
      });

      if (!data?.success || !data.data) {
        throw new Error(data?.message || "Could not send message.");
      }

      setMessages((prev) => {
        if (prev.some((m) => m.id === data.data.id)) return prev;
        return [
          ...prev,
          {
            id: data.data.id,
            sender: "self",
            text: data.data.content,
            read: false,
            time: new Date(data.data.createdAt).toLocaleTimeString("en-IN", {
              timeZone: "Asia/Kolkata",
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ];
      });
    } catch (err: any) {
      setInput(content);
      setSendError(err?.message || "Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

  const filteredContacts = useMemo(() => {
    const q = contactSearch.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q)
    );
  }, [contacts, contactSearch]);

  const quickReplies =
    currentUser?.role === "DOCTOR"
      ? [
          "Please join the video room when ready.",
          "Your digital prescription has been uploaded.",
          "Kindly share your latest BP / glucose reading.",
        ]
      : [
          "Hello Doctor, I am ready for the consultation.",
          "I have uploaded my latest vitals.",
          "Quick question about my prescribed dosage.",
        ];

  return (
    <div className="space-y-7">
      {/* Classic Editorial Header */}
      <div className="pb-6 border-b border-slate-200/80 dark:border-white/[0.08]">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#006D77] dark:text-[#83C5BE] mb-1">
          Direct Care Desk
        </p>
        <h1 className="font-serif text-3xl sm:text-[36px] leading-tight font-normal tracking-[-0.015em] text-[#0B1F33] dark:text-white">
          Messages
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Real-time messaging directly connected to your scheduled consultations.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[580px] rounded-[24px] border border-slate-200/75 dark:border-white/[0.08] bg-white dark:bg-[#0B1F33] p-5">
          <div className="md:col-span-4 space-y-3">
            <Skeleton className="h-10 w-full rounded-full" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
          <div className="md:col-span-8 space-y-3">
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="rounded-[24px] border border-slate-200/75 dark:border-white/[0.08] bg-white dark:bg-[#0B1F33] py-16 px-4 text-center shadow-[0_2px_16px_-4px_rgba(11,31,51,0.05)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4F7F8] dark:bg-white/[0.06] text-[#006D77] dark:text-[#83C5BE] mx-auto mb-3">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-xl text-[#0B1F33] dark:text-white">
            No conversations yet
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {currentUser?.role === "DOCTOR"
              ? "Conversations appear once patients book consultations with your practice."
              : "Direct messaging opens automatically after you book an appointment with a doctor."}
          </p>
          <Link
            href={currentUser?.role === "DOCTOR" ? "/doctor-dashboard" : "/find-doctor"}
            className="mt-5 inline-flex items-center h-10 px-5 rounded-full bg-[#006D77] hover:bg-[#005860] text-sm font-medium text-white shadow-sm"
          >
            {currentUser?.role === "DOCTOR" ? "Go to Dashboard" : "Book Appointment"}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 h-[640px] rounded-[24px] border border-slate-200/75 dark:border-white/[0.08] bg-white dark:bg-[#0B1F33] overflow-hidden shadow-[0_4px_24px_-6px_rgba(11,31,51,0.07)]">
          {/* Sidebar */}
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/[0.08] bg-[#F7FAFB] dark:bg-[#071320]/60 p-4 flex flex-col gap-3.5 overflow-y-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full h-10 rounded-full border border-slate-200/80 dark:border-white/[0.1] bg-white dark:bg-[#0B1F33] pl-9 pr-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#006D77] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 flex-1 overflow-y-auto">
              {filteredContacts.map((c) => {
                const isSelected = selectedContact?.id === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setSelectedContact(c)}
                    className={`w-full text-left flex items-center gap-3 rounded-2xl p-3 border transition-all cursor-pointer ${isSelected
                      ? "bg-white dark:bg-[#0B1F33] border-slate-200/90 dark:border-white/[0.12] shadow-xs"
                      : "border-transparent hover:bg-white/70 dark:hover:bg-white/[0.04]"
                      }`}
                  >
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-200/80 dark:border-white/[0.1] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {c.avatarUrl ? (
                        <Image
                          src={c.avatarUrl}
                          alt={c.name}
                          width={44}
                          height={44}
                          className="h-full w-full object-cover object-top"
                        />
                      ) : (
                        <span>{c.name.replace(/^Dr\.\s*/i, "").charAt(0)}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#0B1F33] dark:text-white truncate">
                        {c.name}
                      </p>
                      <p className="text-xs text-[#006D77] dark:text-[#83C5BE] truncate">
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
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-white/[0.08] px-6 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200/80 dark:border-white/[0.1] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {selectedContact.avatarUrl ? (
                      <Image
                        src={selectedContact.avatarUrl}
                        alt={selectedContact.name}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <span>{selectedContact.name.replace(/^Dr\.\s*/i, "").charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg leading-tight text-[#0B1F33] dark:text-white truncate">
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
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#006D77] hover:bg-[#005860] text-xs font-medium text-white shadow-xs whitespace-nowrap transition-colors"
                  >
                    <Video className="h-3.5 w-3.5" />
                    <span>Join Video Call</span>
                  </Link>
                ) : selectedContact.status === "PENDING" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 whitespace-nowrap">
                    <Clock className="h-3.5 w-3.5" />
                    Pending Confirmation
                  </span>
                ) : currentUser?.role === "PATIENT" ? (
                  <Link
                    href="/records"
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-slate-200 dark:border-white/[0.12] text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] whitespace-nowrap"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>View e-Rx</span>
                  </Link>
                ) : null}
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3.5 bg-[#F7FAFB] dark:bg-[#071320]">
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
                      className={`flex flex-col ${m.sender === "self" ? "items-end" : "items-start"
                        }`}
                    >
                      <div
                        className={`max-w-[80%] sm:max-w-md rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.sender === "self"
                          ? "bg-[#006D77] text-white rounded-br-sm shadow-xs"
                          : "bg-white dark:bg-[#0B1F33] text-[#0B1F33] dark:text-slate-100 border border-slate-200/80 dark:border-white/[0.08] rounded-bl-sm shadow-2xs"
                          }`}
                      >
                        {m.text}
                      </div>
                      <span className="mt-1 text-[11px] text-slate-400 px-1 inline-flex items-center gap-1">
                        {m.time} IST
                        {m.sender === "self" && (
                          <CheckCheck
                            className={`h-3 w-3 ${
                              m.read ? "text-[#006D77] dark:text-[#83C5BE]" : "text-slate-400"
                            }`}
                          />
                        )}
                      </span>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Error banner if send fails */}
              {sendError && (
                <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-900 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{sendError}</span>
                </div>
              )}

              {/* Quick Reply Chips */}
              <div className="px-4 pt-2.5 pb-1 bg-white dark:bg-[#0B1F33] border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-1.5 overflow-x-auto">
                {quickReplies.map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={isSending}
                    onClick={() => sendMessage(q)}
                    className="whitespace-nowrap shrink-0 rounded-full border border-slate-200/80 dark:border-white/[0.1] bg-[#F4F7F8] dark:bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:border-[#006D77]/40 hover:text-[#006D77] dark:hover:text-[#83C5BE] transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <form
                onSubmit={handleSend}
                className="flex items-center gap-2.5 p-4 pt-2.5 bg-white dark:bg-[#0B1F33]"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Message ${selectedContact.name}...`}
                  className="flex-1 h-10 rounded-full border border-slate-200 dark:border-white/[0.1] bg-[#F4F7F8] dark:bg-[#071320] px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#006D77] focus:bg-white dark:focus:bg-[#0B1F33] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isSending}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#006D77] hover:bg-[#005860] text-white disabled:opacity-40 shadow-xs transition-colors cursor-pointer"
                  aria-label="Send message"
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
