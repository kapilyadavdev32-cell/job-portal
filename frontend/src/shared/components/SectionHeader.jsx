function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p>
        ) : null}
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        {description ? <p className="max-w-2xl text-sm text-slate-600 md:text-base">{description}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}

export { SectionHeader };
