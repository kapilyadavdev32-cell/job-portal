import { Link } from "react-router-dom";
import { BriefcaseBusiness, Building2, MapPin } from "lucide-react";
import { formatJobMeta } from "../../../shared/utils/formatters.js";

function JobCard({ job }) {
  const id = job._id || job.id;
  const companyName = job.companyName || job.company?.name || "Company";
  const tags = (job.skillsRequired || []).slice(0, 3);
  const salary =
    job.salaryRange?.min != null && job.salaryRange?.max != null
      ? `$${job.salaryRange.min}k - $${job.salaryRange.max}k`
      : job.salary || "Not disclosed";
  const location = job.location || (job.isRemote ? "Remote" : "Location TBD");
  const shortMeta = formatJobMeta(job).filter((item) => !String(item).includes("$"));

  const body = (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
          <BriefcaseBusiness className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-lg font-semibold text-slate-900 transition group-hover:text-blue-700">
            {job.title || "Untitled role"}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
            <Building2 className="h-4 w-4" />
            <span className="truncate">{companyName}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
          <MapPin className="h-3.5 w-3.5" />
          {location}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
          {salary}
        </span>
        {shortMeta.map((item) => (
          <span className="rounded-full bg-slate-100 px-3 py-1" key={item}>
            {item}
          </span>
        ))}
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
        {job.description
          ? `${String(job.description).slice(0, 140)}${String(job.description).length > 140 ? "…" : ""}`
          : "Open role — open the listing for full details."}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.length ? (
          tags.map((tag) => (
            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700" key={tag}>
              {tag}
            </span>
          ))
        ) : (
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">General</span>
        )}
      </div>
    </article>
  );

  if (id) {
    return (
      <Link className="block" to={`/jobs/${id}`}>
        {body}
      </Link>
    );
  }

  return body;
}

export { JobCard };
