"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Stethoscope, Calendar, Bot, User } from "lucide-react";
import { motion } from "framer-motion";

export function FloatingMobileNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Doctors", href: "/find-doctor", icon: Stethoscope },
    { label: "AI Check", href: "/symptom-checker", icon: Bot, isCenter: true },
    { label: "Visits", href: "/appointments", icon: Calendar },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-4 inset-x-4 z-40 max-w-[420px] mx-auto md:hidden">
      <div className="relative flex h-16 items-center justify-around rounded-full bg-white px-2 border border-[#E2E8F0] shadow-xl shadow-slate-900/10 backdrop-blur-md">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                id="mobile-nav-ai-check"
                className="relative -mt-7 flex flex-col items-center justify-center group"
              >
                <div
                  className={`flex h-13 w-13 items-center justify-center rounded-full bg-[#0F9D8C] text-white shadow-lg shadow-[#0F9D8C]/40 border-4 border-white transition-transform duration-200 group-active:scale-95 ${
                    isActive ? "ring-2 ring-[#0F9D8C]/30" : ""
                  }`}
                >
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <span
                  className={`mt-1 text-[10px] font-bold transition-colors ${
                    isActive ? "text-[#0F9D8C]" : "text-[#64748B]"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              id={`mobile-nav-${item.label.toLowerCase()}`}
              className="relative flex flex-1 flex-col items-center justify-center py-1 text-center group"
            >
              <div className="relative flex flex-col items-center">
                <Icon
                  className={`h-5 w-5 transition-colors duration-150 ${
                    isActive ? "text-[#0F9D8C]" : "text-[#64748B] group-hover:text-slate-900"
                  }`}
                />
                <span
                  className={`mt-0.5 text-[10px] font-medium transition-colors duration-150 ${
                    isActive ? "text-[#0F9D8C] font-semibold" : "text-[#64748B]"
                  }`}
                >
                  {item.label}
                </span>

                {/* Animated active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="web-active-nav-dot"
                    className="absolute -bottom-1 h-1 w-1 rounded-full bg-[#0F9D8C]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
