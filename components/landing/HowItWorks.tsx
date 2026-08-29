import { FadeIn } from "./FadeIn";

const STEPS = [
  {
    step: 1,
    title: "Describe your symptoms",
    description:
      "Tell our AI what you’re experiencing — in your own words, any time of day. No medical jargon required.",
  },
  {
    step: 2,
    title: "Get matched with a doctor",
    description:
      "Based on your symptoms and preferences, CuraLink surfaces licensed specialists who are available now.",
  },
  {
    step: 3,
    title: "Chat and book instantly",
    description:
      "Confirm a slot, join a secure consultation, and receive professional guidance within minutes.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-white/60 px-6 py-20 sm:py-24"
      aria-labelledby="steps-heading"
    >
      <FadeIn className="mx-auto max-w-6xl" delayMs={80}>
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
            The process
          </p>
          <h2
            id="steps-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl"
          >
            Three steps to better care
          </h2>
        </div>

        <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((item) => (
            <li key={item.step} className="flex flex-col gap-3">
              <span aria-hidden="true" className="font-display text-5xl text-teal-200">
                {String(item.step).padStart(2, "0")}
              </span>
              <h3 className="text-base font-semibold tracking-tight text-slate-900">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{item.description}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 hidden justify-center md:flex" aria-hidden="true">
          <div className="h-px w-2/3 bg-gradient-to-r from-transparent via-teal-200 to-transparent" />
        </div>
      </FadeIn>
    </section>
  );
}
