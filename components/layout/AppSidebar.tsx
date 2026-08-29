"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Stethoscope,
  CalendarDays,
  User,
  LogOut,
  ShieldCheck,
  X,
  Menu,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface AppSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-[18px] w-[18px]" aria-hidden="true" />,
  },
  {
    label: "Find a Doctor",
    href: "/find-doctor",
    icon: <Stethoscope className="h-[18px] w-[18px]" aria-hidden="true" />,
  },
  {
    label: "My Appointments",
    href: "/appointments",
    icon: <CalendarDays className="h-[18px] w-[18px]" aria-hidden="true" />,
  },
  {
    label: "My Profile",
    href: "/profile",
    icon: <User className="h-[18px] w-[18px]" aria-hidden="true" />,
  },
];

// TODO: Replace with real user data from auth context / API
const MOCK_USER_NAME = "Alex Johnson";
const MOCK_USER_EMAIL = "alex@example.com";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AppSidebar({ mobileOpen, onMobileClose }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("curalink_token");
    sessionStorage.removeItem("curalink_token");
    router.push("/login");
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* ---- Top: Logo + badge ---- */}
      <div className="flex items-center justify-between px-5 py-5">
        <Logo href="/dashboard" />
        {/* Close button — mobile only */}
        <button
          onClick={onMobileClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-5 mb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/80 bg-teal-50 px-2.5 py-0.5 text-[11px] font-medium text-teal-700">
          <ShieldCheck className="h-3 w-3" aria-hidden="true" />
          HIPAA-aligned
        </span>
      </div>

      {/* ---- Nav links ---- */}
      <nav className="flex-1 space-y-1 px-3" aria-label="Dashboard navigation">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-teal-50 text-teal-800 shadow-sm shadow-teal-100/60"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  active
                    ? "bg-teal-600 text-white shadow-sm shadow-teal-600/25"
                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                }`}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ---- Bottom: User info + logout ---- */}
      <div className="border-t border-slate-200/70 px-4 py-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <User className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">
              {MOCK_USER_NAME}
            </p>
            <p className="truncate text-xs text-slate-500">{MOCK_USER_EMAIL}</p>
          </div>
        </div>
        <button
          id="sidebar-logout-btn"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ---- Desktop sidebar ---- */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-slate-200/70 bg-white/90 backdrop-blur-sm lg:flex">
        {sidebarContent}
      </aside>

      {/* ---- Mobile overlay sidebar ---- */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 z-50 w-[280px] bg-white shadow-xl shadow-slate-900/10 lg:hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Mobile toggle button (exported for use in the layout)
// ---------------------------------------------------------------------------

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 lg:hidden"
      aria-label="Open navigation menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
