import { apiRequest } from "../../../shared/api/client.js";

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

export function createJob(payload) {
  return apiRequest("/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateJob(id, payload) {
  return apiRequest(`/jobs/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteJob(id) {
  return apiRequest(`/jobs/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
