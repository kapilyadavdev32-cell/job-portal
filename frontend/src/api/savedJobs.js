import { apiRequest } from "./client.js";

export function saveJobForUser(jobId) {
  return apiRequest("/saved-jobs", {
    method: "POST",
    body: JSON.stringify({ job: jobId }),
  });
}

export function fetchSavedJobs() {
  return apiRequest("/saved-jobs");
}

export function removeSavedJob(savedJobId) {
  return apiRequest(`/saved-jobs/${encodeURIComponent(savedJobId)}`, {
    method: "DELETE",
  });
}
