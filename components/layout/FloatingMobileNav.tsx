"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Stethoscope, Calendar, Bot, User } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export function FloatingMobileNav() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const navItems = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Doctors", href: "/find-doctor", icon: Stethoscope },
    { label: "AI Check", href: "/symptom-checker", icon: Bot, isCenter: true },
    { label: "Visits", href: "/appointments", icon: Calendar },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-4 inset-x-4 z-40 max-w-[420px] mx-auto md:hidden">
      <div className="relative flex h-16 items-center justify-around rounded-full bg-white dark:bg-[#0f172a] px-2 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/10 dark:shadow-black/50 transition-colors duration-200">
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
                target="_self"
                id="mobile-nav-ai-check"
                className="relative -mt-7 flex flex-col items-center justify-center group"
              >
                <motion.div
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={`flex h-13 w-13 items-center justify-center rounded-full bg-[#085041] dark:bg-teal-600 text-white shadow-lg shadow-teal-900/25 border-4 border-white dark:border-[#0f172a] transition-colors duration-200 ${
                    isActive ? "ring-2 ring-teal-600/40 dark:ring-teal-400/40" : ""
                  }`}
                >
                  <Bot className="h-6 w-6 text-white" />
                </motion.div>
                <span
                  className={`mt-1 text-[10px] font-bold transition-colors duration-150 ${
                    isActive ? "text-[#085041] dark:text-teal-400" : "text-[#64748B] dark:text-[#94A3B8]"
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
              target="_self"
              id={`mobile-nav-${item.label.toLowerCase()}`}
              className="relative flex flex-1 flex-col items-center justify-center py-1 text-center group"
            >
              <motion.div
                whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="relative flex flex-col items-center"
              >
                <Icon
                  className={`h-5 w-5 transition-colors duration-150 ${
                    isActive
                      ? "text-[#085041] dark:text-teal-400"
                      : "text-[#64748B] dark:text-[#94A3B8] group-hover:text-slate-900 dark:group-hover:text-[#F1F5F9]"
                  }`}
                />
                <span
                  className={`mt-0.5 text-[10px] font-medium transition-colors duration-150 ${
                    isActive
                      ? "text-[#085041] dark:text-teal-400 font-semibold"
                      : "text-[#64748B] dark:text-[#94A3B8]"
                  }`}
                >
                  {item.label}
                </span>

                {/* Smooth sliding active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="web-active-nav-indicator"
                    className="absolute -bottom-1 h-1 w-3 rounded-full bg-[#085041] dark:bg-teal-400"
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : {
                            duration: 0.25,
                            ease: [0.16, 1, 0.3, 1], // Calm, non-bouncy ease-out
                          }
                    }
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
