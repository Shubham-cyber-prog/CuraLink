"use client";

import React, { useEffect, useRef } from "react";
import { ShieldCheck, Video, CalendarCheck, Lock } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface StatItem {
  target: number;
  decimals: number;
  prefix?: string;
  suffix?: string;
  label: string;
  detail: string;
}

const STATS: StatItem[] = [
  {
    target: 99.4,
    decimals: 1,
    suffix: "%",
    label: "Triage Protocol Precision",
    detail: "Clinical decision support aligned with primary care triage protocols.",
  },
  {
    target: 60,
    decimals: 0,
    prefix: "< ",
    suffix: "s",
    label: "Specialist Matching Time",
    detail: "Instant routing to active licensed physicians without phone waiting trees.",
  },
  {
    target: 100,
    decimals: 0,
    suffix: "%",
    label: "Cryptographic Isolation",
    detail: "Zero patient data monetization or ad tracking. Pure clinical privacy.",
  },
  {
    target: 24,
    decimals: 0,
    suffix: " / 7",
    label: "On-Demand Care Access",
    detail: "Virtual consultations and health record vault access around the clock.",
  },
];

export function Stats() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const countersRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      STATS.forEach((stat, index) => {
        const el = countersRef.current[index];
        if (!el) return;

        const obj = { val: 0 };
        gsap.to(obj, {
          val: stat.target,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
          onUpdate: () => {
            const formatted = stat.decimals > 0 ? obj.val.toFixed(stat.decimals) : Math.round(obj.val).toString();
            el.textContent = `${stat.prefix || ""}${formatted}${stat.suffix || ""}`;
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 bg-[#0A0F0D] border-b border-white/10 px-4 sm:px-6 lg:px-8 py-14 sm:py-16 text-[#F5F3EE]"
      aria-label="Clinical Metrics and Platform Integrity"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {STATS.map((stat, idx) => (
            <div
              key={stat.label}
              className="flex flex-col justify-between border-l border-white/10 pl-5 sm:pl-6"
            >
              <div>
                <span
                  ref={(el) => {
                    countersRef.current[idx] = el;
                  }}
                  className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F5F3EE] tracking-tight tabular-nums"
                >
                  {stat.prefix || ""}0{stat.suffix || ""}
                </span>
                <p className="mt-2 text-xs sm:text-sm font-semibold text-emerald-300">
                  {stat.label}
                </p>
              </div>
              <p className="mt-2 text-[11px] sm:text-xs text-white/50 leading-relaxed font-sans">
                {stat.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
