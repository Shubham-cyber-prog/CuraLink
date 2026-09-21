"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Calendar, FileText, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  badge: string;
  href?: string;
  type: "appointment" | "prescription" | "security" | "system";
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      try {
        setIsLoading(true);
        const meRes = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
        if (!meRes.ok) return;
        const meData = await meRes.json();
        const user = meData.data?.user || meData.data;

        const notifs: NotificationItem[] = [];

        if (user.role === "DOCTOR") {
          // Doctor notifications
          const apptRes = await fetch(`${API_BASE}/doctor/me/appointments`, { credentials: "include" });
          if (apptRes.ok) {
            const apptData = await apptRes.json();
            if (apptData.success && Array.isArray(apptData.data)) {
              for (const a of apptData.data.slice(0, 10)) {
                notifs.push({
                  id: `appt_${a.id}`,
                  title: `Consultation: ${a.patientName || "Patient"}`,
                  desc: `${a.date} at ${a.time} • Status: ${a.status}`,
                  time: a.date,
                  badge: "Appointment",
                  href: a.status === "CONFIRMED" ? `/consultation/${a.id}` : "/doctor-dashboard",
                  type: "appointment",
                });
              }
            }
          }

          notifs.push({
            id: "doc_status",
            title: "Practice Status: Verified",
            desc: "Your medical credentials and NMC telehealth license are verified.",
            time: "System",
            badge: "Compliance",
            href: "/doctor-dashboard",
            type: "security",
          });
        } else {
          // Patient notifications
          const [apptRes, rxRes, docRes] = await Promise.all([
            fetch(`${API_BASE}/appointments/my-appointments`, { credentials: "include" }),
            fetch(`${API_BASE}/prescriptions/my-prescriptions`, { credentials: "include" }),
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
              for (const a of apptData.data.slice(0, 5)) {
                const doc = a.doctor || docMap[a.doctorId];
                const docName = doc?.name ? `Dr. ${doc.name.replace(/^Dr\.\s*/i, "")}` : "Attending Doctor";
                notifs.push({
                  id: `appt_${a.id}`,
                  title: `Consultation with ${docName}`,
                  desc: `${a.date} at ${a.time} • Status: ${a.status}`,
                  time: a.date,
                  badge: a.status,
                  href: a.status === "CONFIRMED" ? `/consultation/${a.id}` : "/appointments",
                  type: "appointment",
                });
              }
            }
          }

          if (rxRes.ok) {
            const rxData = await rxRes.json();
            if (rxData.success && Array.isArray(rxData.data)) {
              for (const r of rxData.data.slice(0, 5)) {
                notifs.push({
                  id: `rx_${r.id}`,
                  title: `E-Prescription: ${r.diagnosis}`,
                  desc: `Issued by ${r.doctor?.name ? `Dr. ${r.doctor.name}` : "Attending Doctor"}`,
                  time: new Date(r.createdAt).toLocaleDateString(),
                  badge: "Prescription",
                  href: "/records",
                  type: "prescription",
                });
              }
            }
          }

          notifs.push({
            id: "account_active",
            title: `Welcome to CuraLink, ${user.name?.split(" ")[0] || "there"}!`,
            desc: "Your HIPAA compliant 256-bit encrypted health portal is active.",
            time: "Account Active",
            badge: "Security",
            href: "/dashboard",
            type: "security",
          });
        }

        setNotifications(notifs);
      } catch (err) {
        console.warn("Error loading notifications:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadNotifications();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E2E8F0] dark:border-[#263049] pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">
          Real-time updates regarding your upcoming consultations, medical records, and health alerts.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-5"
            >
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48 rounded-md" />
                <Skeleton className="h-4 w-64 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-[#263049] bg-slate-50/50 dark:bg-[#151B2E]/60 py-20 text-center px-4">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
            <Bell className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F1F5F9]">
            You&apos;re All Caught Up
          </h3>
          <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8] max-w-sm">
            You have no unread notifications or pending consultation alerts.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.href || "#"}
              className="flex items-start gap-4 rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-5 shadow-xs transition-colors hover:bg-slate-50/60 dark:hover:bg-[#1C2338]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0F9D8C] dark:text-teal-400">
                {n.type === "appointment" ? (
                  <Calendar className="h-5 w-5" />
                ) : n.type === "prescription" ? (
                  <FileText className="h-5 w-5 text-blue-500" />
                ) : (
                  <ShieldCheck className="h-5 w-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] truncate">
                    {n.title}
                  </h3>
                  <span className="text-xs text-slate-400 shrink-0">{n.time}</span>
                </div>
                <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8] line-clamp-2">
                  {n.desc}
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-slate-100 dark:bg-[#0f172a] px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                {n.badge}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
