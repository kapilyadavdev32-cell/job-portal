import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchCompanyById } from "../api/companies.js";
import { fetchJobs } from "../api/jobs.js";
import { EmptyState } from "../components/EmptyState.jsx";
import { JobCard } from "../components/JobCard.jsx";
import { SectionHeader } from "../components/SectionHeader.jsx";
import { extractJobs } from "../utils/normalizers.js";

function CompanyDetailPage() {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStatus({ loading: true, error: "" });
      try {
        const [companyRes, jobsRes] = await Promise.all([
          fetchCompanyById(companyId),
          fetchJobs({ company: companyId }),
        ]);
        const c = companyRes?.data?.company ?? companyRes?.data;
        const jobList = extractJobs(jobsRes);
        if (!cancelled) {
          setCompany(c || null);
          setJobs(jobList);
          setStatus({ loading: false, error: c ? "" : "Company not found." });
        }
      } catch (e) {
        if (!cancelled) {
          setCompany(null);
          setJobs([]);
          setStatus({ loading: false, error: e.message || "Failed to load company." });
        }
      }
    }
    if (companyId) {
      load();
    }
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const title = useMemo(() => company?.name || "Company", [company]);

  if (status.loading) {
    return (
      <section className="section-block">
        <div className="page-loading">
          <div className="loading-spinner" aria-hidden />
          <p>Loading company…</p>
        </div>
      </section>
    );
  }

  if (status.error || !company) {
    return (
      <section className="section-block">
        <EmptyState title="Company unavailable" description={status.error} />
        <p style={{ marginTop: "1rem" }}>
          <Link className="secondary-button" style={{ display: "inline-flex" }} to="/companies">
            Back to companies
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section className="section-block">
      <div className="detail-hero">
        <p className="surface-label">Company</p>
        <h1>{title}</h1>
        <p className="lead">{company.location || "Location not specified"}</p>
        <div className="meta-list">
          <span className="meta-pill">{company.isVerified ? "Verified" : "Pending verification"}</span>
          {company.website ? (
            <a className="meta-pill" href={company.website} rel="noreferrer" target="_blank">
              Website
            </a>
          ) : null}
        </div>
        <p className="job-description" style={{ marginTop: "1rem" }}>
          {company.description || "No description provided."}
        </p>
      </div>

      <SectionHeader
        eyebrow="Openings"
        title={`Roles at ${title}`}
        description="Positions linked to this employer in the database."
      />
      <div className="job-grid">
        {jobs.length ? (
          jobs.map((job) => <JobCard job={job} key={job._id || job.title} />)
        ) : (
          <EmptyState title="No open roles" description="Check back later for new listings." />
        )}
      </div>
    </section>
  );
}

export { CompanyDetailPage };
