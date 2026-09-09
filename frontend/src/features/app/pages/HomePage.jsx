import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  FileCheck2,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Users,
  Award
} from "lucide-react";
import { JobCard } from "../../jobs/components/JobCard.jsx";
import { CompanyCard } from "../../company/components/CompanyCard.jsx";
import { EmptyState } from "../../../shared/components/EmptyState.jsx";
import { LoadingState } from "../../../shared/components/LoadingState.jsx";
import { SectionHeader } from "../../../shared/components/SectionHeader.jsx";
import { useAppData } from "../../../store/AppContext.jsx";

const POPULAR_SEARCHES = [
  "Frontend Developer",
  "React",
  "Backend Engineer",
  "Node.js",
  "Remote",
  "Full-Time",
];

function HomePage() {
  const navigate = useNavigate();
  const { jobs, companies, applications, auth } = useAppData();

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("search", keyword.trim());
    if (location.trim()) params.set("location", location.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  const handleTagClick = (tag) => {
    navigate(`/jobs?search=${encodeURIComponent(tag)}`);
  };

  const totalApplicationsCount = applications.items.length || 0;

  return (
    <div className="space-y-12">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 px-6 py-12 text-white shadow-xl md:px-12 md:py-16">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" aria-hidden />
        <div className="absolute -bottom-20 left-10 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" aria-hidden />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-200 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-blue-400" />
            Empowering Top Talent & Employers
          </div>

          <h1 className="text-3xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl tracking-tight">
            Find Your Dream Career or Hire Top Talent Faster.
          </h1>

          <p className="max-w-2xl text-base text-blue-100/90 md:text-lg">
            Discover thousands of curated opportunities at leading tech companies. Connect directly with hiring managers and advance your professional journey today.
          </p>

          {/* PROMINENT JOB SEARCH BAR */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-6 flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-2xl md:flex-row md:items-center"
          >
            <div className="flex flex-1 items-center gap-3 px-3 py-2 border-b border-slate-100 md:border-b-0 md:border-r">
              <Search className="h-5 w-5 text-blue-600 shrink-0" />
              <input
                type="text"
                placeholder="Job title, skills, or keyword..."
                className="w-full text-slate-800 placeholder-slate-400 bg-transparent text-sm focus:outline-none font-medium"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <div className="flex flex-1 items-center gap-3 px-3 py-2">
              <MapPin className="h-5 w-5 text-blue-600 shrink-0" />
              <input
                type="text"
                placeholder="City, state, or 'Remote'"
                className="w-full text-slate-800 placeholder-slate-400 bg-transparent text-sm focus:outline-none font-medium"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-95 shrink-0"
            >
              <Search className="h-4 w-4" />
              Search Jobs
            </button>
          </form>

          {/* POPULAR SEARCH TAGS */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-blue-200 inline-flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> Popular Searches:
            </span>
            {POPULAR_SEARCHES.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="rounded-full bg-white/10 px-3 py-1 font-medium text-white transition hover:bg-white/20 active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* REAL STATISTICS FROM BACKEND */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Jobs</p>
              <h3 className="mt-1 text-3xl font-extrabold text-slate-900">{jobs.items.length}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:scale-110">
              <Briefcase className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Live verified postings from employers</p>
        </div>

        <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Companies</p>
              <h3 className="mt-1 text-3xl font-extrabold text-slate-900">{companies.items.length}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 transition group-hover:scale-110">
              <Building2 className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Trusted tech & corporate partners</p>
        </div>

        <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Applications</p>
              <h3 className="mt-1 text-3xl font-extrabold text-slate-900">
                {auth.user ? totalApplicationsCount : "100+"}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:scale-110">
              <FileCheck2 className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Applications processed seamlessly</p>
        </div>
      </section>

      {/* LATEST JOBS SECTION */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Featured Opportunities"
            title="Latest Job Openings"
            description="Explore the newest listings matching top talent demand across industries."
          />
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 transition hover:text-blue-700 hover:underline shrink-0"
          >
            View All Jobs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {jobs.status === "loading" ? (
          <LoadingState message="Fetching latest jobs..." />
        ) : jobs.items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.items.slice(0, 6).map((job) => (
              <JobCard job={job} key={job._id || job.id || job.title} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No job listings found"
            description="There are currently no active job postings. Check back later or post a job!"
          />
        )}
      </section>

      {/* TOP RECRUITERS & EMPLOYERS DIRECTORY SECTION */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Top Recruiters & Employers"
            title="Featured Hiring Companies"
            description="Discover verified companies actively looking for talent."
          />
          <Link
            to="/companies"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 transition hover:text-blue-700 hover:underline shrink-0"
          >
            Explore Companies <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {companies.status === "loading" ? (
          <LoadingState message="Fetching top recruiters..." />
        ) : companies.items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companies.items.slice(0, 3).map((company) => (
              <CompanyCard company={company} key={company._id || company.name} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No companies registered yet"
            description="Recruiters and companies will appear here once registered."
          />
        )}
      </section>

      {/* DUAL CTA SECTION FOR SEEKERS AND RECRUITERS */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-md flex flex-col justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight">For Job Seekers</h3>
            <p className="mt-2 text-sm text-slate-300">
              Build your professional profile, save your target opportunities, and apply directly with your customized resume.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Save jobs to apply anytime
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Track real-time status updates
              </li>
            </ul>
          </div>
          <Link
            to="/jobs"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-95"
          >
            Explore Careers <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-3xl border border-blue-200 bg-blue-50/70 p-8 text-slate-900 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white mb-4">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">For Recruiters</h3>
            <p className="mt-2 text-sm text-slate-600">
              Post job openings, manage applicants, track candidate status, and grow your company team efficiently.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" /> Manage job listings & status
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" /> Review applicant resumes & cover letters
              </li>
            </ul>
          </div>
          <Link
            to={auth.user?.role === "recruiter" ? "/jobs/new" : "/auth"}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 active:scale-95"
          >
            Post a Job Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

export { HomePage };
