import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, BriefcaseBusiness, Sparkles } from "lucide-react";
import { CompanyCard } from "../../company/components/CompanyCard.jsx";
import { JobCard } from "../../jobs/components/JobCard.jsx";
import { EmptyState } from "../../../shared/components/EmptyState.jsx";
import { SectionHeader } from "../../../shared/components/SectionHeader.jsx";
import { SkeletonCard } from "../../../shared/components/SkeletonCard.jsx";
import { StatsCard } from "../../../shared/components/StatsCard.jsx";
import { useAppData } from "../../../store/AppContext.jsx";

function HomePage() {
  const navigate = useNavigate();
  const { health, jobs, companies } = useAppData();

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-700 via-blue-600 to-sky-600 px-6 py-10 text-white shadow-xl md:px-10">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" aria-hidden />
        <div className="absolute -bottom-16 left-16 h-56 w-56 rounded-full bg-sky-300/20 blur-2xl" aria-hidden />
        <div className="relative space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
            <Sparkles className="h-3.5 w-3.5" />
            Hire and get hired
          </p>
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight md:text-5xl">
            Find your next role or your next standout teammate.
          </h1>
          <p className="max-w-2xl text-sm text-blue-50/95 md:text-base">
            Explore curated job listings, trusted employers, and a smooth candidate experience in one clean
            workspace inspired by top hiring platforms.
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-white/15 px-3 py-1">Browse &amp; filter</span>
            <span className="rounded-full bg-white/15 px-3 py-1">Save &amp; apply</span>
            <span className="rounded-full bg-white/15 px-3 py-1">Track progress</span>
          </div>
        </div>
        <div className="relative mt-7 flex flex-wrap gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            onClick={() => navigate("/jobs")}
            type="button"
          >
            <BriefcaseBusiness className="h-4 w-4" />
            Explore jobs
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-blue-900/30 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-900/45"
            onClick={() => navigate("/companies")}
            type="button"
          >
            <Building2 className="h-4 w-4" />
            Browse companies
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            eyebrow="Jobs"
            title="Latest roles"
            description="A live slice of the jobs feed—open a card for the full description and apply flow."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.status === "loading" ? (
              Array.from({ length: 4 }).map((_, idx) => <SkeletonCard key={idx} />)
            ) : jobs.items.length ? (
              jobs.items.slice(0, 4).map((job) => <JobCard job={job} key={job._id || job.id || job.title} />)
            ) : (
              <EmptyState
                title="No jobs available"
                description={jobs.message || "Start the backend and add jobs to populate this section."}
              />
            )}
          </div>
          {jobs.items.length ? (
            <p className="mt-4">
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                onClick={() => navigate("/jobs")}
                type="button"
              >
                View all jobs
                <ArrowRight className="h-4 w-4" />
              </button>
            </p>
          ) : null}
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            eyebrow="Companies"
            title="Employer directory"
            description="Explore company pages and their open positions."
          />
          <div className="grid gap-4">
            {companies.status === "loading" ? (
              Array.from({ length: 3 }).map((_, idx) => <SkeletonCard key={idx} />)
            ) : companies.items.length ? (
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
    </div>
  );
}

export { HomePage };
