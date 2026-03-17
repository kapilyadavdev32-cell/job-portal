import { apiRequest } from "./client.js";

export function fetchJobs() {
  return apiRequest("/jobs");
}
