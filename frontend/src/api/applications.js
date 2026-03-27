import { apiRequest } from "./client.js";

export function createApplication(payload) {
  return apiRequest("/applications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchApplications() {
  return apiRequest("/applications");
}
