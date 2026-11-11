// Dev: prefer Vite proxy (see vite.config.js) with relative "/api/v1" so cookies stay same-site.
// Production: set VITE_API_BASE_URL to your deployed API (e.g. https://api.example.com/api/v1).
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? "/api/v1" : "http://localhost:8000/api/v1");
const ACCESS_TOKEN_KEY = "accessToken";

export function resolveResumeUrl(value) {
  if (!value || typeof window === "undefined") {
    return value || "";
  }

  const apiOrigin = new URL(API_BASE_URL, window.location.origin).origin;
  const resumeUrl = new URL(value, apiOrigin);

  if (resumeUrl.pathname.startsWith("/uploads/resumes/")) {
    return new URL(
      `${resumeUrl.pathname}${resumeUrl.search}${resumeUrl.hash}`,
      apiOrigin,
    ).toString();
  }

  return resumeUrl.toString();
}

export function setAccessToken(token) {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
}

export function clearAccessToken() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

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
  const headers = new Headers(options.headers || {});
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (typeof window !== "undefined" && !headers.has("Authorization")) {
    const accessToken = window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  return parseResponse(response);
}

export { API_BASE_URL };
