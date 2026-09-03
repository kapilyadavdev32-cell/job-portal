import { Link } from "react-router-dom";
import { BriefcaseBusiness, Globe2 } from "lucide-react";
import { API_BASE_URL } from "../api/client.js";
import { brand } from "../../assets/brand.js";

function Footer() {
  return (
    <footer className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm md:flex-row md:items-center">
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
          <BriefcaseBusiness className="h-4 w-4 text-blue-600" />
          {brand.name}
        </p>
        <p className="mt-1 text-sm text-slate-600">{brand.tagline}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link className="rounded-lg bg-blue-50 px-3 py-1.5 font-medium text-blue-700 transition hover:bg-blue-100" to="/jobs">
          Browse jobs
        </Link>
        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-slate-600">
          <Globe2 className="h-4 w-4" />
          API {API_BASE_URL}
        </span>
      </div>
    </footer>
  );
}

export { Footer };
