import { Link } from "react-router-dom";

function CompanyCard({ company }) {
  const id = company._id || company.id;
  const inner = (
    <>
      <div>
        <h3>{company.name || "Unnamed company"}</h3>
        <p>{company.location || "Location unavailable"}</p>
      </div>
      <div className="meta-list">
        <span className="meta-pill">
          {company.isVerified ? "Verified" : "Pending verification"}
        </span>
        {company.website ? <span className="meta-pill">{company.website}</span> : null}
      </div>
      <p className="muted">
        {company.description
          ? `${String(company.description).slice(0, 120)}${String(company.description).length > 120 ? "…" : ""}`
          : "Company profile from the directory."}
      </p>
    </>
  );

  if (id) {
    return (
      <Link className="company-card company-card-link" to={`/companies/${id}`}>
        {inner}
      </Link>
    );
  }

  return <article className="company-card">{inner}</article>;
}

export { CompanyCard };
