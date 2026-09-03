import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BadgeCheck, Globe2, MapPin, PenSquare, ShieldCheck, Trash2 } from "lucide-react";
import { deleteCompany, fetchCompanyById, verifyCompanyAsAdmin } from "../api/companies.js";
import { fetchJobs } from "../../jobs/api/jobs.js";
import { EmptyState } from "../../../shared/components/EmptyState.jsx";
import { SectionHeader } from "../../../shared/components/SectionHeader.jsx";
import { JobCard } from "../../jobs/components/JobCard.jsx";
import { extractJobs } from "../../../shared/utils/normalizers.js";
import { useAppData } from "../../../store/AppContext.jsx";
import { useToast } from "../../../store/ToastContext.jsx";

function CompanyDetailPage() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { auth, refreshCompanies } = useAppData();
  const { pushToast } = useToast();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [verifying, setVerifying] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
  const ownerId = company?.owner?._id || company?.owner;
  const canEditCompany =
    auth.status === "ready" &&
    auth.user &&
    (auth.user.role === "admin" ||
      (auth.user.role === "recruiter" &&
        ownerId &&
        String(ownerId) === String(auth.user._id)));
  const canVerifyCompany =
    auth.status === "ready" &&
    auth.user?.role === "admin" &&
    company &&
    !company.isVerified;

  const handleVerifyCompany = async () => {
    if (!company?._id || !canVerifyCompany) {
      return;
    }
    setVerifying(true);
    try {
      const result = await verifyCompanyAsAdmin(company._id);
      const updatedCompany = result?.data?.company ?? null;
      if (updatedCompany) {
        setCompany(updatedCompany);
      } else {
        setCompany((current) => (current ? { ...current, isVerified: true } : current));
      }
      await refreshCompanies();
      pushToast("Company verified successfully.", "success");
    } catch (error) {
      pushToast(error.message || "Failed to verify company.", "error");
    } finally {
      setVerifying(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!company?._id || !canEditCompany || deleteLoading) {
      return;
    }
    const confirmed = window.confirm(
      "Delete this company permanently? This may impact jobs linked to it.",
    );
    if (!confirmed) {
      return;
    }
    setDeleteLoading(true);
    try {
      await deleteCompany(company._id);
      await refreshCompanies();
      pushToast("Company deleted successfully.", "success");
      navigate("/companies", { replace: true });
    } catch (error) {
      pushToast(error.message || "Failed to delete company.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (status.loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-4 animate-pulse">
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="h-8 w-1/3 rounded bg-slate-200" />
          <div className="h-4 w-1/4 rounded bg-slate-100" />
          <div className="h-28 rounded-2xl bg-slate-100" />
        </div>
      </section>
    );
  }

  if (status.error || !company) {
    return (
      <section className="space-y-4">
        <EmptyState title="Company unavailable" description={status.error} />
        <p>
          <Link
            className="inline-flex items-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            to="/companies"
          >
            Back to companies
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Company</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">{title}</h1>
        <p className="mt-2 inline-flex items-center gap-1 text-slate-600">
          <MapPin className="h-4 w-4 text-slate-500" />
          {company.location || "Location not specified"}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
              company.isVerified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            }`}
          >
            <BadgeCheck className="h-3.5 w-3.5" />
            {company.isVerified ? "Verified" : "Pending verification"}
          </span>
          {company.website ? (
            <a
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
              href={company.website}
              rel="noreferrer"
              target="_blank"
            >
              <Globe2 className="h-3.5 w-3.5" />
              Website
            </a>
          ) : null}
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
          {company.description || "No description provided."}
        </p>
        {canEditCompany ? (
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              to={`/companies/${company._id}/edit`}
            >
              <PenSquare className="h-4 w-4" />
              Edit company
            </Link>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-rose-100 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={deleteLoading}
              onClick={handleDeleteCompany}
              type="button"
            >
              <Trash2 className="h-4 w-4" />
              {deleteLoading ? "Deleting..." : "Delete company"}
            </button>
            {canVerifyCompany ? (
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={verifying}
                onClick={handleVerifyCompany}
                type="button"
              >
                <ShieldCheck className="h-4 w-4" />
                {verifying ? "Verifying..." : "Verify company"}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <SectionHeader
        eyebrow="Openings"
        title={`Roles at ${title}`}
        description="Positions linked to this employer in the database."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {jobs.length ? (
          jobs.map((job) => <JobCard job={job} key={job._id || job.title} />)
        ) : (
          <div className="md:col-span-2">
            <EmptyState title="No open roles" description="Check back later for new listings." />
          </div>
        )}
      </div>
    </section>
  );
}

export { CompanyDetailPage };
