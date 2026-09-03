import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { fetchCompanies } from "../../company/api/companies.js";
import { createJob, fetchJobById, updateJob } from "../api/jobs.js";
import { EmptyState } from "../../../shared/components/EmptyState.jsx";
import { useToast } from "../../../store/ToastContext.jsx";
import { useAppData } from "../../../store/AppContext.jsx";

const JOB_TYPES = ["Full-Time", "Part-Time", "Internship", "Contract"];
const LEVELS = ["Fresher", "Junior", "Mid", "Senior"];

function toDateInputValue(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().slice(0, 10);
}

function JobEditorPage() {
  const { jobId } = useParams();
  const isEditMode = Boolean(jobId);
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const { auth, refreshJobs } = useAppData();
  const [companiesState, setCompaniesState] = useState({
    loading: true,
    error: "",
    items: [],
  });
  const [status, setStatus] = useState({ loading: isEditMode, error: "" });
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company: "",
    title: "",
    description: "",
    skillsRequired: "",
    jobType: "Full-Time",
    experienceLevel: "Junior",
    salaryMin: "",
    salaryMax: "",
    location: "",
    isRemote: false,
    lastDateToApply: "",
  });

  const user = auth.user;
  const isRecruiterOrAdmin = user?.role === "recruiter" || user?.role === "admin";

  useEffect(() => {
    let cancelled = false;

    async function loadOwnedCompanies() {
      if (!user?._id || !isRecruiterOrAdmin) {
        setCompaniesState({ loading: false, error: "", items: [] });
        return;
      }
      setCompaniesState((current) => ({ ...current, loading: true, error: "" }));
      try {
        const result = await fetchCompanies(
          user.role === "admin" ? {} : { owner: user._id },
        );
        const companies = Array.isArray(result?.data?.companies)
          ? result.data.companies
          : [];
        if (!cancelled) {
          setCompaniesState({ loading: false, error: "", items: companies });
          setForm((current) => ({
            ...current,
            company: current.company || companies[0]?._id || "",
          }));
        }
      } catch (error) {
        if (!cancelled) {
          setCompaniesState({
            loading: false,
            error: error.message || "Unable to load companies.",
            items: [],
          });
        }
      }
    }

    if (auth.status === "ready") {
      loadOwnedCompanies();
    }

    return () => {
      cancelled = true;
    };
  }, [auth.status, isRecruiterOrAdmin, user?._id, user?.role]);

  useEffect(() => {
    let cancelled = false;

    async function loadJob() {
      if (!isEditMode) {
        setStatus({ loading: false, error: "" });
        return;
      }
      setStatus({ loading: true, error: "" });
      try {
        const result = await fetchJobById(jobId);
        const job = result?.data?.job ?? result?.data;
        if (!job) {
          throw new Error("Job not found.");
        }
        if (!cancelled) {
          setForm((current) => ({
            ...current,
            company: job.company?._id || job.company || "",
            title: job.title || "",
            description: job.description || "",
            skillsRequired: Array.isArray(job.skillsRequired)
              ? job.skillsRequired.join(", ")
              : "",
            jobType: job.jobType || "Full-Time",
            experienceLevel: job.experienceLevel || "Junior",
            salaryMin: job.salaryRange?.min != null ? String(job.salaryRange.min) : "",
            salaryMax: job.salaryRange?.max != null ? String(job.salaryRange.max) : "",
            location: job.location || "",
            isRemote: Boolean(job.isRemote),
            lastDateToApply: toDateInputValue(job.lastDateToApply),
          }));
          setStatus({ loading: false, error: "" });
        }
      } catch (error) {
        if (!cancelled) {
          setStatus({
            loading: false,
            error: error.message || "Failed to load job.",
          });
        }
      }
    }

    if (auth.status === "ready") {
      loadJob();
    }

    return () => {
      cancelled = true;
    };
  }, [auth.status, isEditMode, jobId]);

  const skillsArray = useMemo(
    () =>
      form.skillsRequired
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [form.skillsRequired],
  );

  if (auth.status === "loading") {
    return (
      <section className="section-block">
        <div className="page-loading">
          <div className="loading-spinner" aria-hidden />
          <p>Loading your session…</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isRecruiterOrAdmin) {
    return (
      <section className="section-block">
        <EmptyState
          title="Recruiter access required"
          description="Only recruiters and admins can create or update jobs."
        />
      </section>
    );
  }

  if (status.loading || companiesState.loading) {
    return (
      <section className="section-block">
        <div className="page-loading">
          <div className="loading-spinner" aria-hidden />
          <p>{isEditMode ? "Loading job…" : "Loading companies…"}</p>
        </div>
      </section>
    );
  }

  if (status.error) {
    return (
      <section className="section-block">
        <EmptyState title="Cannot edit this job" description={status.error} />
      </section>
    );
  }

  if (companiesState.error) {
    return (
      <section className="section-block">
        <EmptyState title="Cannot load companies" description={companiesState.error} />
      </section>
    );
  }

  if (!companiesState.items.length) {
    return (
      <section className="section-block">
        <EmptyState
          title="No company available"
          description="Create a company profile first, then you can post jobs."
        />
        <p style={{ marginTop: "1rem" }}>
          <Link className="secondary-button" style={{ display: "inline-flex" }} to="/companies">
            Go to companies
          </Link>
        </p>
      </section>
    );
  }

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    const salaryMin = form.salaryMin.trim() ? Number(form.salaryMin) : null;
    const salaryMax = form.salaryMax.trim() ? Number(form.salaryMax) : null;

    if ((salaryMin != null && Number.isNaN(salaryMin)) || (salaryMax != null && Number.isNaN(salaryMax))) {
      pushToast("Salary must be numeric.", "error");
      return;
    }
    if (salaryMin != null && salaryMax != null && salaryMin > salaryMax) {
      pushToast("Minimum salary cannot be greater than maximum salary.", "error");
      return;
    }

    const payload = {
      company: form.company,
      title: form.title.trim(),
      description: form.description.trim(),
      skillsRequired: skillsArray,
      jobType: form.jobType,
      experienceLevel: form.experienceLevel,
      location: form.location.trim(),
      isRemote: form.isRemote,
      lastDateToApply: form.lastDateToApply,
    };

    if (salaryMin != null || salaryMax != null) {
      payload.salaryRange = {
        ...(salaryMin != null ? { min: salaryMin } : {}),
        ...(salaryMax != null ? { max: salaryMax } : {}),
      };
    }

    setSaving(true);
    try {
      const result = isEditMode
        ? await updateJob(jobId, payload)
        : await createJob(payload);
      const savedJob = result?.data?.job ?? result?.data;
      await refreshJobs();
      pushToast(
        isEditMode ? "Job updated successfully." : "Job created successfully.",
        "success",
      );
      if (savedJob?._id) {
        navigate(`/jobs/${savedJob._id}`);
      } else {
        navigate("/jobs");
      }
    } catch (error) {
      pushToast(error.message || "Could not save job.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section-block">
      <div className="detail-hero">
        <p className="surface-label">{isEditMode ? "Update job" : "Post a new role"}</p>
        <h1>{isEditMode ? "Edit job" : "Create job"}</h1>
        <p className="lead">
          {isEditMode
            ? "Update role details, eligibility, and application deadline."
            : "Add a role for one of your companies and publish it instantly."}
        </p>
      </div>

      <form className="panel auth-form" onSubmit={onSubmit}>
        <div className="input-group">
          <label htmlFor="company">Company</label>
          <select
            id="company"
            name="company"
            onChange={onChange}
            required
            value={form.company}
          >
            {companiesState.items.map((company) => (
              <option key={company._id} value={company._id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="title">Job title</label>
          <input
            id="title"
            name="title"
            onChange={onChange}
            placeholder="Frontend Engineer"
            required
            value={form.title}
          />
        </div>

        <div className="input-group">
          <label htmlFor="description">Description</label>
          <textarea
            className="textarea-input"
            id="description"
            name="description"
            onChange={onChange}
            placeholder="Role summary, responsibilities, and requirements."
            required
            rows={6}
            value={form.description}
          />
        </div>

        <div className="filter-grid">
          <div className="input-group">
            <label htmlFor="jobType">Job type</label>
            <select id="jobType" name="jobType" onChange={onChange} required value={form.jobType}>
              {JOB_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="experienceLevel">Experience level</label>
            <select
              id="experienceLevel"
              name="experienceLevel"
              onChange={onChange}
              required
              value={form.experienceLevel}
            >
              {LEVELS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="lastDateToApply">Last date to apply</label>
            <input
              id="lastDateToApply"
              name="lastDateToApply"
              onChange={onChange}
              required
              type="date"
              value={form.lastDateToApply}
            />
          </div>

          <div className="input-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              onChange={onChange}
              placeholder="Bengaluru, India"
              value={form.location}
            />
          </div>
        </div>

        <div className="filter-grid">
          <div className="input-group">
            <label htmlFor="salaryMin">Salary min</label>
            <input
              id="salaryMin"
              inputMode="numeric"
              name="salaryMin"
              onChange={onChange}
              placeholder="600000"
              type="number"
              value={form.salaryMin}
            />
          </div>
          <div className="input-group">
            <label htmlFor="salaryMax">Salary max</label>
            <input
              id="salaryMax"
              inputMode="numeric"
              name="salaryMax"
              onChange={onChange}
              placeholder="1200000"
              type="number"
              value={form.salaryMax}
            />
          </div>
          <div className="input-group">
            <label htmlFor="skillsRequired">Skills (comma separated)</label>
            <input
              id="skillsRequired"
              name="skillsRequired"
              onChange={onChange}
              placeholder="React, Node.js, MongoDB"
              value={form.skillsRequired}
            />
          </div>
          <div className="input-group">
            <label htmlFor="isRemote">Remote</label>
            <select
              id="isRemote"
              name="isRemote"
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  isRemote: e.target.value === "true",
                }))
              }
              value={String(form.isRemote)}
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>

        <div className="inline-actions">
          <button className="primary-button" disabled={saving} type="submit">
            {saving ? "Saving…" : isEditMode ? "Update job" : "Create job"}
          </button>
          <Link className="secondary-button" style={{ display: "inline-flex" }} to="/jobs">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}

export { JobEditorPage };
