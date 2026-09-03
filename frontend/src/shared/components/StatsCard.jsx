const toneMap = {
  positive: "border-blue-100 bg-blue-50/60",
  warning: "border-amber-100 bg-amber-50/70",
  danger: "border-rose-100 bg-rose-50/70",
};

function StatsCard({ title, value, description, tone = "positive" }) {
  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${toneMap[tone] || toneMap.positive}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-extrabold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </article>
  );
}

export { StatsCard };
