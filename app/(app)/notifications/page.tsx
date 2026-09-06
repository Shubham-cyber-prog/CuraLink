"use client";

import React from "react";
import { Bell, Calendar, FileText, ShieldAlert, Check } from "lucide-react";

export default function NotificationsPage() {
  const notifications = [
    {
      id: "1",
      title: "Upcoming Video Consultation Today",
      desc: "Dr. Ananya Sharma • 4:30 PM. Please ensure stable internet connectivity.",
      time: "10 mins ago",
      icon: <Calendar className="h-5 w-5 text-[#0F9D8C]" />,
      badge: "Appointment",
    },
    {
      id: "2",
      title: "New Lab Result Available",
      desc: "Complete Blood Count (CBC) analysis report ready for download.",
      time: "1 hour ago",
      icon: <FileText className="h-5 w-5 text-blue-600" />,
      badge: "Medical Report",
    },
    {
      id: "3",
      title: "Prescription Refill Reminder",
      desc: "Your Vitamin D3 prescription has 5 days remaining.",
      time: "1 day ago",
      icon: <Bell className="h-5 w-5 text-purple-600" />,
      badge: "Prescription",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E2E8F0] pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Stay updated with appointment reminders, report alerts, and health notices.
        </p>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="flex items-start gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition-colors hover:bg-slate-50/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">
              {n.icon}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-[#0F172A]">{n.title}</h3>
                <span className="text-xs text-slate-400">{n.time}</span>
              </div>
              <p className="mt-1 text-xs text-[#64748B]">{n.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
