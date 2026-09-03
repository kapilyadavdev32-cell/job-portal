import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { verifyCompanyAsAdmin } from "../../company/api/companies.js";
import { uploadUserResume, importResumeFromDrive } from "../api/applications.js";
import { EmptyState } from "../../../shared/components/EmptyState.jsx";
import { SectionHeader } from "../../../shared/components/SectionHeader.jsx";
import { StatsCard } from "../../../shared/components/StatsCard.jsx";
import { useAppData } from "../../../store/AppContext.jsx";
import { useToast } from "../../../store/ToastContext.jsx";
import { formatDate } from "../../../shared/utils/formatters.js";

function DashboardPage() {
  const {
    auth,
    applications,
    savedJobs,
    jobs,
    companies,
    refreshApplications,
    refreshSavedJobs,
    refreshJobs,
    refreshCompanies,
    refreshSession,
  } = useAppData();
  const { pushToast } = useToast();
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeDriveUrl, setResumeDriveUrl] = useState("");
  const [resumeUploading, setResumeUploading] = useState(false);

  const user = auth.user;
  const role = user?.role || "jobseeker";

  const myCompanies = useMemo(() => {
    if (!user?._id) {
      return [];
    }
    return companies.items.filter((company) => {
      const ownerId = company.owner?._id || company.owner;
      return ownerId && String(ownerId) === String(user._id);
    });
  }, [companies.items, user?._id]);

  const myJobs = useMemo(() => {
    if (!user?._id) {
      return [];
    }
    return jobs.items.filter((job) => {
      const ownerId = job.company?.owner?._id || job.company?.owner;
      return ownerId && String(ownerId) === String(user._id);
    });
  }, [jobs.items, user?._id]);

  const pendingCompanies = useMemo(
    () => companies.items.filter((company) => !company.isVerified),
    [companies.items],
  );

  const actions = useMemo(() => {
    if (role === "recruiter") {
      return [
        { label: "Add company", to: "/companies/new", kind: "primary" },
        { label: "Post job", to: "/jobs/new", kind: "secondary" },
      ];
    }
    if (role === "admin") {
      return [
        { label: "Review companies", to: "/companies", kind: "primary" },
        { label: "Browse jobs", to: "/jobs", kind: "secondary" },
      ];
    }
    return [
      { label: "Browse jobs", to: "/jobs", kind: "primary" },
      { label: "Browse companies", to: "/companies", kind: "secondary" },
    ];
  }, [role]);

  const refreshWorkspace = async () => {
    await Promise.all([
      refreshApplications(),
      refreshSavedJobs(),
      refreshJobs(),
      refreshCompanies(),
    ]);
  };

  const pipelineTitle = role === "recruiter" ? "Hiring pipeline" : "Your applications";
  const pipelineDescription = role === "recruiter"
    ? "Applications received on jobs posted by your companies."
    : role === "admin"
      ? "Recent application activity across the platform."
      : "Jobs you have applied to.";

  const handleVerifyCompany = async (companyId) => {
    try {
      await verifyCompanyAsAdmin(companyId);
      await refreshCompanies();
      pushToast("Company verified.", "success");
    } catch (error) {
      pushToast(error.message || "Failed to verify company.", "error");
    }
  };

  const handleUploadResume = async (event) => {
    event.preventDefault();
    if (!resumeFile && !resumeDriveUrl.trim()) {
      pushToast("Choose a file or paste a Google Drive link.", "info");
      return;
    }
    setResumeUploading(true);
    try {
      if (resumeFile) {
        await uploadUserResume(resumeFile);
      } else {
        await importResumeFromDrive(resumeDriveUrl.trim());
      }
      await refreshSession();
      setResumeFile(null);
      setResumeDriveUrl("");
      event.target.reset();
      pushToast("Resume saved.", "success");
    } catch (error) {
      pushToast(error.message || "Failed to save resume.", "error");
    } finally {
      setResumeUploading(false);
    }
  };

  return (
    <section className="section-block">
      <div className="detail-hero dashboard-intro">
        <p className="surface-label">Workspace</p>
        <h1>Hi, {user?.username || "there"}</h1>
        <p className="lead">
          Role: <span className="meta-pill">{user?.role || "—"}</span>
        </p>
        <div className="inline-actions" style={{ marginTop: "1rem" }}>
          {actions.map((action) => (
            <Link
              className={action.kind === "primary" ? "primary-button" : "secondary-button"}
              key={action.label}
              style={{ display: "inline-flex" }}
              to={action.to}
            >
              {action.label}
            </Link>
          ))}
          <button className="secondary-button" onClick={refreshWorkspace} type="button">
            Refresh workspace
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {role === "recruiter" ? (
          <>
            <StatsCard title="My companies" value={myCompanies.length} description="Profiles owned by you." />
            <StatsCard title="My jobs" value={myJobs.length} tone="warning" description="Open roles you posted." />
            <StatsCard title="Incoming applications" value={applications.items.length} description="Candidate submissions." />
          </>
        ) : null}
        {role === "admin" ? (
          <>
            <StatsCard title="Jobs" value={jobs.items.length} description="Total jobs in the directory." />
            <StatsCard title="Companies" value={companies.items.length} description="Total companies listed." />
            <StatsCard
              title="Pending companies"
              value={pendingCompanies.length}
              description="Need verification."
              tone={pendingCompanies.length ? "warning" : "positive"}
            />
          </>
        ) : null}
        {role !== "recruiter" && role !== "admin" ? (
          <>
            <StatsCard
              description="Applications you have submitted."
              title="My applications"
              value={applications.items.length}
            />
            <StatsCard
              description="Roles saved for later."
              title="Saved jobs"
              tone="warning"
              value={savedJobs.items.length}
            />
            <StatsCard
              description="Open jobs currently listed."
              title="Open roles"
              value={jobs.items.length}
            />
          </>
        ) : null}
      </div>

      <div className="content-grid dashboard-grid">
        <article className="panel">
          <SectionHeader
            eyebrow="Applications"
            title={pipelineTitle}
            description={pipelineDescription}
          />
          {applications.status === "loading" ? (
            <p className="muted">Loading…</p>
          ) : applications.items.length ? (
            <ul className="data-list">
              {applications.items.map((app) => {
                const job = app.job;
                const jid = job?._id || job;
                const title = job?.title || "Job";
                return (
                  <li className="data-list-item" key={app._id}>
                    <div>
                      <strong>{title}</strong>
                      <p className="muted small">
                        Status: {app.status || "Applied"} · {formatDate(app.createdAt)}
                      </p>
                      {role !== "jobseeker" && app.applicant?.username ? (
                        <p className="muted small">Applicant: {app.applicant.username}</p>
                      ) : null}
                    </div>
                    <div className="inline-actions">
                      {app.resume?.url ? (
                        <a
                          className="secondary-button"
                          href={app.resume.url}
                          rel="noreferrer"
                          style={{ display: "inline-flex" }}
                          target="_blank"
                        >
                          Resume
                        </a>
                      ) : null}
                      {jid ? (
                        <Link className="secondary-button" style={{ display: "inline-flex" }} to={`/jobs/${jid}`}>
                          View
                        </Link>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              title="No applications yet"
              description={
                applications.message ||
                (role === "recruiter"
                  ? "Applicants will appear here after they apply to your jobs."
                  : role === "admin"
                    ? "Application activity appears here once users start applying."
                    : "When you apply to a role, it shows up here.")
              }
            />
          )}
        </article>

        <article className="panel">
          {role === "recruiter" ? (
            <>
              <SectionHeader
                eyebrow="Recruiter"
                title="Your jobs"
                description="Latest jobs posted by your companies."
                action={
                  <Link className="secondary-button" style={{ display: "inline-flex" }} to="/jobs/new">
                    Post job
                  </Link>
                }
              />
              {myJobs.length ? (
                <ul className="data-list">
                  {myJobs.slice(0, 6).map((job) => (
                    <li className="data-list-item" key={job._id}>
                      <div>
                        <strong>{job.title}</strong>
                        <p className="muted small">
                          {job.company?.name || "Company"} · Apply by {formatDate(job.lastDateToApply)}
                        </p>
                      </div>
                      <Link
                        className="secondary-button"
                        style={{ display: "inline-flex" }}
                        to={`/jobs/${job._id}`}
                      >
                        Open
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="No jobs posted yet" description="Create your first job to start hiring." />
              )}
            </>
          ) : null}

          {role === "admin" ? (
            <>
              <SectionHeader
                eyebrow="Admin"
                title="Pending verification"
                description="Unverified companies that need review."
              />
              {pendingCompanies.length ? (
                <ul className="data-list">
                  {pendingCompanies.slice(0, 6).map((company) => (
                    <li className="data-list-item" key={company._id}>
                      <div>
                        <strong>{company.name}</strong>
                        <p className="muted small">{company.location || "Location pending"}</p>
                      </div>
                      <Link
                        className="secondary-button"
                        style={{ display: "inline-flex" }}
                        to={`/companies/${company._id}`}
                      >
                        Review
                      </Link>
                      <button
                        className="primary-button"
                        onClick={() => handleVerifyCompany(company._id)}
                        style={{ display: "inline-flex" }}
                        type="button"
                      >
                        Verify
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="No pending companies" description="Everything is verified right now." />
              )}
            </>
          ) : null}

          {role !== "recruiter" && role !== "admin" ? (
            <>
              <SectionHeader
                eyebrow="Resume"
                title="Your resume"
                description="Upload a PDF, DOC, or DOCX (max 5MB), or paste a Google Drive / Docs link."
              />
              {user?.resume?.url ? (
                <p className="muted" style={{ marginBottom: "0.75rem" }}>
                  Current file:{" "}
                  <a href={user.resume.url} rel="noreferrer" target="_blank">
                    {user.resume.originalName || "Open resume"}
                  </a>
                </p>
              ) : (
                <p className="muted" style={{ marginBottom: "0.75rem" }}>
                  No resume saved yet.
                </p>
              )}
              <form className="space-y-3" onSubmit={handleUploadResume}>
                <input
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-blue-700"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  type="file"
                />
                <label className="text-sm font-medium text-slate-700" htmlFor="dashboard-drive">
                  Or Google Drive link
                </label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  id="dashboard-drive"
                  onChange={(e) => setResumeDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/…"
                  type="url"
                  value={resumeDriveUrl}
                />
                <p className="muted small">
                  The file must be shared as “Anyone with the link”. Google Docs are saved as PDF.
                </p>
                <button className="primary-button" disabled={resumeUploading} type="submit">
                  {resumeUploading ? "Saving..." : "Save resume"}
                </button>
              </form>
              <SectionHeader
                eyebrow="Saved"
                title="Bookmarked jobs"
                description="Quick access to roles you care about."
              />
              {savedJobs.status === "loading" ? (
                <p className="muted">Loading…</p>
              ) : savedJobs.items.length ? (
                <ul className="data-list">
                  {savedJobs.items.map((entry) => {
                    const job = entry.job;
                    const jid = job?._id || job;
                    return (
                      <li className="data-list-item" key={entry._id}>
                        <div>
                          <strong>{job?.title || "Job"}</strong>
                          <p className="muted small">{job?.company?.name || ""}</p>
                        </div>
                        {jid ? (
                          <Link
                            className="secondary-button"
                            style={{ display: "inline-flex" }}
                            to={`/jobs/${jid}`}
                          >
                            Open
                          </Link>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState title="Nothing saved" description="Save jobs from listings to build a shortlist." />
              )}
            </>
          ) : null}
        </article>
      </div>
    </section>
  );
}

export { DashboardPage };
