import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Building2,
  FileCheck2,
  Bookmark,
  PlusCircle,
  Upload,
  Link2,
  ExternalLink,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Award,
  RefreshCw,
  UserCircle
} from "lucide-react";
import { verifyCompanyAsAdmin } from "../../company/api/companies.js";
import {
  uploadUserResume,
  importResumeFromDrive,
  updateApplicationStatus,
  withdrawApplication
} from "../api/applications.js";
import { EmptyState } from "../../../shared/components/EmptyState.jsx";
import { LoadingState } from "../../../shared/components/LoadingState.jsx";
import { SectionHeader } from "../../../shared/components/SectionHeader.jsx";
import { StatusBadge } from "../../../shared/components/StatusBadge.jsx";
import { useAppData } from "../../../store/AppContext.jsx";
import { useToast } from "../../../store/ToastContext.jsx";
import { formatDate } from "../../../shared/utils/formatters.js";

const RECRUITER_STATUS_OPTIONS = ["Applied", "Shortlisted", "Rejected", "Hired"];

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
  const [activeTab, setActiveTab] = useState("overview");
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeDriveUrl, setResumeDriveUrl] = useState("");
  const [resumeUploading, setResumeUploading] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [selectedCandidateApp, setSelectedCandidateApp] = useState(null);

  const user = auth.user;
  const role = user?.role || "jobseeker";
  const isRecruiter = role === "recruiter";
  const isAdmin = role === "admin";
  const isSeeker = role === "jobseeker" || (!isRecruiter && !isAdmin);

  const myCompanies = useMemo(() => {
    if (!user?._id) return [];
    return companies.items.filter((company) => {
      const ownerId = company.owner?._id || company.owner;
      return ownerId && String(ownerId) === String(user._id);
    });
  }, [companies.items, user?._id]);

  const myJobs = useMemo(() => {
    if (!user?._id) return [];
    return jobs.items.filter((job) => {
      const ownerId = job.company?.owner?._id || job.company?.owner;
      return ownerId && String(ownerId) === String(user._id);
    });
  }, [jobs.items, user?._id]);

  const pendingCompanies = useMemo(
    () => companies.items.filter((company) => !company.isVerified),
    [companies.items]
  );

  const pendingAppsCount = useMemo(
    () => applications.items.filter((app) => app.status === "Applied").length,
    [applications.items]
  );

  const shortlistedAppsCount = useMemo(
    () => applications.items.filter((app) => app.status === "Shortlisted" || app.status === "Hired").length,
    [applications.items]
  );

  const profileCompletenessScore = useMemo(() => {
    let score = 30; // base score for account creation
    if (user?.fullName) score += 20;
    if (user?.email) score += 20;
    if (user?.resume?.url) score += 30;
    return score;
  }, [user]);

  const handleStatusChange = async (appId, newStatus) => {
    setStatusUpdatingId(appId);
    try {
      await updateApplicationStatus(appId, newStatus);
      pushToast(`Candidate status updated to '${newStatus}'.`, "success");
      await refreshApplications();
    } catch (err) {
      pushToast(err.message || "Failed to update status.", "error");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleWithdrawApplication = async (appId) => {
    if (!window.confirm("Are you sure you want to withdraw this application?")) return;
    try {
      await withdrawApplication(appId);
      pushToast("Application withdrawn successfully.", "success");
      await refreshApplications();
    } catch (err) {
      pushToast(err.message || "Failed to withdraw application.", "error");
    }
  };

  const handleUploadResume = async (e) => {
    e.preventDefault();
    if (!resumeFile && !resumeDriveUrl.trim()) {
      pushToast("Select a file or paste a Google Drive URL.", "info");
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
      e.target.reset();
      pushToast("Resume updated successfully!", "success");
    } catch (err) {
      pushToast(err.message || "Failed to upload resume.", "error");
    } finally {
      setResumeUploading(false);
    }
  };

  const handleVerifyCompany = async (companyId) => {
    try {
      await verifyCompanyAsAdmin(companyId);
      await refreshCompanies();
      pushToast("Company verified.", "success");
    } catch (err) {
      pushToast(err.message || "Failed to verify company.", "error");
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER HERO */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 font-extrabold text-2xl">
              <UserCircle className="h-10 w-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">
                  {user?.fullName || user?.username || "Dashboard"}
                </h1>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase text-blue-700 border border-blue-100">
                  {role}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isRecruiter && (
              <>
                <Link
                  to="/jobs/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  <PlusCircle className="h-4 w-4" /> Post New Job
                </Link>
                <Link
                  to="/companies/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200"
                >
                  <Building2 className="h-4 w-4" /> Add Company
                </Link>
              </>
            )}
            {isSeeker && (
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
              >
                <Briefcase className="h-4 w-4" /> Find Jobs
              </Link>
            )}
            <button
              onClick={() => {
                refreshApplications();
                refreshSavedJobs();
                refreshJobs();
              }}
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>

        {/* PROFILE COMPLETENESS FOR JOB SEEKERS */}
        {isSeeker && (
          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Profile Completion</span>
              <span>{profileCompletenessScore}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                style={{ width: `${profileCompletenessScore}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* OVERVIEW STATS CARDS */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isRecruiter ? (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-500">Posted Jobs</p>
              <h3 className="mt-1 text-2xl font-extrabold text-slate-900">{myJobs.length}</h3>
              <p className="mt-2 text-xs text-slate-500">Open listings</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-500">Total Applicants</p>
              <h3 className="mt-1 text-2xl font-extrabold text-slate-900">{applications.items.length}</h3>
              <p className="mt-2 text-xs text-slate-500">Submitted profiles</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-500">Pending Review</p>
              <h3 className="mt-1 text-2xl font-extrabold text-amber-600">{pendingAppsCount}</h3>
              <p className="mt-2 text-xs text-slate-500">Requires action</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-500">Shortlisted / Hired</p>
              <h3 className="mt-1 text-2xl font-extrabold text-emerald-600">{shortlistedAppsCount}</h3>
              <p className="mt-2 text-xs text-slate-500">Passed initial screening</p>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-500">Applied Jobs</p>
              <h3 className="mt-1 text-2xl font-extrabold text-slate-900">{applications.items.length}</h3>
              <p className="mt-2 text-xs text-slate-500">Total submitted</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-500">Saved Jobs</p>
              <h3 className="mt-1 text-2xl font-extrabold text-slate-900">{savedJobs.items.length}</h3>
              <p className="mt-2 text-xs text-slate-500">Bookmarked listings</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-500">Under Review</p>
              <h3 className="mt-1 text-2xl font-extrabold text-amber-600">{pendingAppsCount}</h3>
              <p className="mt-2 text-xs text-slate-500">Pending employer decision</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-500">Shortlisted</p>
              <h3 className="mt-1 text-2xl font-extrabold text-purple-600">{shortlistedAppsCount}</h3>
              <p className="mt-2 text-xs text-slate-500">Invited or hired</p>
            </div>
          </>
        )}
      </section>

      {/* DASHBOARD TABS & MAIN CONTENT */}
      <section className="space-y-6">
        {/* TAB NAVIGATION */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`border-b-2 px-5 py-3 text-sm font-bold transition ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {isRecruiter ? "Applications Management" : "My Applications"}
          </button>
          {isSeeker && (
            <button
              onClick={() => setActiveTab("saved")}
              className={`border-b-2 px-5 py-3 text-sm font-bold transition ${
                activeTab === "saved"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Saved Jobs ({savedJobs.items.length})
            </button>
          )}
          {isSeeker && (
            <button
              onClick={() => setActiveTab("resume")}
              className={`border-b-2 px-5 py-3 text-sm font-bold transition ${
                activeTab === "resume"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Manage Resume
            </button>
          )}
          {isRecruiter && (
            <button
              onClick={() => setActiveTab("my-jobs")}
              className={`border-b-2 px-5 py-3 text-sm font-bold transition ${
                activeTab === "my-jobs"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              My Posted Jobs ({myJobs.length})
            </button>
          )}
        </div>

        {/* TAB: APPLICATIONS TABLE / LIST */}
        {activeTab === "overview" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              eyebrow={isRecruiter ? "Candidates" : "Submissions"}
              title={isRecruiter ? "Candidate Application Management" : "Applied Jobs Status"}
              description={
                isRecruiter
                  ? "Review applicants for your posted positions and update their hiring stage."
                  : "Track the status of positions you've applied to."
              }
            />

            {applications.status === "loading" ? (
              <LoadingState message="Fetching application records..." />
            ) : applications.items.length ? (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3.5">Job Position</th>
                      {isRecruiter && <th className="px-4 py-3.5">Candidate</th>}
                      <th className="px-4 py-3.5">Applied Date</th>
                      <th className="px-4 py-3.5">Resume</th>
                      <th className="px-4 py-3.5">Current Status</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {applications.items.map((app) => {
                      const job = app.job;
                      const jobId = job?._id || job;
                      const jobTitle = job?.title || "Position";
                      const candidateName = app.applicant?.fullName || app.applicant?.username || app.applicant?.email || "Candidate";

                      return (
                        <tr key={app._id} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-4">
                            <span className="font-bold text-slate-900 block">{jobTitle}</span>
                            <span className="text-xs text-slate-500">{job?.company?.name || "Company"}</span>
                          </td>

                          {isRecruiter && (
                            <td className="px-4 py-4">
                              <span className="font-semibold text-slate-900 block">{candidateName}</span>
                              <span className="text-xs text-slate-500">{app.applicant?.email}</span>
                            </td>
                          )}

                          <td className="px-4 py-4 text-xs font-semibold text-slate-500">
                            {formatDate(app.createdAt)}
                          </td>

                          <td className="px-4 py-4">
                            {app.resume?.url ? (
                              <a
                                href={app.resume.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                              >
                                View Resume <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400">Not provided</span>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            {isRecruiter ? (
                              <select
                                value={app.status || "Applied"}
                                disabled={statusUpdatingId === app._id}
                                onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none transition focus:border-blue-500"
                              >
                                {RECRUITER_STATUS_OPTIONS.map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <StatusBadge status={app.status || "Applied"} />
                            )}
                          </td>

                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {jobId && (
                                <Link
                                  to={`/jobs/${jobId}`}
                                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                  title="View Job"
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                              )}
                              {isSeeker && (
                                <button
                                  onClick={() => handleWithdrawApplication(app._id)}
                                  className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                                  title="Withdraw Application"
                                  type="button"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title={isRecruiter ? "No Applications Received" : "No Applications Submitted"}
                description={
                  isRecruiter
                    ? "Candidates applying for your posted jobs will appear in this table."
                    : "You haven't applied for any jobs yet. Browse listings to apply!"
                }
              />
            )}
          </div>
        )}

        {/* TAB: SAVED JOBS */}
        {activeTab === "saved" && isSeeker && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <SectionHeader
              eyebrow="Bookmarks"
              title="Saved Job Listings"
              description="Access jobs you've saved for future application."
            />
            {savedJobs.items.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {savedJobs.items.map((entry) => {
                  const job = entry.job;
                  const jid = job?._id || job;
                  return (
                    <div
                      key={entry._id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 shadow-sm"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900">{job?.title || "Job Listing"}</h4>
                        <p className="text-xs text-slate-500">{job?.company?.name || "Company"}</p>
                      </div>
                      {jid && (
                        <Link
                          to={`/jobs/${jid}`}
                          className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-600"
                        >
                          View & Apply
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No Saved Jobs"
                description="Click the bookmark icon on any job card to save it here."
              />
            )}
          </div>
        )}

        {/* TAB: MANAGE RESUME */}
        {activeTab === "resume" && isSeeker && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 max-w-xl">
            <SectionHeader
              eyebrow="Profile Document"
              title="Manage Your Resume"
              description="Upload your default resume file or Google Drive URL to use for quick applications."
            />

            {user?.resume?.url ? (
              <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="flex items-center gap-3">
                  <FileCheck2 className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-xs font-bold uppercase text-blue-800">Current Saved Resume</p>
                    <a
                      href={user.resume.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-bold text-blue-700 hover:underline"
                    >
                      {user.resume.originalName || "View Resume PDF"}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No resume attached to profile yet.</p>
            )}

            <form onSubmit={handleUploadResume} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1">
                  <Upload className="h-4 w-4 text-blue-600" /> Upload Resume File
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-blue-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1">
                  <Link2 className="h-4 w-4 text-blue-600" /> Or Paste Google Drive Link
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={resumeDriveUrl}
                  onChange={(e) => setResumeDriveUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={resumeUploading}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
              >
                {resumeUploading ? "Saving Resume..." : "Save Resume to Profile"}
              </button>
            </form>
          </div>
        )}

        {/* TAB: RECRUITER POSTED JOBS */}
        {activeTab === "my-jobs" && isRecruiter && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <SectionHeader
              eyebrow="Listings"
              title="Your Posted Jobs"
              description="Manage open positions posted by your registered companies."
            />

            {myJobs.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {myJobs.map((j) => (
                  <div
                    key={j._id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">{j.title}</h4>
                      <p className="text-xs font-semibold text-slate-500">{j.company?.name || "Company"}</p>
                      <p className="mt-2 text-xs text-slate-600">Apply by: {formatDate(j.lastDateToApply)}</p>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <Link
                        to={`/jobs/${j._id}`}
                        className="flex-1 rounded-xl bg-slate-900 py-2 text-center text-xs font-bold text-white transition hover:bg-blue-600"
                      >
                        View Listing
                      </Link>
                      <Link
                        to={`/jobs/${j._id}/edit`}
                        className="flex-1 rounded-xl bg-slate-100 py-2 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-200"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No Jobs Posted Yet" description="Create your first job listing to receive applications." />
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export { DashboardPage };
