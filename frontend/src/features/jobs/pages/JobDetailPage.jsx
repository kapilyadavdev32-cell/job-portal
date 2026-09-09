import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Bookmark,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  MapPin,
  PenSquare,
  Trash2,
  Send,
  ArrowLeft,
  DollarSign,
  Briefcase,
  X,
  Share2,
  FileText,
  Upload,
  Link2
} from "lucide-react";
import { createApplication } from "../../applications/api/applications.js";
import { deleteJob, fetchJobById } from "../api/jobs.js";
import { removeSavedJob, saveJobForUser } from "../api/savedJobs.js";
import { EmptyState } from "../../../shared/components/EmptyState.jsx";
import { LoadingState } from "../../../shared/components/LoadingState.jsx";
import { SectionHeader } from "../../../shared/components/SectionHeader.jsx";
import { useToast } from "../../../store/ToastContext.jsx";
import { useAppData } from "../../../store/AppContext.jsx";
import { formatDate } from "../../../shared/utils/formatters.js";

function JobDetailPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { auth, savedJobs, applications, refreshSavedJobs, refreshApplications, refreshSession } = useAppData();
  const { pushToast } = useToast();

  const [job, setJob] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({ resumeFile: null, resumeDriveUrl: "", coverLetter: "" });
  const [applyLoading, setApplyLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStatus({ loading: true, error: "" });
      try {
        const result = await fetchJobById(jobId);
        const j = result?.data?.job ?? result?.data;
        if (!cancelled) {
          setJob(j || null);
          setStatus({ loading: false, error: j ? "" : "Job listing not found." });
        }
      } catch (e) {
        if (!cancelled) {
          setJob(null);
          setStatus({ loading: false, error: e.message || "Failed to fetch job details." });
        }
      }
    }
    if (jobId) load();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const savedEntry = useMemo(() => {
    if (!job?._id || savedJobs.status !== "ready") return null;
    return savedJobs.items.find(
      (s) => String(s.job?._id || s.job) === String(job._id)
    );
  }, [job, savedJobs]);

  const existingApplication = useMemo(() => {
    if (!job?._id || applications.status !== "ready") return null;
    return applications.items.find(
      (app) => String(app.job?._id || app.job) === String(job._id)
    );
  }, [job, applications]);

  const isSeeker = auth.user?.role === "jobseeker" || (!auth.user?.role && auth.user);

  const handleSaveToggle = async () => {
    if (!auth.user) {
      pushToast("Please sign in to save jobs.", "info");
      navigate("/auth");
      return;
    }
    try {
      if (savedEntry) {
        await removeSavedJob(savedEntry._id);
        pushToast("Removed job from saved list.", "success");
      } else {
        await saveJobForUser(job._id);
        pushToast("Job saved to your profile!", "success");
      }
      await refreshSavedJobs();
    } catch (e) {
      pushToast(e.message || "Could not update saved jobs.", "error");
    }
  };

  const handleApplySubmit = async (event) => {
    event.preventDefault();
    if (!auth.user) {
      pushToast("Please sign in to apply for this job.", "info");
      navigate("/auth");
      return;
    }
    if (existingApplication) {
      pushToast("You have already applied for this job listing.", "info");
      return;
    }
    if (!applyForm.resumeFile && !applyForm.resumeDriveUrl.trim() && !auth.user?.resume?.url) {
      pushToast("Please attach a resume file, enter a Google Drive link, or update your profile resume.", "info");
      return;
    }

    setApplyLoading(true);
    try {
      await createApplication({
        job: job._id,
        coverLetter: applyForm.coverLetter.trim() || undefined,
        resumeFile: applyForm.resumeFile || undefined,
        resumeDriveUrl: applyForm.resumeDriveUrl.trim() || undefined,
      });
      pushToast("Application submitted successfully!", "success");
      setApplyModalOpen(false);
      setApplyForm({ resumeFile: null, resumeDriveUrl: "", coverLetter: "" });
      await Promise.all([refreshApplications(), refreshSession()]);
    } catch (e) {
      pushToast(e.message || "Application submission failed.", "error");
    } finally {
      setApplyLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!job?._id || !canEditJob || deleteLoading) return;
    if (!window.confirm("Are you sure you want to delete this job posting permanently?")) return;

    setDeleteLoading(true);
    try {
      await deleteJob(job._id);
      pushToast("Job deleted successfully.", "success");
      navigate("/jobs", { replace: true });
    } catch (e) {
      pushToast(e.message || "Failed to delete job listing.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (status.loading) {
    return <LoadingState message="Loading job listing details..." height="min-h-[400px]" />;
  }

  if (status.error || !job) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Job Listing Unavailable"
          description={status.error || "This position may have expired or been removed."}
        />
        <div>
          <Link
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            to="/jobs"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const company = job.company;
  const companyId = company?._id || company;
  const ownerId = company?.owner?._id || company?.owner;
  const canEditJob =
    auth.status === "ready" &&
    auth.user &&
    (auth.user.role === "admin" ||
      (auth.user.role === "recruiter" &&
        ownerId &&
        String(ownerId) === String(auth.user._id)));

  const salaryDisplay =
    job.salaryRange?.min != null && job.salaryRange?.max != null
      ? `$${job.salaryRange.min}k - $${job.salaryRange.max}k / year`
      : job.salary || "Salary Negotiable";

  return (
    <div className="space-y-8">
      {/* NAVIGATION BACK LINK */}
      <div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all jobs
        </Link>
      </div>

      {/* JOB HEADER CARD */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            {company?.logo?.url ? (
              <img
                src={company.logo.url}
                alt={company.name}
                className="h-16 w-16 rounded-2xl object-cover border border-slate-100 shadow-sm shrink-0"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 font-extrabold text-2xl shrink-0">
                <Briefcase className="h-8 w-8" />
              </div>
            )}

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-blue-600">
                {job.jobType || "Full-Time"} Position
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 md:text-4xl">{job.title}</h1>
              <p className="flex items-center gap-2 text-base font-semibold text-slate-600">
                <Building2 className="h-4 w-4 text-slate-400" />
                {companyId ? (
                  <Link to={`/companies/${companyId}`} className="text-blue-600 hover:underline">
                    {company?.name || "Company Profile"}
                  </Link>
                ) : (
                  company?.name || "Verified Company"
                )}
                {company?.isVerified && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-100">
                    Verified
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* ACTIONS & APPLY NOW BUTTON */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleSaveToggle}
              type="button"
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                savedEntry
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Bookmark className="h-4 w-4 fill-current" />
              {savedEntry ? "Saved" : "Save Job"}
            </button>

            {existingApplication ? (
              <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-6 py-3 text-sm font-bold text-emerald-700">
                <CheckCircle2 className="h-5 w-5" /> Applied
              </span>
            ) : isSeeker ? (
              <button
                onClick={() => setApplyModalOpen(true)}
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-95"
              >
                <Send className="h-4 w-4" /> Apply Now
              </button>
            ) : null}

            {canEditJob && (
              <div className="flex items-center gap-2">
                <Link
                  to={`/jobs/${job._id}/edit`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  <PenSquare className="h-4 w-4" /> Edit
                </Link>
                <button
                  onClick={handleDeleteJob}
                  disabled={deleteLoading}
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
                >
                  <Trash2 className="h-4 w-4" /> {deleteLoading ? "..." : "Delete"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* QUICK KEY DETAILS BADGES */}
        <div className="mt-8 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Location</p>
              <p className="text-sm font-bold text-slate-800">
                {job.location || (job.isRemote ? "Remote" : "On-site")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Salary</p>
              <p className="text-sm font-bold text-slate-800">{salaryDisplay}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Experience</p>
              <p className="text-sm font-bold text-slate-800">{job.experienceLevel || "Mid Level"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Deadline</p>
              <p className="text-sm font-bold text-slate-800">{formatDate(job.lastDateToApply)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT MAIN & SIDEBAR */}
      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <main className="space-y-8">
          {/* JOB DESCRIPTION */}
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              Job Description
            </h2>
            <p className="whitespace-pre-wrap text-base leading-8 text-slate-700 font-normal">
              {job.description}
            </p>
          </article>

          {/* REQUIRED SKILLS */}
          {job.skillsRequired?.length > 0 && (
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                Required Skills & Tech Stack
              </h2>
              <div className="flex flex-wrap gap-2 pt-2">
                {job.skillsRequired.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-2 text-sm font-bold text-blue-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          )}
        </main>

        {/* SIDEBAR COMPANY CARD */}
        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              About the Company
            </h3>

            <div className="flex items-center gap-3">
              {company?.logo?.url ? (
                <img
                  src={company.logo.url}
                  alt={company.name}
                  className="h-12 w-12 rounded-xl object-cover border border-slate-100"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold">
                  <Building2 className="h-6 w-6" />
                </div>
              )}
              <div>
                <h4 className="font-bold text-slate-900">{company?.name || "Employer"}</h4>
                <p className="text-xs text-slate-500">{company?.location || "Global"}</p>
              </div>
            </div>

            {company?.description && (
              <p className="text-xs leading-6 text-slate-600 line-clamp-4">
                {company.description}
              </p>
            )}

            {companyId && (
              <Link
                to={`/companies/${companyId}`}
                className="block w-full rounded-xl bg-slate-100 py-3 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-200"
              >
                View Full Company Profile
              </Link>
            )}
          </div>
        </aside>
      </div>

      {/* APPLY FORM MODAL */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Apply for Position</h3>
                <p className="text-xs text-slate-500">{job.title} at {company?.name || "Company"}</p>
              </div>
              <button
                onClick={() => setApplyModalOpen(false)}
                type="button"
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1">
                  <Upload className="h-4 w-4 text-blue-600" /> Resume File (PDF, DOCX)
                </label>
                {auth.user?.resume?.url && (
                  <p className="text-xs text-slate-500 bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                    Saved default resume detected. Upload below to override for this application.
                  </p>
                )}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) =>
                    setApplyForm((f) => ({ ...f, resumeFile: e.target.files?.[0] || null }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-blue-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1">
                  <Link2 className="h-4 w-4 text-blue-600" /> Or Google Drive Link
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={applyForm.resumeDriveUrl}
                  onChange={(e) => setApplyForm((f) => ({ ...f, resumeDriveUrl: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1">
                  <FileText className="h-4 w-4 text-blue-600" /> Cover Letter
                </label>
                <textarea
                  rows={4}
                  placeholder="Introduce yourself and explain why you're a great fit..."
                  value={applyForm.coverLetter}
                  onChange={(e) => setApplyForm((f) => ({ ...f, coverLetter: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="w-1/2 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applyLoading}
                  className="w-1/2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {applyLoading ? "Submitting..." : "Confirm Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export { JobDetailPage };
