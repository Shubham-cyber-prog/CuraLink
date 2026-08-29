import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Stories", href: "/#testimonials" },
      { label: "For doctors", href: "/#for-doctors" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Get started", href: "/register" },
      { label: "Contact", href: "/#for-doctors" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/#security" },
      { label: "Terms", href: "/#security" },
      { label: "Security", href: "/#security" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white px-6 py-14">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            Intelligent telehealth for patients and licensed clinicians — calm, precise, and
            available when care can&apos;t wait.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-6xl border-t border-slate-100 pt-8">
        <p className="max-w-3xl text-xs leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-500">Medical disclaimer. </span>
          CuraLink&apos;s AI provides preliminary informational guidance only and does not constitute a
          medical diagnosis. Always consult a licensed healthcare professional for medical advice,
          diagnosis, or treatment. In an emergency, call local emergency services immediately.
        </p>
        <p className="mt-4 text-xs text-slate-400">
          &copy; {new Date().getFullYear()} CuraLink. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
