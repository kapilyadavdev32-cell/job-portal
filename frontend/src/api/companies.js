import { apiRequest } from "./client.js";

export function fetchCompanies() {
  return apiRequest("/companies");
}

export function fetchCompanyById(id) {
  return apiRequest(`/companies/${encodeURIComponent(id)}`);
}
