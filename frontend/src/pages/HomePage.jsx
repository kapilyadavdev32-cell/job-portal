import { Link, useNavigate } from "react-router-dom";
import { CompanyCard } from "../components/CompanyCard.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { JobCard } from "../components/JobCard.jsx";
import { SectionHeader } from "../components/SectionHeader.jsx";
import { StatsCard } from "../components/StatsCard.jsx";
import { useAppData } from "../store/AppContext.jsx";

function HomePage() {
  const navigate = useNavigate();
  const { health, jobs, companies } = useAppData();

  return (
    <>
      <section className="hero-banner">
        <p className="surface-label">Hire and get hired</p>
        <h1>Find your next role—or your next teammate.</h1>
        <p>
          Search live listings, explore verified employers, and manage applications and saved jobs in one
          place. Built as a full-stack demo with a real API and cookie-based sessions.
        </p>
        <div className="tag-row">
          <span className="tag">Browse &amp; filter</span>
          <span className="tag">Save &amp; apply</span>
          <span className="tag">Dashboard</span>
        </div>
        <div className="hero-actions">
          <button className="primary-button" onClick={() => navigate("/jobs")} type="button">
            Explore jobs
          </button>
          <button className="secondary-button" onClick={() => navigate("/companies")} type="button">
            Browse companies
          </button>
          <Link className="secondary-button" style={{ display: "inline-flex", alignItems: "center" }} to="/auth">
            Sign in
          </Link>
        </div>
      </section>

      <section className="stats-grid">
        <StatsCard
          title="Backend status"
          value={health.status === "ready" ? "Live" : health.status === "error" ? "Down" : "…"}
          description={health.message || "Checking healthcheck endpoint"}
          tone={health.status === "error" ? "danger" : "positive"}
        />
        <StatsCard
          title="Open roles"
          value={jobs.items.length}
          description="Listings from GET /jobs"
        />
        <StatsCard
          title="Companies"
          value={companies.items.length}
          description="Employer directory"
          tone="warning"
        />
      </section>

      <section className="content-grid">
        <article className="panel">
          <SectionHeader
            eyebrow="Jobs"
            title="Latest roles"
            description="A live slice of the jobs feed—open a card for the full description and apply flow."
          />
          <div className="job-grid">
            {jobs.items.length ? (
              jobs.items.slice(0, 4).map((job) => <JobCard job={job} key={job._id || job.id || job.title} />)
            ) : (
              <EmptyState
                title="No jobs available"
                description={jobs.message || "Start the backend and add jobs to populate this section."}
              />
            )}
          </div>
          {jobs.items.length ? (
            <p style={{ marginTop: "1rem" }}>
              <button className="secondary-button" onClick={() => navigate("/jobs")} type="button">
                View all jobs
              </button>
            </p>
          ) : null}
        </article>

        <article className="panel">
          <SectionHeader
            eyebrow="Companies"
            title="Employer directory"
            description="Explore company pages and their open positions."
          />
          <div className="company-grid">
            {companies.items.length ? (
              companies.items
                .slice(0, 3)
                .map((company) => <CompanyCard company={company} key={company._id || company.name} />)
            ) : (
              <EmptyState
                title="No companies available"
                description={companies.message || "Company records appear when the API returns data."}
              />
            )}
          </div>
        </article>
      </section>
    </>
  );
}

export { HomePage };
