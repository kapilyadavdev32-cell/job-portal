import React from "react";
import { BriefcaseBusiness } from "lucide-react";
import { brand } from "../../assets/brand.js";

function Footer() {
  return (
    <footer className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-6 py-4 shadow-sm sm:flex-row">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
          <BriefcaseBusiness className="h-4 w-4" />
        </span>
        <span className="text-sm font-bold text-slate-900">{brand.name}</span>
        <span className="text-xs text-slate-400 hidden sm:inline">|</span>
        <span className="text-xs font-medium text-slate-500 hidden sm:inline">{brand.tagline}</span>
      </div>

      <p className="text-xs font-medium text-slate-400">
        © {new Date().getFullYear()} {brand.name}. All rights reserved.
      </p>
    </footer>
  );
}

export { Footer };
