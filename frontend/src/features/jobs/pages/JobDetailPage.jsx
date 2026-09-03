import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { createApplication } from "../../applications/api/applications.js";
import { deleteJob, fetchJobById } from "../api/jobs.js";
import { removeSavedJob, saveJobForUser } from "../api/savedJobs.js";
import { EmptyState } from "../../../shared/components/EmptyState.jsx";
import { SectionHeader } from "../../../shared/components/SectionHeader.jsx";
import { useToast } from "../../../store/ToastContext.jsx";
import { useAppData } from "../../../store/AppContext.jsx";
import { formatDate, formatJobMeta } from "../../../shared/utils/formatters.js";

function JobDetailPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { auth, savedJobs, refreshSavedJobs, refreshApplications, refreshSession } = useAppData();
  const { pushToast } = useToast();
  const [job, setJob] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: "" });
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
    if (!applyForm.resumeFile && !applyForm.resumeDriveUrl.trim() && !auth.user?.resume?.url) {
      pushToast("Upload a resume, paste a Google Drive link, or save a resume on your dashboard first.", "info");
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
      pushToast("Application submitted.", "success");
      setApplyForm({ resumeFile: null, resumeDriveUrl: "", coverLetter: "" });
      await Promise.all([refreshApplications(), refreshSession()]);
    } catch (e) {
      pushToast(e.message || "Application failed.", "error");
    } finally {
      setApplyLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!job?._id || !canEditJob || deleteLoading) {
      return;
    }
    const confirmed = window.confirm("Delete this job permanently?");
    if (!confirmed) {
      return;
    }
    setDeleteLoading(true);
    try {
      await deleteJob(job._id);
      pushToast("Job deleted successfully.", "success");
      navigate("/jobs", { replace: true });
    } catch (e) {
      pushToast(e.message || "Failed to delete job.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (status.loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-4 animate-pulse">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-8 w-1/2 rounded bg-slate-200" />
          <div className="h-4 w-1/3 rounded bg-slate-100" />
          <div className="h-40 rounded-2xl bg-slate-100" />
        </div>
      </section>
    );
  }

  if (status.error || !job) {
    return (
      <section className="space-y-4">
        <EmptyState
          title="Job unavailable"
          description={status.error || "This listing may have been removed."}
        />
        <p>
          <Link
            className="inline-flex items-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            to="/jobs"
          >
            Back to jobs
          </Link>
        </p>
      </section>
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

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Job</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">{job.title}</h1>
        <p className="mt-2 flex items-center gap-1.5 text-slate-600">
          <Building2 className="h-4 w-4 text-slate-500" />
          {company?.name ? (
            <>
              {companyId ? (
                <Link className="font-medium text-blue-700 hover:text-blue-800" to={`/companies/${companyId}`}>
                  {company.name}
                </Link>
              ) : (
                company.name
              )}
            </>
          ) : (
            "Company"
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
          {meta.map((m) => (
            <span className="rounded-full bg-slate-100 px-3 py-1" key={m}>
              {m}
            </span>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            onClick={handleSaveToggle}
            type="button"
          >
            <Bookmark className="h-4 w-4" />
            {savedEntry ? "Saved" : "Save job"}
          </button>
          {canEditJob ? (
            <>
              <Link
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                to={`/jobs/${job._id}/edit`}
              >
                <PenSquare className="h-4 w-4" />
                Edit job
              </Link>
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-rose-100 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={deleteLoading}
                onClick={handleDeleteJob}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
                {deleteLoading ? "Deleting..." : "Delete job"}
              </button>
            </>
          ) : null}
          <Link
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            to="/jobs"
          >
            More openings
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader eyebrow="Overview" title="Description" />
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{job.description}</p>
          {job.skillsRequired?.length ? (
            <>
              <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">Skills</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.skillsRequired.map((s) => (
                  <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700" key={s}>
                    {s}
                  </span>
                ))}
              </div>
            </>
          ) : null}
        </article>

        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
          <h3 className="text-lg font-semibold text-slate-900">Role details</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-3 py-2">
              <span className="inline-flex items-center gap-1 text-slate-500">
                <Clock3 className="h-4 w-4" />
                Type
              </span>
              <strong className="text-slate-800">{job.jobType}</strong>
            </li>
            <li className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-3 py-2">
              <span className="inline-flex items-center gap-1 text-slate-500">
                <CheckCircle2 className="h-4 w-4" />
                Level
              </span>
              <strong className="text-slate-800">{job.experienceLevel}</strong>
            </li>
            <li className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-3 py-2">
              <span className="inline-flex items-center gap-1 text-slate-500">
                <CalendarClock className="h-4 w-4" />
                Apply by
              </span>
              <strong className="text-slate-800">{formatDate(job.lastDateToApply)}</strong>
            </li>
            <li className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-3 py-2">
              <span className="inline-flex items-center gap-1 text-slate-500">
                <MapPin className="h-4 w-4" />
                Remote
              </span>
              <strong className="text-slate-800">{job.isRemote ? "Yes" : "No"}</strong>
            </li>
          </ul>

          {isSeeker && auth.status === "ready" ? (
            <form className="mt-6 space-y-3 border-t border-slate-200 pt-5" onSubmit={handleApply}>
              <h3 className="text-lg font-semibold text-slate-900">Apply</h3>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700" htmlFor="resume-file">
                  Resume (PDF, DOC, DOCX)
                </label>
                {auth.user?.resume?.url ? (
                  <p className="text-xs text-slate-500">
                    Saved resume:{" "}
                    <a
                      className="font-medium text-blue-700 hover:text-blue-800"
                      href={auth.user.resume.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {auth.user.resume.originalName || "View file"}
                    </a>
                    . Upload a new file or paste a Drive link to replace it for this application.
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">Upload a file, or paste a Google Drive link below. Max 5MB.</p>
                )}
                <input
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-blue-700"
                  id="resume-file"
                  onChange={(e) =>
                    setApplyForm((f) => ({ ...f, resumeFile: e.target.files?.[0] || null }))
                  }
                  type="file"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700" htmlFor="resume-drive">
                  Or Google Drive link
                </label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  id="resume-drive"
                  onChange={(e) => setApplyForm((f) => ({ ...f, resumeDriveUrl: e.target.value }))}
                  placeholder="https://drive.google.com/file/d/…"
                  type="url"
                  value={applyForm.resumeDriveUrl}
                />
                <p className="text-xs text-slate-500">
                  Share the file as “Anyone with the link”. Google Docs links are exported as PDF.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700" htmlFor="cover">
                  Cover letter
                </label>
                <textarea
                  id="cover"
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  rows={4}
                  value={applyForm.coverLetter}
                  onChange={(e) => setApplyForm((f) => ({ ...f, coverLetter: e.target.value }))}
                  placeholder="Brief note to the hiring team (optional)"
                />
              </div>
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={applyLoading}
                type="submit"
              >
                <Send className="h-4 w-4" />
                {applyLoading ? "Submitting..." : "Submit application"}
              </button>
            </form>
          ) : (
            <p className="mt-5 text-sm text-slate-600">
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
