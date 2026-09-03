import { apiRequest } from "../../../shared/api/client.js";

export function loginUser(payload) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function registerUser(payload) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchCurrentUser() {
  return apiRequest("/auth/current-user");
}

export function logoutUser() {
  return apiRequest("/auth/logout", { method: "POST" });
}

export function resendVerificationEmail(payload) {
  return apiRequest("/auth/resend-verification-email-public", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
