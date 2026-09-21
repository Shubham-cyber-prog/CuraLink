"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Stories", href: "/#testimonials" },
  { label: "Security", href: "/#security" },
  { label: "For doctors", href: "/#for-doctors" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white dark:focus:bg-[#151B2E] focus:px-3 focus:py-2 focus:text-sm focus:shadow-lg"
      >
        Skip to content
      </a>
      <div
        className={`mx-auto max-w-6xl px-4 transition-all duration-300 sm:px-6 ${
          scrolled ? "pt-2" : "pt-4"
        }`}
      >
        <div
          className={`flex h-14 items-center justify-between rounded-2xl px-4 transition-all duration-300 ${
            scrolled || open
              ? "border border-slate-200/80 dark:border-[#263049] bg-white/85 dark:bg-[#151B2E]/90 shadow-sm shadow-slate-900/5 backdrop-blur-xl"
              : "border border-transparent bg-transparent"
          }`}
        >
          <Logo />

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target="_self"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100/80 dark:hover:bg-[#1C2338] hover:text-slate-900 dark:hover:text-[#F1F5F9]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <Link
              href="/login"
              target="_self"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Log in
            </Link>
            <Link
              href="/register"
              target="_self"
              className={buttonVariants({ size: "sm" })}
            >
              Get started
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-[#1C2338] md:hidden cursor-pointer"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div
          id={menuId}
          className="mx-4 mt-2 rounded-2xl border border-slate-200 dark:border-[#263049] bg-white dark:bg-[#151B2E] p-4 shadow-xl md:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target="_self"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-[#1C2338]"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-[#263049] pt-3">
              <Link
                href="/login"
                target="_self"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center")}
              >
                Log in
              </Link>
              <Link
                href="/register"
                target="_self"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants(), "w-full justify-center")}
              >
                Get started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
