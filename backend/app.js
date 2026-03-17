import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
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

// Middleware
app.use(morgan("dev"));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
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

export default app;