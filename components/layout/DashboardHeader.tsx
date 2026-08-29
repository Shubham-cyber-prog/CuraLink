"use client";

import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { MotionButton } from "@/components/motion/MotionButton";
import { calmTransition } from "@/components/motion/variants";

interface DashboardHeaderProps {
  userName?: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("curalink_token");
    sessionStorage.removeItem("curalink_token");
    router.push("/login");
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={calmTransition}
      className="relative z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <Logo href="/dashboard" />
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-teal-200/80 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            HIPAA-aligned
          </span>
          {userName && (
            <span className="hidden text-sm font-medium text-slate-700 sm:block">
              {userName}
            </span>
          )}
          <MotionButton>
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </MotionButton>
        </div>
      </div>
    </motion.header>
  );
}
