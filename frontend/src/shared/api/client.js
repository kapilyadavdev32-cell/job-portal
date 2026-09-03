// Dev: prefer Vite proxy (see vite.config.js) with relative "/api/v1" so cookies stay same-site.
// Production: set VITE_API_BASE_URL to your deployed API (e.g. https://api.example.com/api/v1).
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? "/api/v1" : "http://localhost:8000/api/v1");

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const message =
      payload?.message || payload?.error || `Request failed with ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export async function apiRequest(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  return parseResponse(response);
}

export { API_BASE_URL };
