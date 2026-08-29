import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "./FadeIn";

export function Cta() {
  return (
    <section className="px-6 pb-24 pt-8 sm:pb-28" aria-labelledby="cta-heading">
      <FadeIn className="mx-auto max-w-2xl text-center" delayMs={100}>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-700">
          <Clock className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2
          id="cta-heading"
          className="mt-6 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl"
        >
          Your health can&apos;t wait.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-slate-500">
          Join patients who booked a licensed consult in minutes — no insurance required to get started.
        </p>
        <div className="mt-8 flex justify-center">
          <Button size="lg" asChild>
            <Link href="/register">
              Create your free account
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-slate-500">No credit card required · Cancel anytime</p>
      </FadeIn>
    </section>
  );
}
