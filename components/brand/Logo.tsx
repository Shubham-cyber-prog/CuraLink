import Link from "next/link";
import { HeartPulse } from "lucide-react";

interface LogoProps {
  href?: string;
  className?: string;
  markClassName?: string;
  inverted?: boolean;
}

export function Logo({
  href = "/",
  className = "",
  markClassName = "",
  inverted = false,
}: LogoProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 ${className}`}
      aria-label="CuraLink home"
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
          inverted
            ? "bg-white/10 text-teal-300 ring-1 ring-white/15"
            : "bg-teal-600 text-white shadow-sm shadow-teal-600/25"
        } ${markClassName}`}
      >
        <HeartPulse className="h-4 w-4" aria-hidden="true" />
      </span>
      <span
        className={`text-[17px] font-semibold tracking-tight ${
          inverted ? "text-white" : "text-slate-900"
        }`}
      >
        CuraLink
      </span>
    </Link>
  );
}
