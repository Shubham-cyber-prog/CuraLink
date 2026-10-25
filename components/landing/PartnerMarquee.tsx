"use client";

import React from "react";
import { ShieldCheck, Award, Newspaper, Building2 } from "lucide-react";

const PARTNERS = [
  { name: "Apollo Hospitals", type: "Clinical Network", icon: Building2 },
  { name: "Max Healthcare", type: "Hospital Partner", icon: Building2 },
  { name: "HDFC ERGO", type: "Cashless Health Insurance", icon: ShieldCheck },
  { name: "Star Health", type: "Insurance Partner", icon: ShieldCheck },
  { name: "Fortis Escorts", type: "Cardiac Care Network", icon: Building2 },
  { name: "Care Health Insurance", type: "TPA Partner", icon: ShieldCheck },
  { name: "HIPAA Compliant", type: "Global Standard", icon: Award },
  { name: "DPDP Act 2023", type: "Indian Data Privacy", icon: Award },
  { name: "Forbes Health", type: "Featured 'Top Telehealth 2025'", icon: Newspaper },
  { name: "TechCrunch", type: "Press Mention", icon: Newspaper },
  { name: "The Economic Times", type: "Digital Health Leader", icon: Newspaper },
  { name: "Medanta - The Medicity", type: "Super Specialty Partner", icon: Building2 },
];

export function PartnerMarquee() {
  return (
    <section className="py-8 sm:py-10 border-y border-border bg-surface-elevated/50 overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-5 text-center">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
          Trusted by Premier Healthcare Institutions, Leading Insurers & National Media
        </p>
      </div>

      {/* Continuous Marquee Track */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="animate-marquee flex items-center gap-8 py-2">
          {/* Duplicate twice for seamless infinite loop */}
          {[...PARTNERS, ...PARTNERS].map((partner, index) => {
            const Icon = partner.icon;
            return (
              <div
                key={`${partner.name}-${index}`}
                className="flex items-center gap-3 rounded-xl border border-border/80 bg-surface px-5 py-2.5 shadow-2xs hover:border-[#83C5BE]/60 transition-all shrink-0 cursor-default"
              >
                <div className="h-7 w-7 rounded-lg bg-[#006D77]/10 text-[#006D77] dark:text-[#83C5BE] flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-foreground tracking-tight whitespace-nowrap">
                    {partner.name}
                  </p>
                  <p className="text-[10px] text-muted whitespace-nowrap">
                    {partner.type}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
