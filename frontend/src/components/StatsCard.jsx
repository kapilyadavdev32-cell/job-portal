function StatsCard({ title, value, description, tone = "positive" }) {
  return (
    <article className={`card ${tone}`}>
      <p className="surface-label">{title}</p>
      <p className="value">{value}</p>
      <p className="muted">{description}</p>
    </article>
  );
}

export { StatsCard };
