import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Building2, Plus, Search, MapPin, CheckCircle2, Globe, ArrowRight } from "lucide-react";
import { CompanyCard } from "../components/CompanyCard.jsx";
import { EmptyState } from "../../../shared/components/EmptyState.jsx";
import { LoadingState } from "../../../shared/components/LoadingState.jsx";
import { SectionHeader } from "../../../shared/components/SectionHeader.jsx";
import { useAppData } from "../../../store/AppContext.jsx";

function CompaniesPage() {
  const { companies, jobs, auth } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const canManageCompanies =
    auth.status === "ready" &&
    (auth.user?.role === "recruiter" || auth.user?.role === "admin");

  // Map open jobs count per company ID
  const jobsCountMap = useMemo(() => {
    const map = {};
    if (jobs.items) {
      jobs.items.forEach((j) => {
        const cId = j.company?._id || j.company;
        if (cId) {
          map[cId] = (map[cId] || 0) + 1;
        }
      });
    }
    return map;
  }, [jobs.items]);

  const filteredCompanies = useMemo(() => {
    return companies.items.filter((company) => {
      const matchSearch =
        !searchTerm.trim() ||
        (company.name && company.name.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
        (company.description && company.description.toLowerCase().includes(searchTerm.toLowerCase().trim()));

      const matchLocation =
        !locationFilter.trim() ||
        (company.location && company.location.toLowerCase().includes(locationFilter.toLowerCase().trim()));

      return matchSearch && matchLocation;
    });
  }, [companies.items, searchTerm, locationFilter]);

  return (
    <section className="space-y-8">
      <SectionHeader
        eyebrow="Employer Directory"
        title="Explore Top Hiring Companies"
        description="Discover verified organizations, company profiles, and open positions."
        action={
          canManageCompanies ? (
            <Link
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
              to="/companies/new"
            >
              <Plus className="h-4 w-4" />
              Register Company
            </Link>
          ) : null
        }
      />

      {/* SEARCH AND LOCATION FILTERS */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-2 px-3 py-1.5 border-b border-slate-100 md:border-b-0 md:border-r">
          <Search className="h-4 w-4 text-blue-600 shrink-0" />
          <input
            type="text"
            placeholder="Search company name or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none font-medium"
          />
        </div>

        <div className="flex flex-1 items-center gap-2 px-3 py-1.5">
          <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
          <input
            type="text"
            placeholder="Filter by headquarters location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none font-medium"
          />
        </div>

        {(searchTerm || locationFilter) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setLocationFilter("");
            }}
            type="button"
            className="text-xs font-semibold text-blue-600 hover:underline px-2"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* RESULTS SUMMARY */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Showing <span className="text-blue-600">{filteredCompanies.length}</span> Companies
        </p>
      </div>

      {/* COMPANY CARDS GRID */}
      {companies.status === "loading" ? (
        <LoadingState message="Loading employer directory..." />
      ) : filteredCompanies.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => {
            const openJobsCount = jobsCountMap[company._id] || 0;
            return (
              <CompanyCard
                key={company._id || company.name}
                company={company}
                openJobsCount={openJobsCount}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No Companies Found"
          description="No companies matched your search query or location filter."
        />
      )}
    </section>
  );
}

export { CompaniesPage };
