export function formatJobMeta(job) {
  return [
    job.location || "Remote / unspecified",
    job.type || "Full time",
    job.salary || "Salary not listed",
  ];
}
