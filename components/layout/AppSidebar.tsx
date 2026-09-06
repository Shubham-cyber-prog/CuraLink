"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Stethoscope,
  Calendar,
  Bot,
  FileText,
  MessageSquare,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  X,
  User,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface AppSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const PRIMARY_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <Home className="h-4 w-4" aria-hidden="true" />,
  },
  {
    label: "Find Doctors",
    href: "/find-doctor",
    icon: <Stethoscope className="h-4 w-4" aria-hidden="true" />,
  },
  {
    label: "Appointments",
    href: "/appointments",
    icon: <Calendar className="h-4 w-4" aria-hidden="true" />,
  },
  {
    label: "AI Symptom Checker",
    href: "/symptom-checker",
    icon: <Bot className="h-4 w-4" aria-hidden="true" />,
  },
  {
    label: "Medical Records",
    href: "/records",
    icon: <FileText className="h-4 w-4" aria-hidden="true" />,
  },
];

const COMMUNICATION_NAV: NavItem[] = [
  {
    label: "Messages",
    href: "/messages",
    icon: <MessageSquare className="h-4 w-4" aria-hidden="true" />,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: <Bell className="h-4 w-4" aria-hidden="true" />,
  },
];

const ACCOUNT_NAV: NavItem[] = [
  {
    label: "Settings",
    href: "/profile",
    icon: <Settings className="h-4 w-4" aria-hidden="true" />,
  },
  {
    label: "Help & Support",
    href: "/help",
    icon: <HelpCircle className="h-4 w-4" aria-hidden="true" />,
  },
];

export function AppSidebar({ mobileOpen, onMobileClose }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("Subham Nayak");
  const [userEmail, setUserEmail] = useState("sn343555@gmail.com");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token =
          localStorage.getItem("curalink_token") ||
          sessionStorage.getItem("curalink_token");
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (data.success && data.data) {
          setUserName(data.data.name || "Subham Nayak");
          setUserEmail(data.data.email || "sn343555@gmail.com");
        }
      } catch (err) {
        console.error("Failed to fetch sidebar user profile:", err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("curalink_token");
    sessionStorage.removeItem("curalink_token");
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard" && pathname === "/dashboard") return true;
    if (href !== "/dashboard" && pathname.startsWith(href)) return true;
    return false;
  };

  const renderNavGroup = (items: NavItem[]) => (
    <div className="space-y-0.5">
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onMobileClose}
            id={`sidebar-nav-${item.label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-teal-50 text-[#0F9D8C] font-semibold"
                : "text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center transition-colors ${
                active
                  ? "text-[#0F9D8C]"
                  : "text-slate-400 group-hover:text-slate-600"
              }`}
            >
              {item.icon}
            </span>
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between py-4 px-3 bg-white">
      <div>
        {/* Top Header: Logo & Mobile Close */}
        <div className="flex items-center justify-between px-3 pb-5 pt-1">
          <Logo href="/dashboard" />
          <button
            onClick={onMobileClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav Sections */}
        <nav className="space-y-4" aria-label="Sidebar navigation">
          {renderNavGroup(PRIMARY_NAV)}
          <hr className="border-[#E2E8F0] my-2" />
          {renderNavGroup(COMMUNICATION_NAV)}
          <hr className="border-[#E2E8F0] my-2" />
          {renderNavGroup(ACCOUNT_NAV)}
        </nav>
      </div>

      {/* Footer: Compact profile card & logout */}
      <div className="border-t border-[#E2E8F0] pt-3 px-1">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-[#0F9D8C]">
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-[#0F172A]">
              {userName}
            </p>
            <p className="truncate text-[11px] text-[#64748B]">{userEmail}</p>
          </div>
        </div>
        <button
          id="sidebar-logout-btn"
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Minimal, width ~230px) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[230px] flex-col border-r border-[#E2E8F0] bg-white md:flex">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[260px] bg-white shadow-xl md:hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}

{/* Mobile Bottom Navigation Bar (below 768px) */}
export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/dashboard", icon: <Home className="h-5 w-5" /> },
    {
      label: "Doctors",
      href: "/find-doctor",
      icon: <Stethoscope className="h-5 w-5" />,
    },
    {
      label: "Bookings",
      href: "/appointments",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      label: "AI Checker",
      href: "/symptom-checker",
      icon: <Bot className="h-5 w-5" />,
    },
    { label: "Profile", href: "/profile", icon: <User className="h-5 w-5" /> },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 flex h-16 items-center justify-around border-t border-[#E2E8F0] bg-white px-2 shadow-lg md:hidden">
      {navItems.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-w-[44px] min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-medium transition-colors ${
              active
                ? "text-[#0F9D8C] font-semibold"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
