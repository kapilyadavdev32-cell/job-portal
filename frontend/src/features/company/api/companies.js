import { apiRequest } from "../../../shared/api/client.js";

export function fetchCompanies(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return apiRequest(`/companies${qs ? `?${qs}` : ""}`);
}

export function fetchCompanyById(id) {
  return apiRequest(`/companies/${encodeURIComponent(id)}`);
}

export function createCompany(payload) {
  return apiRequest("/companies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCompany(id, payload) {
  return apiRequest(`/companies/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteCompany(id) {
  return apiRequest(`/companies/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function verifyCompanyAsAdmin(id) {
  return apiRequest(`/admin/companies/${encodeURIComponent(id)}/verify`, {
    method: "PUT",
  });
}
