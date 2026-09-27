import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const FOOTER_COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Capabilities", href: "/#capabilities" },
      { label: "Find Physicians", href: "/find-doctor" },
      { label: "Clinical Intake", href: "/symptom-checker" },
      { label: "Records Vault", href: "/records" },
    ],
  },
  {
    title: "Patients",
    links: [
      { label: "Book Consultation", href: "/find-doctor" },
      { label: "Scheduled Visits", href: "/appointments" },
      { label: "Patient FAQ", href: "/#how-it-works" },
      { label: "Emergency Notice", href: "/#emergency" },
    ],
  },
  {
    title: "Practitioners",
    links: [
      { label: "For Clinicians", href: "/#for-doctors" },
      { label: "Apply as Doctor", href: "/register?role=doctor" },
      { label: "Credential Verification", href: "/#for-doctors" },
      { label: "Clinical Standards", href: "/#security" },
    ],
  },
  {
    title: "Governance",
    links: [
      { label: "Security Architecture", href: "/#security" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Cancellation Policy", href: "/cancellation-policy" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#0A0F0D] text-[#F5F3EE] px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 lg:gap-14 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#085041] border border-emerald-500/30 text-emerald-300">
                <span className="font-serif italic font-bold text-sm">C</span>
              </div>
              <span className="font-sans font-semibold tracking-tight text-white text-base">
                Cura<span className="text-emerald-400 font-normal">Link</span>
              </span>
            </Link>
            <p className="text-xs text-white/50 leading-relaxed font-sans max-w-xs">
              A clinical-grade telehealth architecture connecting patients with verified medical practitioners for calm, dignified care.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>TLS 1.3 · ZERO TRACKERS</span>
            </div>
          </div>

          {/* Navigation Columns */}
          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="font-mono text-xs uppercase tracking-widest text-white/80 font-semibold mb-4">
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-white/40">
          <p className="max-w-3xl leading-relaxed font-sans">
            <strong className="text-white/60 font-medium">Clinical Disclaimer: </strong>
            CuraLink provides medical scheduling and preliminary clinical triage telemetry to connect you with licensed physicians. It does not replace direct physician diagnosis or emergency medical care. If you are experiencing a medical emergency, please dial your local emergency services immediately.
          </p>
          <p className="font-mono text-[11px] shrink-0 text-white/40">
            &copy; {new Date().getFullYear()} CuraLink Healthcare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
