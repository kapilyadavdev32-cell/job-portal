import {
  apiRequest,
  clearAccessToken,
  setAccessToken,
} from "../../../shared/api/client.js";

export async function loginUser(payload) {
  const result = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (result?.data?.accessToken) {
    setAccessToken(result.data.accessToken);
  }

  return result;
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

export async function logoutUser() {
  try {
    return await apiRequest("/auth/logout", { method: "POST" });
  } finally {
    clearAccessToken();
  }
}

export function resendVerificationEmail(payload) {
  return apiRequest("/auth/resend-verification-email-public", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
