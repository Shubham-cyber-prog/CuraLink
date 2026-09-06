"use client";

import React from "react";
import { HelpCircle, PhoneCall, Mail, MessageSquare, ShieldCheck, ChevronRight } from "lucide-react";

export default function HelpSupportPage() {
  const faqs = [
    {
      q: "How do video consultations work on CuraLink?",
      a: "Once you book a slot, you'll receive a consultation link. At the appointed time, click 'Join Consultation' from your Dashboard or Appointments page.",
    },
    {
      q: "Is my personal medical data secure & HIPAA compliant?",
      a: "Yes. All health records and communications are 256-bit end-to-end encrypted in strict compliance with HIPAA security standards.",
    },
    {
      q: "Can I get a digital prescription after my call?",
      a: "Absolutely. Attending doctors issue instant digital prescriptions accessible under your Medical Records section right after your call finishes.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E2E8F0] pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          Help & Support
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Need help booking a visit or accessing your records? We are here 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-[#0F9D8C]">
            <PhoneCall className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-sm font-bold text-[#0F172A]">
            24/7 Medical Helpline
          </h3>
          <p className="mt-1 text-xs text-[#64748B]">
            Call toll-free for immediate assistance.
          </p>
          <a
            href="tel:1800123456"
            className="mt-3 inline-block text-xs font-bold text-[#0F9D8C]"
          >
            +1 (800) 555-CURA
          </a>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Mail className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-sm font-bold text-[#0F172A]">
            Email Support
          </h3>
          <p className="mt-1 text-xs text-[#64748B]">
            Get responses within 2 hours.
          </p>
          <a
            href="mailto:support@curalink.health"
            className="mt-3 inline-block text-xs font-bold text-blue-600"
          >
            support@curalink.health
          </a>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <MessageSquare className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-sm font-bold text-[#0F172A]">
            Live Chat Assistant
          </h3>
          <p className="mt-1 text-xs text-[#64748B]">
            Chat with a support specialist.
          </p>
          <button
            onClick={() => alert("Opening CuraLink Live Support Chat...")}
            className="mt-3 inline-block text-xs font-bold text-emerald-600 hover:underline"
          >
            Start Live Chat →
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-[#0F172A]">
          Frequently Asked Questions
        </h2>
        <div className="divide-y divide-[#E2E8F0]">
          {faqs.map((faq, i) => (
            <div key={i} className="py-4 first:pt-0 last:pb-0">
              <h3 className="text-sm font-semibold text-[#0F172A]">{faq.q}</h3>
              <p className="mt-1.5 text-xs text-[#64748B] leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
