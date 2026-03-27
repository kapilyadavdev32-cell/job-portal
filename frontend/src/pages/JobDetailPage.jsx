import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { createApplication } from "../api/applications.js";
import { fetchJobById } from "../api/jobs.js";
import { removeSavedJob, saveJobForUser } from "../api/savedJobs.js";
import { EmptyState } from "../components/EmptyState.jsx";
import { SectionHeader } from "../components/SectionHeader.jsx";
import { useToast } from "../store/ToastContext.jsx";
import { useAppData } from "../store/AppContext.jsx";
import { formatDate, formatJobMeta } from "../utils/formatters.js";

function JobDetailPage() {
  const { jobId } = useParams();
  const { auth, savedJobs, refreshSavedJobs } = useAppData();
  const { pushToast } = useToast();
  const [job, setJob] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [applyForm, setApplyForm] = useState({ resumeUrl: "", coverLetter: "" });
  const [applyLoading, setApplyLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStatus({ loading: true, error: "" });
      try {
        const result = await fetchJobById(jobId);
        const j = result?.data?.job ?? result?.data;
        if (!cancelled) {
          setJob(j || null);
          setStatus({ loading: false, error: j ? "" : "Job not found." });
        }
      } catch (e) {
        if (!cancelled) {
          setJob(null);
          setStatus({ loading: false, error: e.message || "Failed to load job." });
        }
      }
    }
    if (jobId) {
      load();
    }
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const meta = useMemo(() => (job ? formatJobMeta(job) : []), [job]);

  const savedEntry = useMemo(() => {
    if (!job?._id || savedJobs.status !== "ready") {
      return null;
    }
    return savedJobs.items.find(
      (s) => String(s.job?._id || s.job) === String(job._id),
    );
  }, [job, savedJobs]);

  const isSeeker = auth.user?.role === "jobseeker";

  const handleSaveToggle = async () => {
    if (!auth.user) {
      pushToast("Sign in to save jobs.", "info");
      return;
    }
    try {
      if (savedEntry) {
        await removeSavedJob(savedEntry._id);
        pushToast("Removed from saved jobs.", "success");
      } else {
        await saveJobForUser(job._id);
        pushToast("Job saved.", "success");
      }
      await refreshSavedJobs();
    } catch (e) {
      pushToast(e.message || "Could not update saved jobs.", "error");
    }
  };

  const handleApply = async (event) => {
    event.preventDefault();
    if (!auth.user) {
      pushToast("Sign in to apply.", "info");
      return;
    }
    if (!isSeeker) {
      pushToast("Only job seekers can submit applications from this view.", "info");
      return;
    }
    setApplyLoading(true);
    try {
      await createApplication({
        job: job._id,
        coverLetter: applyForm.coverLetter.trim() || undefined,
        resume: applyForm.resumeUrl.trim()
          ? { url: applyForm.resumeUrl.trim() }
          : undefined,
      });
      pushToast("Application submitted.", "success");
      setApplyForm({ resumeUrl: "", coverLetter: "" });
    } catch (e) {
      pushToast(e.message || "Application failed.", "error");
    } finally {
      setApplyLoading(false);
    }
  };

  if (status.loading) {
    return (
      <section className="section-block">
        <div className="page-loading">
          <div className="loading-spinner" aria-hidden />
          <p>Loading role…</p>
        </div>
      </section>
    );
  }

  if (status.error || !job) {
    return (
      <section className="section-block">
        <EmptyState
          title="Job unavailable"
          description={status.error || "This listing may have been removed."}
        />
        <p style={{ marginTop: "1rem" }}>
          <Link className="secondary-button" style={{ display: "inline-flex" }} to="/jobs">
            Back to jobs
          </Link>
        </p>
      </section>
    );
  }

  const company = job.company;
  const companyId = company?._id || company;

  return (
    <section className="section-block job-detail">
      <div className="detail-hero">
        <p className="surface-label">Job</p>
        <h1>{job.title}</h1>
        <p className="lead">
          {company?.name ? (
            <>
              {companyId ? (
                <Link to={`/companies/${companyId}`}>{company.name}</Link>
              ) : (
                company.name
              )}
            </>
          ) : (
            "Company"
          )}
        </p>
        <div className="meta-list" style={{ marginTop: "0.75rem" }}>
          {meta.map((m) => (
            <span className="meta-pill" key={m}>
              {m}
            </span>
          ))}
        </div>
        <div className="inline-actions" style={{ marginTop: "1rem" }}>
          <button className="secondary-button" onClick={handleSaveToggle} type="button">
            {savedEntry ? "Saved" : "Save job"}
          </button>
          <Link className="primary-button" style={{ display: "inline-flex" }} to="/jobs">
            More openings
          </Link>
        </div>
      </div>

      <div className="content-grid detail-split">
        <article className="panel prose-block">
          <SectionHeader eyebrow="Overview" title="Description" />
          <p className="job-description">{job.description}</p>
          {job.skillsRequired?.length ? (
            <>
              <h3 className="detail-subheading">Skills</h3>
              <div className="meta-list">
                {job.skillsRequired.map((s) => (
                  <span className="meta-pill" key={s}>
                    {s}
                  </span>
                ))}
              </div>
            </>
          ) : null}
        </article>

        <aside className="panel sticky-aside">
          <h3>Role details</h3>
          <ul className="detail-facts">
            <li>
              <span>Type</span>
              <strong>{job.jobType}</strong>
            </li>
            <li>
              <span>Level</span>
              <strong>{job.experienceLevel}</strong>
            </li>
            <li>
              <span>Apply by</span>
              <strong>{formatDate(job.lastDateToApply)}</strong>
            </li>
            <li>
              <span>Remote</span>
              <strong>{job.isRemote ? "Yes" : "No"}</strong>
            </li>
          </ul>

          {isSeeker && auth.status === "ready" ? (
            <form className="apply-form" onSubmit={handleApply}>
              <h3>Apply</h3>
              <div className="input-group">
                <label htmlFor="resume-url">Resume URL</label>
                <input
                  id="resume-url"
                  value={applyForm.resumeUrl}
                  onChange={(e) => setApplyForm((f) => ({ ...f, resumeUrl: e.target.value }))}
                  placeholder="https://…"
                  type="url"
                />
              </div>
              <div className="input-group">
                <label htmlFor="cover">Cover letter</label>
                <textarea
                  id="cover"
                  className="textarea-input"
                  rows={4}
                  value={applyForm.coverLetter}
                  onChange={(e) => setApplyForm((f) => ({ ...f, coverLetter: e.target.value }))}
                  placeholder="Brief note to the hiring team (optional)"
                />
              </div>
              <button className="primary-button" disabled={applyLoading} type="submit">
                {applyLoading ? "Submitting…" : "Submit application"}
              </button>
            </form>
          ) : (
            <p className="muted">
              {auth.user && !isSeeker
                ? "Recruiters manage applications from the dashboard."
                : "Sign in as a job seeker to apply with one flow."}
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}

export { JobDetailPage };
