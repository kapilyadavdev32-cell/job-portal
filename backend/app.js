import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import { ApiError } from "./utils/api-error.js";
import {
  healthcheckRouter,
  authRouter,
  userRouter,
  jobRouter,
  companyRouter,
  applicationRouter,
  savedJobRouter,
  adminRouter,
} from "./router/index.js";

const app = express();
const isProd = process.env.NODE_ENV === "production";

// Always trust Render's reverse proxy for correct IP identification
app.set("trust proxy", 1);

// Security headers (JSON API — CSP disabled; enable if you serve HTML from this server)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(morgan(isProd ? "combined" : "dev"));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

const corsOrigins =
  process.env.CORS_ORIGIN?.split(",")
    .map((o) => o.trim())
    .filter(Boolean) || ["http://localhost:5173"];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Routes
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/companies", companyRouter);
app.use("/api/v1/applications", applicationRouter);
app.use("/api/v1/saved-jobs", savedJobRouter);
app.use("/api/v1/admin", adminRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Central error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    console.error(err);
    return;
  }

  if (err?.name === "TimeoutError" || err?.name === "AbortError") {
    return res.status(400).json({ message: "Timed out fetching the Google Drive file. Try again." });
  }

  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Resume must be 5MB or smaller." });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: "User with email or username already exists",
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid id" });
  }

  const statusCode =
    err instanceof ApiError ? err.statusCode : err.statusCode || 500;

  let message = err instanceof ApiError ? err.message : err.message || "Internal Server Error";

  if (isProd && statusCode === 500 && !(err instanceof ApiError)) {
    message = "Internal server error";
  }

  return res.status(statusCode).json({ message });
});

export default app;
