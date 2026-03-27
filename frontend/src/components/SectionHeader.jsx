function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow ? <p className="surface-label">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action || null}
    </div>
  );
}

export { SectionHeader };
