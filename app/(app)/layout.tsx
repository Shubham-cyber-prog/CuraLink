"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeartPulse } from "lucide-react";
import { motion } from "framer-motion";
import { AppSidebar, MobileBottomNav } from "@/components/layout/AppSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { PageTransition } from "@/components/layout/PageTransition";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#0B1120]">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-3"
        >
          <HeartPulse className="h-8 w-8 text-[#0F9D8C] dark:text-[#14B8A6]" />
          <span className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
            Loading your health portal...
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F1F5F9] transition-colors duration-200">
      {/* Sidebar (Desktop & Mobile Drawer) */}
      <AppSidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Container — Offset by sidebar width on desktop */}
      <div className="relative z-10 flex min-h-screen flex-col md:pl-[230px]">
        {/* Top Navbar */}
        <TopNavbar onMobileMenuToggle={() => setSidebarOpen(true)} />

        {/* Page Content (with mobile bottom padding for FloatingMobileNav) */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 pb-28 md:pb-8">
          <div className="mx-auto max-w-[1320px]">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <MobileBottomNav />
    </div>
  );
}
