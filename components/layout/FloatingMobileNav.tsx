"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Stethoscope, Calendar, MessageSquare, User } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export function FloatingMobileNav() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const navItems = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Doctors", href: "/find-doctor", icon: Stethoscope },
    { label: "Visits", href: "/appointments", icon: Calendar },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-[#0F172A]/95 border-t border-slate-200/90 dark:border-slate-800/90 backdrop-blur-md pb-safe">
      <nav className="flex h-16 items-center justify-around px-2 max-w-md mx-auto" aria-label="Mobile navigation">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          const Icon = item.icon;

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
                transition={{ duration: 0.12 }}
                className="relative flex flex-col items-center"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                    isActive
                      ? "text-[#0D9488] bg-teal-50 dark:bg-teal-950/60 dark:text-[#14B8A6]"
                      : "text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`mt-0.5 text-[10px] font-medium transition-colors ${
                    isActive
                      ? "text-[#0D9488] dark:text-[#14B8A6] font-semibold"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {item.label}
                </span>

                {/* Subtle active underline indicator */}
                {isActive && (
                  <motion.div
                    layoutId="mobile-active-nav-dot"
                    className="absolute -bottom-1 h-1 w-3 rounded-full bg-[#0D9488] dark:bg-[#14B8A6]"
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { duration: 0.2, ease: "easeOut" }
                    }
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
