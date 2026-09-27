"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl opacity-0 ${className}`}
        aria-hidden="true"
      >
        <span className="sr-only">Toggle theme placeholder</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white transition-colors duration-150 cursor-pointer ${className}`}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle dark mode"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform duration-250 ease-out dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform duration-250 ease-out dark:rotate-0 dark:scale-100 text-teal-300" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
