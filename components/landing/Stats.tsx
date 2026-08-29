const STATS = [
  { value: "10k+", label: "Patients served" },
  { value: "500+", label: "Licensed clinicians" },
  { value: "<5 min", label: "Typical wait" },
  { value: "24/7", label: "AI triage" },
];

export function Stats() {
  return (
    <section className="px-6" aria-label="Platform statistics">
      <div className="mx-auto grid max-w-6xl grid-cols-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm sm:grid-cols-4">
        {STATS.map((item, i) => (
          <div
            key={item.label}
            className={`px-6 py-8 text-center ${i !== 0 ? "border-t border-slate-100 sm:border-l sm:border-t-0" : ""}`}
          >
            <p className="font-display text-3xl text-slate-900">{item.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
