import { Bot, CalendarCheck, MessageCircle } from "lucide-react";
import { FadeIn } from "./FadeIn";

const FEATURES = [
  {
    icon: Bot,
    title: "AI symptom checker",
    description:
      "Describe what you’re feeling in plain language. Our AI offers informed, preliminary guidance before you speak with a doctor.",
  },
  {
    icon: CalendarCheck,
    title: "Instant doctor booking",
    description:
      "Browse verified, licensed clinicians by specialty and availability. Confirm an appointment in under a minute.",
  },
  {
    icon: MessageCircle,
    title: "Secure consultation chat",
    description:
      "Meet your doctor in a real-time, encrypted chat. Share notes or images and get professional advice from anywhere.",
  },
] as const;

export function Features() {
  return (
    <section id="features" className="px-6 py-20 sm:py-24" aria-labelledby="features-heading">
      <FadeIn className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
            What we offer
          </p>
          <h2
            id="features-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl"
          >
            Everything you need for modern care
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-500">
            Three focused tools — designed to remove friction between you and a licensed clinician.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="group flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-100 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 transition-colors duration-300 group-hover:bg-teal-100">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </FadeIn>
    </section>
  );
}
