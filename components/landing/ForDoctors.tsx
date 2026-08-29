import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "./FadeIn";

export function ForDoctors() {
  return (
    <section id="for-doctors" className="px-6 py-16" aria-labelledby="doctors-heading">
      <FadeIn>
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 rounded-2xl border border-slate-200/80 bg-white px-8 py-10 shadow-sm md:flex-row md:items-center">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Clinicians</p>
            <h2 id="doctors-heading" className="mt-3 text-2xl tracking-tight text-slate-900 sm:text-3xl">
              Practice on a calendar you control
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Join a network that sends you prepared patients, not empty inboxes. CuraLink is built
              for licensed doctors who want telehealth without the noise.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Apply as a doctor
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}
