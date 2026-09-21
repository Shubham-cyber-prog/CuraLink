"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { FloatingMobileNav } from "@/components/layout/FloatingMobileNav";
import { PageTransition } from "@/components/layout/PageTransition";
import { AIChatWidget } from "@/components/ai/AIChatWidget";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Not auth");
        if (mounted) setIsAuthed(true);
      } catch (err) {
        if (mounted) router.replace("/login");
      }
    };
    checkAuth();
    return () => { mounted = false; };
  }, [router]);

  if (!isAuthed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#070B14]">
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-teal-500/20 blur-lg"
            />
            <motion.div
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full h-full"
            >
              <Image src="/logo.png" alt="CuraLink" width={56} height={56} className="w-full h-full object-contain drop-shadow" priority />
            </motion.div>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-base font-semibold text-slate-900 dark:text-white">
              Cura<span className="text-teal-600 dark:text-teal-400">Link</span>
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Loading your health portal...
            </span>
          </div>
          <div className="w-32 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1/2 h-full bg-gradient-to-r from-transparent via-teal-500 to-transparent rounded-full"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F1F5F9] transition-colors duration-200">
      {/* Top Navbar — Full Width, No Sidebar */}
      <TopNavbar />

      {/* Main Content Container */}
      <div className="relative z-10 flex min-h-[calc(100vh-64px)] flex-col">
        {/* Page Content (with mobile bottom padding for FloatingMobileNav) */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 pb-28 md:pb-12">
          <div className="mx-auto max-w-[1280px]">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <FloatingMobileNav />

      {/* Global AI Health Assistant Widget */}
      <AIChatWidget />
    </div>
  );
}
