import { apiRequest } from "./client.js";

export function fetchCompanies() {
  return apiRequest("/companies");
}
