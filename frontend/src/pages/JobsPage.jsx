import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState.jsx";
import { JobCard } from "../components/JobCard.jsx";
import { SectionHeader } from "../components/SectionHeader.jsx";
import { useAppData } from "../store/AppContext.jsx";

const JOB_TYPES = ["", "Full-Time", "Part-Time", "Internship", "Contract"];
const LEVELS = ["", "Fresher", "Junior", "Mid", "Senior"];

function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { jobs, refreshJobs } = useAppData();

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

  return (
    <section className="section-block">
      <SectionHeader
        eyebrow="Jobs"
        title="Open positions"
        description="Filter by keyword, role type, level, and remote preference. URLs are shareable."
        action={
          <button className="secondary-button" onClick={() => refreshJobs(filters)} type="button">
            Refresh
          </button>
        }
      />

      <div className="filter-bar panel">
        <div className="filter-grid">
          <div className="input-group">
            <label htmlFor="job-search">Search</label>
            <input
              id="job-search"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Title, stack, keyword…"
            />
          </div>
          <div className="input-group">
            <label htmlFor="job-type">Job type</label>
            <select id="job-type" value={jobType} onChange={(e) => setJobType(e.target.value)}>
              {JOB_TYPES.map((opt) => (
                <option key={opt || "any"} value={opt}>
                  {opt || "Any"}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="job-level">Level</label>
            <select id="job-level" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
              {LEVELS.map((opt) => (
                <option key={opt || "any"} value={opt}>
                  {opt || "Any"}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="job-remote">Remote</label>
            <select id="job-remote" value={remote} onChange={(e) => setRemote(e.target.value)}>
              <option value="">Any</option>
              <option value="true">Remote only</option>
              <option value="false">On-site / hybrid</option>
            </select>
          </div>
        </div>
        <div className="inline-actions filter-actions">
          <button className="primary-button" onClick={applyFilters} type="button">
            Apply filters
          </button>
          <button className="secondary-button" onClick={clearFilters} type="button">
            Clear
          </button>
        </div>
      </div>

      <div className="job-grid">
        {jobs.status === "loading" ? (
          <p className="muted">Loading listings…</p>
        ) : jobs.items.length ? (
          jobs.items.map((job) => <JobCard job={job} key={job._id || job.id || job.title} />)
        ) : (
          <EmptyState
            title="No jobs match"
            description={jobs.message || "Try widening your filters or clear them to see all roles."}
          />
        )}
      </div>
    </section>
  );
}

export { JobsPage };
