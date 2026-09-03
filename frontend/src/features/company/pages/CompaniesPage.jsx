import { Link } from "react-router-dom";
import { Building2, Plus, RefreshCcw } from "lucide-react";
import { CompanyCard } from "../components/CompanyCard.jsx";
import { EmptyState } from "../../../shared/components/EmptyState.jsx";
import { SectionHeader } from "../../../shared/components/SectionHeader.jsx";
import { SkeletonCard } from "../../../shared/components/SkeletonCard.jsx";
import { useAppData } from "../../../store/AppContext.jsx";

function CompaniesPage() {
  const { companies, auth, refreshCompanies } = useAppData();
  const canManageCompanies =
    auth.status === "ready" &&
    (auth.user?.role === "recruiter" || auth.user?.role === "admin");

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Companies"
        title="Hiring organizations"
        description="Employer profiles from the company API."
        action={
          <div className="flex flex-wrap gap-2">
            {canManageCompanies ? (
              <Link
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                to="/companies/new"
              >
                <Plus className="h-4 w-4" />
                Add company
              </Link>
            ) : null}
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              onClick={refreshCompanies}
              type="button"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh companies
            </button>
          </div>
        }
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
          <Building2 className="h-3.5 w-3.5" />
          Directory
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {companies.status === "loading" ? (
            Array.from({ length: 6 }).map((_, idx) => <SkeletonCard key={idx} />)
          ) : companies.items.length ? (
            companies.items.map((company) => <CompanyCard company={company} key={company._id || company.name} />)
          ) : (
            <div className="md:col-span-2">
              <EmptyState
                title="No companies found"
                description={companies.message || "The companies endpoint returned an empty list."}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export { CompaniesPage };
