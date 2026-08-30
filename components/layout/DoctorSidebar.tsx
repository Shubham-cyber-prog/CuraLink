"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, ClipboardList, LayoutDashboard, LogOut, Menu, Stethoscope, UserRound, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const items = [
  { label: "Dashboard", href: "/doctor-dashboard", icon: LayoutDashboard },
  { label: "My Appointments", href: "/doctor-appointments", icon: CalendarDays },
  { label: "My Patients", href: "/doctor-appointments", icon: ClipboardList },
  { label: "My Profile", href: "/doctor-profile", icon: UserRound },
];

export function DoctorSidebar({ mobileOpen, onMobileClose }: { mobileOpen: boolean; onMobileClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = useState("Doctor");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(async (response) => {
      if (!response.ok) return;
      const { user } = await response.json() as { user: { name: string; email: string } };
      setName(user.name);
      setEmail(user.email);
    }).catch(() => undefined);
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    localStorage.removeItem("curalink_token");
    sessionStorage.removeItem("curalink_token");
    router.push("/login");
  };

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Logo href="/doctor-dashboard" />
        <button onClick={onMobileClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden" aria-label="Close sidebar"><X className="h-5 w-5" /></button>
      </div>
      <div className="mx-5 mb-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">
        <Stethoscope className="h-3.5 w-3.5" /> Doctor Portal
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Doctor navigation">
        {items.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (label === "My Patients" && pathname === "/doctor-appointments");
          return <Link key={label} href={href} onClick={onMobileClose} className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-cyan-50 text-cyan-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${active ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-500"}`}><Icon className="h-[18px] w-[18px]" /></span>{label}
          </Link>;
        })}
      </nav>
      <div className="border-t border-slate-200/70 px-4 py-4">
        <div className="mb-3 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-100 text-cyan-700"><UserRound className="h-4 w-4" /></div><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">Dr. {name.replace(/^Dr\.\s*/, "")}</p><p className="truncate text-xs text-slate-500">{email}</p></div></div>
        <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-700"><LogOut className="h-4 w-4" />Log out</button>
      </div>
    </div>
  );
  return <><aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-slate-200/70 bg-white/90 backdrop-blur-sm lg:block">{content}</aside>{mobileOpen && <><div onClick={onMobileClose} className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden" /><aside className="fixed inset-y-0 left-0 z-50 w-[280px] bg-white shadow-xl lg:hidden">{content}</aside></>}</>;
}

export function DoctorMobileMenuButton({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 lg:hidden" aria-label="Open navigation menu"><Menu className="h-5 w-5" /></button>;
}
