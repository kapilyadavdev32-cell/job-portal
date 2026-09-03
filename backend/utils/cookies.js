/**
 * HttpOnly auth cookies — options must match on set and clear.
 * For API on a different subdomain than the SPA, set COOKIE_SAME_SITE=none and deploy API behind HTTPS.
 */
function getAuthCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  const raw = (process.env.COOKIE_SAME_SITE || "lax").toLowerCase();
  const sameSite = ["strict", "lax", "none"].includes(raw) ? raw : "lax";

  const secure =
    sameSite === "none"
      ? true
      : isProd && process.env.COOKIE_SECURE !== "false";

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
  };
}

export { getAuthCookieOptions };
