export function formatJobMeta(job) {
  const salary =
    job.salaryRange?.min != null && job.salaryRange?.max != null
      ? `$${job.salaryRange.min}k–$${job.salaryRange.max}k`
      : job.salary || "Salary not listed";
  const loc =
    job.location ||
    (job.isRemote ? "Remote" : null) ||
    "Location TBD";
  return [
    loc,
    job.jobType || job.type || "Role",
    salary,
    job.experienceLevel ? String(job.experienceLevel) : "",
  ].filter(Boolean);
}

export function formatDate(value) {
  if (!value) {
    return "—";
  }
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}
