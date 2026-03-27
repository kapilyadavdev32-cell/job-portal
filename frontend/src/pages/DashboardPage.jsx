import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState.jsx";
import { SectionHeader } from "../components/SectionHeader.jsx";
import { useAppData } from "../store/AppContext.jsx";
import { formatDate } from "../utils/formatters.js";

function DashboardPage() {
  const { auth, applications, savedJobs } = useAppData();
  const user = auth.user;

  return (
    <section className="section-block">
      <div className="detail-hero dashboard-intro">
        <p className="surface-label">Workspace</p>
        <h1>Hi, {user?.username || "there"}</h1>
        <p className="lead">
          Role: <span className="meta-pill">{user?.role || "—"}</span>
        </p>
      </div>

      <div className="content-grid dashboard-grid">
        <article className="panel">
          <SectionHeader
            eyebrow="Applications"
            title="Your pipeline"
            description={
              user?.role === "recruiter"
                ? "Applications for jobs at companies you own."
                : "Jobs you have applied to."
            }
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
                    </div>
                    {jid ? (
                      <Link className="secondary-button" style={{ display: "inline-flex" }} to={`/jobs/${jid}`}>
                        View
                      </Link>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              title="No applications yet"
              description={applications.message || "When you apply to a role, it shows up here."}
            />
          )}
        </article>

        <article className="panel">
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
                      <Link className="secondary-button" style={{ display: "inline-flex" }} to={`/jobs/${jid}`}>
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
        </article>
      </div>
    </section>
  );
}

export { DashboardPage };
