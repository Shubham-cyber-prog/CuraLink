import { Bot, Circle, ShieldCheck } from "lucide-react";

interface ProductMockProps {
  reduceMotion?: boolean;
}

export function ProductMock({ reduceMotion = false }: ProductMockProps) {
  return (
    <div
      className={`relative mx-auto w-full max-w-[540px] ${
        reduceMotion ? "" : "animate-[float_8s_ease-in-out_infinite]"
      }`}
      aria-hidden="true"
    >
      <div className="absolute -inset-8 rounded-[2.5rem] bg-teal-400/15 dark:bg-teal-400/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-white/70 dark:border-[#1e293b] bg-white/90 dark:bg-[#0f172a]/90 shadow-[0_24px_80px_-24px_rgba(15,157,140,0.30)] dark:shadow-[0_24px_80px_-24px_rgba(20,184,166,0.15)] ring-1 ring-slate-900/5 dark:ring-white/5 backdrop-blur">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#1e293b] bg-slate-50/80 dark:bg-[#0f172a] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          <span className="ml-3 rounded-md bg-white dark:bg-[#1e293b] px-2.5 py-0.5 text-[11px] font-medium text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700">
            app.curalink.com/consult
          </span>
        </div>

        <div className="grid grid-cols-[88px_1fr] sm:grid-cols-[112px_1fr]">
          <aside className="space-y-3 border-r border-slate-100 dark:border-[#1e293b] bg-slate-50/70 dark:bg-[#0f172a]/70 p-3">
            {["Triage", "Doctors", "Chat", "Records"].map((item, i) => (
              <div
                key={item}
                className={`rounded-lg px-2 py-1.5 text-[11px] font-medium ${
                  i === 0 ? "bg-teal-600 text-white shadow-sm" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {item}
              </div>
            ))}
          </aside>

          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  AI symptom check
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Today&apos;s consult</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-100 dark:ring-emerald-800/40">
                <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
                Live
              </span>
            </div>

            <div className="space-y-2">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-teal-600 px-3 py-2 text-[12px] leading-relaxed text-white">
                Mild headache since this morning, some pressure behind my eyes.
              </div>
              <div className="flex gap-2">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-2xl rounded-bl-md bg-slate-100 dark:bg-[#1e293b] px-3 py-2 text-[12px] leading-relaxed text-slate-700 dark:text-slate-300">
                  Sounds like tension-type headache. I&apos;ll match you with a GP available in 4 minutes.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0f172a] p-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950/40 text-xs font-bold text-teal-800 dark:text-teal-300">
                  AR
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Dr. Amara Rao</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Family medicine · 4.9</p>
                </div>
              </div>
              <span className="rounded-lg bg-white dark:bg-[#1e293b] px-2 py-1 text-[11px] font-semibold text-teal-700 dark:text-teal-400 ring-1 ring-slate-200 dark:ring-slate-700">
                Book 2:15 PM
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              Encrypted · HIPAA-aligned workspace
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
