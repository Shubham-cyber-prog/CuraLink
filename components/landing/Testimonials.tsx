import { Quote } from "lucide-react";
import { FadeIn } from "./FadeIn";

const TESTIMONIALS = [
  {
    quote:
      "I described a lingering cough at 11pm and was talking to a GP before midnight. The whole flow felt calm, not clinical.",
    name: "Priya S.",
    role: "Patient · Bengaluru",
  },
  {
    quote:
      "Booking used to mean a phone tree. Now I pick a slot, pay later, and keep the visit notes in one place.",
    name: "Marcus T.",
    role: "Patient · Chicago",
  },
  {
    quote:
      "Placeholder quote from a clinician. We’ll replace these with verified reviews once the first cohort is live.",
    name: "Dr. Amara Rao",
    role: "Family medicine · coming soon",
  },
] as const;

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="px-6 py-20 sm:py-24"
      aria-labelledby="testimonials-heading"
    >
      <FadeIn className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
            Stories
          </p>
          <h2
            id="testimonials-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl"
          >
            Care that feels human
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Sample stories for layout. Real reviews will replace these placeholders.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <figure
              key={item.name}
              className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <Quote className="h-5 w-5 text-teal-600" aria-hidden="true" />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">
                {item.quote}
              </blockquote>
              <figcaption className="mt-6 border-t border-slate-100 pt-4">
                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">{item.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
