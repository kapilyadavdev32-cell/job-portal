/**
 * Fail fast on missing secrets.
 */
function validateEnv() {
  const required = ["MONGO_URI", "ACCESS_TOKEN_SECRET", "REFRESH_TOKEN_SECRET"];
  const missing = required.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    console.error(
      `[env] Missing required variables: ${missing.join(", ")}. Copy backend/.env.example to backend/.env and set them.`,
    );
    process.exit(1);
  }

  if (process.env.NODE_ENV === "production") {
    const minLen = 32;
    if (
      process.env.ACCESS_TOKEN_SECRET.length < minLen ||
      process.env.REFRESH_TOKEN_SECRET.length < minLen
    ) {
      console.error(
        `[env] In production, ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must each be at least ${minLen} characters.`,
      );
      process.exit(1);
    }
  }
}

export { validateEnv };
