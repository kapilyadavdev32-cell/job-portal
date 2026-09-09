import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { BriefcaseBusiness, Building2, MapPin, Bookmark, ArrowUpRight, DollarSign } from "lucide-react";
import { formatJobMeta } from "../../../shared/utils/formatters.js";
import { useAppData } from "../../../store/AppContext.jsx";
import { saveJobForUser, removeSavedJob } from "../api/savedJobs.js";
import { useToast } from "../../../store/ToastContext.jsx";

function JobCard({ job }) {
  const navigate = useNavigate();
  const { auth, savedJobs, refreshSavedJobs } = useAppData();
  const { pushToast } = useToast();

  const id = job._id || job.id;
  const companyName = job.companyName || job.company?.name || "Company";
  const companyLogo = job.company?.logo?.url;
  const tags = (job.skillsRequired || []).slice(0, 3);

  const salary =
    job.salaryRange?.min != null && job.salaryRange?.max != null
      ? `$${job.salaryRange.min}k - $${job.salaryRange.max}k`
      : job.salary || "Salary Undisclosed";

  const location = job.location || (job.isRemote ? "Remote" : "Location TBD");

  const savedEntry =
    savedJobs.status === "ready" &&
    id &&
    savedJobs.items.find((s) => String(s.job?._id || s.job) === String(id));

  const handleSaveClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!auth.user) {
      pushToast("Please sign in to save jobs.", "info");
      navigate("/auth");
      return;
    }

    try {
      if (savedEntry) {
        await removeSavedJob(savedEntry._id);
        pushToast("Removed job from saved items.", "success");
      } else {
        await saveJobForUser(id);
        pushToast("Job saved successfully!", "success");
      }
      await refreshSavedJobs();
    } catch (err) {
      pushToast(err.message || "Failed to update saved jobs.", "error");
    }
  };

  return (
    <article className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl">
      <div>
        {/* HEADER: COMPANY LOGO / INITIAL & SAVE BUTTON */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="h-12 w-12 rounded-2xl object-cover border border-slate-100 shadow-sm"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100/70 text-blue-700 font-extrabold text-lg">
                <BriefcaseBusiness className="h-6 w-6" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-1 text-lg font-bold text-slate-900 transition group-hover:text-blue-600">
                {job.title || "Untitled Role"}
              </h3>
              <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-slate-500">
                <Building2 className="h-3.5 w-3.5" />
                <span className="truncate">{companyName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveClick}
            type="button"
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
              savedEntry
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
            }`}
            title={savedEntry ? "Remove saved job" : "Save job"}
          >
            <Bookmark className="h-4 w-4 fill-current" />
          </button>
        </div>

        {/* METADATA BADGES */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            <MapPin className="h-3.5 w-3.5 text-slate-500" />
            {location}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 border border-emerald-100">
            <DollarSign className="h-3.5 w-3.5" />
            {salary}
          </span>
          {job.jobType && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 border border-blue-100">
              {job.jobType}
            </span>
          )}
          {job.experienceLevel && (
            <span className="rounded-full bg-purple-50 px-3 py-1 text-purple-700 border border-purple-100">
              {job.experienceLevel}
            </span>
          )}
        </div>

        {/* DESCRIPTION PREVIEW */}
        <p className="mt-4 line-clamp-2 text-xs leading-5 text-slate-600 font-medium">
          {job.description || "Open role — click view details for complete information and requirements."}
        </p>

        {/* SKILL TAGS */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-400">
              General Skillset
            </span>
          )}
        </div>
      </div>

      {/* CARD FOOTER */}
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-[11px] font-semibold text-slate-400">
          {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Recently Posted"}
        </span>

        {id && (
          <Link
            to={`/jobs/${id}`}
            className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-600 active:scale-95"
          >
            View Details <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </article>
  );
}

export { JobCard };
