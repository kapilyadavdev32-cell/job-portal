import { apiRequest } from "./client.js";

export function fetchJobs(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return apiRequest(`/jobs${qs ? `?${qs}` : ""}`);
}

export function fetchJobById(id) {
  return apiRequest(`/jobs/${encodeURIComponent(id)}`);
}
