import React from "react";
import { CheckCircle2, Clock, XCircle, Award, Eye, UserCheck } from "lucide-react";

const statusConfig = {
  Applied: {
    label: "Applied",
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Clock,
  },
  "Under Review": {
    label: "Under Review",
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Eye,
  },
  Shortlisted: {
    label: "Shortlisted",
    bg: "bg-purple-50 text-purple-700 border-purple-200",
    icon: UserCheck,
  },
  Interview: {
    label: "Interview",
    bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: UserCheck,
  },
  Hired: {
    label: "Hired / Accepted",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: Award,
  },
  Accepted: {
    label: "Accepted",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  Rejected: {
    label: "Rejected",
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
  },
};

function StatusBadge({ status }) {
  const normalized = statusConfig[status] || {
    label: status || "Pending",
    bg: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Clock,
  };

  const Icon = normalized.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${normalized.bg}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {normalized.label}
    </span>
  );
}

export { StatusBadge };
