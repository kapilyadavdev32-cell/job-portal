import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Filter, Plus, RefreshCcw, Search } from "lucide-react";
import { EmptyState } from "../../../shared/components/EmptyState.jsx";
import { SectionHeader } from "../../../shared/components/SectionHeader.jsx";
import { SkeletonCard } from "../../../shared/components/SkeletonCard.jsx";
import { useAppData } from "../../../store/AppContext.jsx";
import { JobCard } from "../components/JobCard.jsx";

const JOB_TYPES = ["", "Full-Time", "Part-Time", "Internship", "Contract"];
const LEVELS = ["", "Fresher", "Junior", "Mid", "Senior"];

function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { jobs, auth, refreshJobs } = useAppData();

  const [qInput, setQInput] = useState(() => searchParams.get("q") || "");
  const [jobType, setJobType] = useState(() => searchParams.get("jobType") || "");
  const [experienceLevel, setExperienceLevel] = useState(() => searchParams.get("experienceLevel") || "");
  const [remote, setRemote] = useState(() => searchParams.get("isRemote") || "");

  useEffect(() => {
    setQInput(searchParams.get("q") || "");
    setJobType(searchParams.get("jobType") || "");
    setExperienceLevel(searchParams.get("experienceLevel") || "");
    setRemote(searchParams.get("isRemote") || "");
  }, [searchParams]);

  const filters = useMemo(() => {
    const f = {};
    const q = searchParams.get("q");
    if (q?.trim()) {
      f.q = q.trim();
    }
    const jt = searchParams.get("jobType");
    if (jt) {
      f.jobType = jt;
    }
    const el = searchParams.get("experienceLevel");
    if (el) {
      f.experienceLevel = el;
    }
    const ir = searchParams.get("isRemote");
    if (ir === "true" || ir === "false") {
      f.isRemote = ir;
    }
    return f;
  }, [searchParams]);

  useEffect(() => {
    refreshJobs(filters);
  }, [filters, refreshJobs]);

  const applyFilters = () => {
    const next = new URLSearchParams();
    if (qInput.trim()) {
      next.set("q", qInput.trim());
    }
    if (jobType) {
      next.set("jobType", jobType);
    }
    if (experienceLevel) {
      next.set("experienceLevel", experienceLevel);
    }
    if (remote === "true" || remote === "false") {
      next.set("isRemote", remote);
    }
    setSearchParams(next);
  };

  const clearFilters = () => {
    setQInput("");
    setJobType("");
    setExperienceLevel("");
    setRemote("");
    setSearchParams({});
  };

  const canManageJobs =
    auth.status === "ready" &&
    (auth.user?.role === "recruiter" || auth.user?.role === "admin");

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Jobs"
        title="Open positions"
        description="Filter by keyword, role type, level, and remote preference. URLs are shareable."
        action={
          <div className="flex flex-wrap gap-2">
            {canManageJobs ? (
              <Link
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                to="/jobs/new"
              >
                <Plus className="h-4 w-4" />
                Add job
              </Link>
            ) : null}
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              onClick={() => refreshJobs(filters)}
              type="button"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-28">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
            <Filter className="h-3.5 w-3.5" />
            Filters
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="job-search">
                Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  id="job-search"
                  value={qInput}
                  onChange={(e) => setQInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                  placeholder="Title, stack, keyword..."
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="job-type">
                Job type
              </label>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                id="job-type"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              >
                {JOB_TYPES.map((opt) => (
                  <option key={opt || "any"} value={opt}>
                    {opt || "Any"}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="job-level">
                Level
              </label>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                id="job-level"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                {LEVELS.map((opt) => (
                  <option key={opt || "any"} value={opt}>
                    {opt || "Any"}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="job-remote">
                Remote
              </label>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                id="job-remote"
                value={remote}
                onChange={(e) => setRemote(e.target.value)}
              >
                <option value="">Any</option>
                <option value="true">Remote only</option>
                <option value="false">On-site / hybrid</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              onClick={applyFilters}
              type="button"
            >
              Apply
            </button>
            <button
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              onClick={clearFilters}
              type="button"
            >
              Clear
            </button>
          </div>
        </aside>

        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {jobs.status === "loading" ? "Updating listings..." : `${jobs.items.length} jobs found`}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.status === "loading" ? (
              Array.from({ length: 6 }).map((_, idx) => <SkeletonCard key={idx} />)
            ) : jobs.items.length ? (
              jobs.items.map((job) => <JobCard job={job} key={job._id || job.id || job.title} />)
            ) : (
              <div className="md:col-span-2">
                <EmptyState
                  title="No jobs match"
                  description={jobs.message || "Try widening your filters or clear them to see all roles."}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export { JobsPage };
