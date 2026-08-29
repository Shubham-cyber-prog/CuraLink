import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "./FadeIn";

export function ClosingCta() {
  return (
    <section className="px-6 pb-24 pt-8" aria-labelledby="cta-heading">
      <FadeIn>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-teal-800 via-teal-900 to-slate-950 px-8 py-16 text-center text-white sm:px-16">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
          <h2 id="cta-heading" className="relative text-3xl tracking-tight sm:text-4xl">
            Your health doesn&apos;t keep office hours.
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-sm leading-relaxed text-teal-100/80">
            Create an account in minutes. Talk to a licensed professional when you need one — not
            when a queue says so.
          </p>
          <Link
            href="/register"
            className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-teal-900 shadow-lg transition-transform hover:scale-[1.02]"
          >
            Create your free account
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="relative mt-4 text-xs text-teal-200/70">No credit card · Cancel anytime</p>
        </div>
      </FadeIn>
    </section>
  );
}
