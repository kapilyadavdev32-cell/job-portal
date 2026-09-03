import rateLimit from "express-rate-limit";

/** Login / register / password reset — strict */
const authStrictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number.parseInt(process.env.RATE_LIMIT_AUTH_MAX || "20", 10),
  message: { message: "Too many attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Token refresh — slightly looser */
const authRefreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number.parseInt(process.env.RATE_LIMIT_REFRESH_MAX || "60", 10),
  message: { message: "Too many refresh attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const resumeUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number.parseInt(process.env.RATE_LIMIT_RESUME_MAX || "20", 10),
  message: { message: "Too many resume requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

export { authStrictLimiter, authRefreshLimiter, resumeUploadLimiter };
