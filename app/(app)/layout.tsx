"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeartPulse } from "lucide-react";
import { motion } from "framer-motion";
import { AppSidebar, MobileMenuButton } from "@/components/layout/AppSidebar";

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth guard — shared for ALL pages inside (app)
  useEffect(() => {
    async function verifyAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/login");
          return;
        }
        const data = await res.json() as { user: { role: string } };
        if (data.user.role === "DOCTOR") {
          router.replace("/doctor-dashboard");
          return;
        }
        setIsAuthed(true);
      } catch {
        router.replace("/login");
      }
    }
    verifyAuth();
  }, [router]);

  // Loading state while auth is being verified
  if (!isAuthed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-3"
        >
          <HeartPulse className="h-8 w-8 text-teal-600" />
          <span className="text-sm text-slate-500">
            Loading your dashboard…
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle ambient blobs — shared across all app pages */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-16 h-96 w-96 rounded-full bg-teal-300/15 blur-3xl" />
        <div className="absolute right-0 top-64 h-80 w-80 rounded-full bg-cyan-200/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-teal-100/20 blur-3xl" />
      </div>

      {/* Sidebar */}
      <AppSidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Main content area — offset by sidebar width on desktop */}
      <div className="relative z-10 flex min-h-screen flex-col lg:pl-[260px]">
        {/* Mobile top bar with hamburger */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur lg:hidden">
          <MobileMenuButton onClick={() => setSidebarOpen(true)} />
          <span className="text-sm font-semibold text-slate-700">
            CuraLink
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-12">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
