"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeartPulse } from "lucide-react";
import { DoctorMobileMenuButton, DoctorSidebar } from "@/components/layout/DoctorSidebar";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(async (response) => {
      if (!response.ok) return router.replace("/login");
      const { user } = await response.json() as { user: { role: string } };
      if (user.role !== "DOCTOR") return router.replace("/dashboard");
      setAllowed(true);
    }).catch(() => router.replace("/login"));
  }, [router]);

  if (!allowed) return <div className="flex min-h-screen items-center justify-center bg-background"><div className="flex flex-col items-center gap-3 text-sm text-slate-500"><HeartPulse className="h-8 w-8 animate-pulse text-cyan-600" />Loading your doctor portal…</div></div>;
  return <div className="min-h-screen bg-background"><DoctorSidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} /><div className="relative z-10 flex min-h-screen flex-col lg:pl-[260px]"><header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur lg:hidden"><DoctorMobileMenuButton onClick={() => setSidebarOpen(true)} /><span className="text-sm font-semibold text-slate-700">CuraLink Doctor</span></header><main className="flex-1 px-4 py-8 sm:px-6 lg:px-12"><div className="mx-auto max-w-[1400px]">{children}</div></main></div></div>;
}
