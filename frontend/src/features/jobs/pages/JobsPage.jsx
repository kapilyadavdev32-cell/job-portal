import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Filter,
  Plus,
  RefreshCcw,
  Search,
  MapPin,
  DollarSign,
  X,
  SlidersHorizontal,
  ArrowUpDown
} from "lucide-react";
import { EmptyState } from "../../../shared/components/EmptyState.jsx";
import { LoadingState } from "../../../shared/components/LoadingState.jsx";
import { SectionHeader } from "../../../shared/components/SectionHeader.jsx";
import { useAppData } from "../../../store/AppContext.jsx";
import { JobCard } from "../components/JobCard.jsx";

const JOB_TYPES = ["", "Full-Time", "Part-Time", "Internship", "Contract"];
const LEVELS = ["", "Fresher", "Junior", "Mid", "Senior"];

function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { jobs, auth, refreshJobs } = useAppData();

  const [qInput, setQInput] = useState(() => searchParams.get("search") || searchParams.get("q") || "");
  const [locationInput, setLocationInput] = useState(() => searchParams.get("location") || "");
  const [jobType, setJobType] = useState(() => searchParams.get("jobType") || "");
  const [experienceLevel, setExperienceLevel] = useState(() => searchParams.get("experienceLevel") || "");
  const [remote, setRemote] = useState(() => searchParams.get("isRemote") || "");
  const [sortBy, setSortBy] = useState("latest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setQInput(searchParams.get("search") || searchParams.get("q") || "");
    setLocationInput(searchParams.get("location") || "");
    setJobType(searchParams.get("jobType") || "");
    setExperienceLevel(searchParams.get("experienceLevel") || "");
    setRemote(searchParams.get("isRemote") || "");
  }, [searchParams]);

  const backendFilters = useMemo(() => {
    const f = {};
    const q = searchParams.get("search") || searchParams.get("q");
    if (q?.trim()) f.q = q.trim();

    const jt = searchParams.get("jobType");
    if (jt) f.jobType = jt;

    const el = searchParams.get("experienceLevel");
    if (el) f.experienceLevel = el;

    const ir = searchParams.get("isRemote");
    if (ir === "true" || ir === "false") f.isRemote = ir;

    return f;
  }, [searchParams]);

  useEffect(() => {
    refreshJobs(backendFilters);
  }, [backendFilters, refreshJobs]);

  const applyFilters = () => {
    const next = new URLSearchParams();
    if (qInput.trim()) next.set("search", qInput.trim());
    if (locationInput.trim()) next.set("location", locationInput.trim());
    if (jobType) next.set("jobType", jobType);
    if (experienceLevel) next.set("experienceLevel", experienceLevel);
    if (remote === "true" || remote === "false") next.set("isRemote", remote);
    setSearchParams(next);
    setMobileFiltersOpen(false);
  };

  const clearFilters = () => {
    setQInput("");
    setLocationInput("");
    setJobType("");
    setExperienceLevel("");
    setRemote("");
    setSearchParams({});
    setMobileFiltersOpen(false);
  };

  // Client-side filtration for additional fields like location string & client sorting
  const filteredAndSortedJobs = useMemo(() => {
    let result = [...jobs.items];

    // Filter by location query if backend search didn't cover location field string
    if (locationInput.trim()) {
      const locLower = locationInput.trim().toLowerCase();
      result = result.filter(
        (j) =>
          (j.location && j.location.toLowerCase().includes(locLower)) ||
          (j.isRemote && "remote".includes(locLower))
      );
    }

    // Sort
    if (sortBy === "salary") {
      result.sort((a, b) => {
        const valA = a.salaryRange?.max || a.salaryRange?.min || 0;
        const valB = b.salaryRange?.max || b.salaryRange?.min || 0;
        return valB - valA;
      });
    } else if (sortBy === "latest") {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }, [jobs.items, locationInput, sortBy]);

  const canManageJobs =
    auth.status === "ready" &&
    (auth.user?.role === "recruiter" || auth.user?.role === "admin");

  const filterSidebar = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900">
          <Filter className="h-4 w-4 text-blue-600" />
          Filter Jobs
        </div>
        <button
          onClick={clearFilters}
          type="button"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        {/* Title or Skill */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-slate-600" htmlFor="job-search">
            Title / Skill
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              id="job-search"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="e.g. React, Developer..."
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-slate-600" htmlFor="job-location">
            Location
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              id="job-location"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="e.g. Remote, New York..."
            />
          </div>
        </div>

        {/* Job Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-slate-600" htmlFor="job-type">
            Job Type
          </label>
          <select
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            id="job-type"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
          >
            {JOB_TYPES.map((opt) => (
              <option key={opt || "any"} value={opt}>
                {opt || "All Types"}
              </option>
            ))}
          </select>
        </div>

        {/* Experience Level */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-slate-600" htmlFor="job-level">
            Experience Level
          </label>
          <select
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            id="job-level"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
          >
            {LEVELS.map((opt) => (
              <option key={opt || "any"} value={opt}>
                {opt || "All Levels"}
              </option>
            ))}
          </select>
        </div>

        {/* Remote Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-slate-600" htmlFor="job-remote">
            Work Preference
          </label>
          <select
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            id="job-remote"
            value={remote}
            onChange={(e) => setRemote(e.target.value)}
          >
            <option value="">All Preferences</option>
            <option value="true">Remote Only</option>
            <option value="false">On-site / Hybrid</option>
          </select>
        </div>
      </div>

      <div className="pt-2 flex gap-2">
        <button
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-95"
          onClick={applyFilters}
          type="button"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Career Opportunities"
        title="Find Your Next Job"
        description="Search through open roles posted by top companies. Filter by skills, location, or experience."
        action={
          <div className="flex flex-wrap gap-2">
            {canManageJobs && (
              <Link
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
                to="/jobs/new"
              >
                <Plus className="h-4 w-4" />
                Post a Job
              </Link>
            )}
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              onClick={() => refreshJobs(backendFilters)}
              type="button"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        }
      />

      {/* MOBILE FILTER TOGGLE BUTTON */}
      <div className="flex items-center justify-between gap-4 lg:hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700"
          type="button"
        >
          <SlidersHorizontal className="h-4 w-4 text-blue-600" />
          Filter Options
        </button>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="latest">Sort: Latest</option>
            <option value="salary">Sort: Highest Salary</option>
          </select>
        </div>
      </div>

      {/* MOBILE FILTERS DRAWER */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex bg-slate-900/50 backdrop-blur-sm lg:hidden">
          <div className="ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-base font-bold text-slate-900">Filters</span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterSidebar}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="hidden h-fit rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm lg:block sticky top-28">
          {filterSidebar}
        </aside>

        {/* JOB RESULTS GRID */}
        <div className="space-y-4">
          <div className="hidden lg:flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white px-5 py-3 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">
              Showing <span className="text-blue-600 font-extrabold">{filteredAndSortedJobs.length}</span> job openings
            </p>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 outline-none transition focus:border-blue-500"
              >
                <option value="latest">Sort: Latest</option>
                <option value="salary">Sort: Highest Salary</option>
              </select>
            </div>
          </div>

          {jobs.status === "loading" ? (
            <LoadingState message="Searching available jobs..." />
          ) : filteredAndSortedJobs.length ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {filteredAndSortedJobs.map((job) => (
                <JobCard job={job} key={job._id || job.id || job.title} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <EmptyState
                title="No matching jobs found"
                description={
                  jobs.message || "Try adjusting your search query, location, or clear active filters."
                }
              />
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export { JobsPage };
