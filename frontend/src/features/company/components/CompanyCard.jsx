import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, CheckCircle2, Globe, MapPin, Briefcase, ArrowRight } from "lucide-react";

function CompanyCard({ company, openJobsCount = 0 }) {
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);
  const id = company._id || company.id;
  const logoUrl = typeof company.logo === "string" ? company.logo : company.logo?.url;
  const initials = (company.name || "CO")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  const body = (
    <article className="group flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl">
      <div>
        {/* LOGO & TITLE */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 font-extrabold text-lg border border-blue-100 shrink-0">
            {logoUrl && !logoLoadFailed ? (
              <img
                alt={company.name || "Company logo"}
                className="h-full w-full rounded-2xl object-cover"
                onError={() => setLogoLoadFailed(true)}
                src={logoUrl}
              />
            ) : (
              initials || <Building2 className="h-6 w-6" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-1 text-lg font-bold text-slate-900 transition group-hover:text-blue-600">
              {company.name || "Company Name"}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span className="truncate">{company.location || "Headquarters TBD"}</span>
            </p>
          </div>
        </div>

        {/* VERIFICATION & WEBSITE BADGES */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold ${
              company.isVerified
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-amber-50 text-amber-700 border border-amber-100"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {company.isVerified ? "Verified Employer" : "Pending Verification"}
          </span>

          {company.website && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-600">
              <Globe className="h-3.5 w-3.5" /> Website
            </span>
          )}
        </div>

        {/* DESCRIPTION */}
        <p className="mt-4 line-clamp-3 text-xs leading-5 text-slate-600 font-medium">
          {company.description || "Leading organization actively hiring talent. Click to view company overview and open positions."}
        </p>
      </div>

      {/* FOOTER ACTION & OPEN JOBS COUNT */}
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          <Briefcase className="h-3.5 w-3.5" />
          {openJobsCount} Open Jobs
        </span>

        {id && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:text-blue-600">
            View Company <ArrowRight className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </article>
  );

  if (id) {
    return (
      <Link className="block h-full rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500" to={`/companies/${id}`}>
        {body}
      </Link>
    );
  }

  return body;
}

export { CompanyCard };
