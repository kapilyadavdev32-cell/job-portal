import { Link } from "react-router-dom";
import { useState } from "react";
import { Building2, CheckCircle2, Globe2, MapPin } from "lucide-react";

function CompanyCard({ company }) {
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);
  const id = company._id || company.id;
  const logoUrl = typeof company.logo === "string" ? company.logo : company.logo?.url;
  const initials = (company.name || "CO")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  const inner = (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-700">
          {logoUrl && !logoLoadFailed ? (
            <img
              alt={company.name || "Company logo"}
              className="h-full w-full rounded-xl object-cover"
              onError={() => setLogoLoadFailed(true)}
              src={logoUrl}
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0">
          <h3 className="line-clamp-1 text-lg font-semibold text-slate-900 transition group-hover:text-blue-700">
            {company.name || "Unnamed company"}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{company.location || "Location unavailable"}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
            company.isVerified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {company.isVerified ? "Verified" : "Pending verification"}
        </span>
        {company.website ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            <Globe2 className="h-3.5 w-3.5" />
            Website
          </span>
        ) : null}
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
        {company.description
          ? `${String(company.description).slice(0, 120)}${String(company.description).length > 120 ? "…" : ""}`
          : "Company profile from the directory."}
      </p>

      <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-blue-700">
        <Building2 className="h-4 w-4" />
        View company profile
      </div>
    </article>
  );

  if (id) {
    return (
      <Link className="block" to={`/companies/${id}`}>
        {inner}
      </Link>
    );
  }

  return inner;
}

export { CompanyCard };
