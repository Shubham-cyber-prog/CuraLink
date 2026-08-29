import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductMock } from "./ProductMock";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-28 sm:pt-32 lg:pb-28" aria-label="Hero">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.035]" />
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-teal-300/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-xl animate-[fade-up_0.7s_cubic-bezier(0.16,1,0.3,1)_both]">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-white/70 px-3 py-1 text-xs font-medium text-teal-800 shadow-sm backdrop-blur">
            <Shield className="h-3.5 w-3.5" aria-hidden="true" />
            HIPAA-aligned care, built for real clinics
          </div>

          <h1 className="mt-6 text-4xl font-normal leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem]">
            Care that feels{" "}
            <span className="font-display italic text-teal-800">calm</span>
            <span className="text-slate-400">,</span>
            <br />
            not like a waiting room.
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
            Describe symptoms in plain language, get AI-guided triage, and sit down with a licensed
            doctor in minutes — from a phone or a desk.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild className="shadow-lg shadow-teal-700/20 hover:shadow-xl">
              <Link href="/register">
                Start a visit
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="#how-it-works">See the flow</Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            No insurance required · Average wait under 5 minutes
          </p>
        </div>

        <div className="animate-[fade-up_0.85s_cubic-bezier(0.16,1,0.3,1)_both]">
          <ProductMock />
        </div>
      </div>
    </section>
  );
}
