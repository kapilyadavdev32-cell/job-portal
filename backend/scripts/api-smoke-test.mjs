/**
 * Manual API smoke tests — Node 18+ (fetch), dotenv + mongoose from this project.
 * Run with API already up:  npm run test:api
 * Or:  node scripts/api-smoke-test.mjs
 *
 * No extra npm packages (no Jest, Supertest, etc.).
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { User } from "../models/user.model.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env") });

const BASE = (process.env.API_TEST_BASE || "http://localhost:8000/api/v1").replace(/\/$/, "");

let cookieHeader = "";

function absorbCookies(res) {
  const list = res.headers.getSetCookie?.() ?? [];
  if (!list.length) return;
  const map = new Map();
  for (const part of cookieHeader.split(";")) {
    const p = part.trim();
    if (!p.includes("=")) continue;
    const [k, ...rest] = p.split("=");
    map.set(k, rest.join("="));
  }
  for (const line of list) {
    const pair = line.split(";")[0].trim();
    if (pair.includes("=")) {
      const [k, ...rest] = pair.split("=");
      map.set(k, rest.join("="));
    }
  }
  cookieHeader = [...map.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

async function api(method, path, body) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (cookieHeader) headers.Cookie = cookieHeader;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  absorbCookies(res);
  let json = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      json = await res.json();
    } catch {
      /* ignore */
    }
  }
  return { res, json };
}

function fail(name, detail) {
  console.error(`FAIL  ${name}`, detail);
  return false;
}

function pass(name) {
  console.log(`OK    ${name}`);
  return true;
}

async function main() {
  const ts = Date.now();
  const email = `api_smoke_${ts}@test.local`;
  const username = `apis_${ts}`;
  const password = "ApiSmokeTest123!";

  const checks = [];

  // --- Server must be reachable ---
  let { res, json } = await api("GET", "/healthcheck");
  checks.push(
    res.status === 200 ? pass("GET /healthcheck") : fail("GET /healthcheck", res.status),
  );

  // --- Public reads ---
  ({ res } = await api("GET", "/jobs"));
  checks.push(res.status === 200 ? pass("GET /jobs") : fail("GET /jobs", res.status));

  ({ res } = await api("GET", "/companies"));
  checks.push(res.status === 200 ? pass("GET /companies") : fail("GET /companies", res.status));

  const fakeOid = "507f1f77bcf86cd799439011";
  ({ res } = await api("GET", `/jobs/${fakeOid}`));
  checks.push(
    res.status === 404 ? pass("GET /jobs/:id (missing)") : fail("GET /jobs/:id (missing)", res.status),
  );

  ({ res } = await api("GET", `/companies/${fakeOid}`));
  checks.push(
    res.status === 404
      ? pass("GET /companies/:id (missing)")
      : fail("GET /companies/:id (missing)", res.status),
  );

  // --- Auth: unauthenticated ---
  ({ res } = await api("GET", "/auth/current-user"));
  checks.push(
    res.status === 401
      ? pass("GET /auth/current-user (no cookie) → 401")
      : fail("GET /auth/current-user (no cookie)", res.status),
  );

  ({ res } = await api("GET", "/applications"));
  checks.push(
    res.status === 401
      ? pass("GET /applications (no cookie) → 401")
      : fail("GET /applications (no cookie)", res.status),
  );

  // --- Register + verify in DB + login ---
  ({ res, json } = await api("POST", "/auth/register", {
    username,
    email,
    password,
    role: "jobseeker",
  }));
  checks.push(
    res.status === 201
      ? pass("POST /auth/register")
      : fail("POST /auth/register", `${res.status} ${JSON.stringify(json)}`),
  );

  if (!process.env.MONGO_URI?.trim()) {
    console.error("SKIP  login tests: MONGO_URI not set");
    const failed = checks.filter((c) => !c).length;
    process.exit(failed > 0 ? 1 : 0);
  }

  await mongoose.connect(process.env.MONGO_URI);
  await User.updateOne({ email }, { $set: { isEmailVerified: true } });
  await mongoose.disconnect();

  ({ res, json } = await api("POST", "/auth/login", { email, password }));
  checks.push(
    res.status === 200
      ? pass("POST /auth/login")
      : fail("POST /auth/login", `${res.status} ${JSON.stringify(json)}`),
  );

  ({ res, json } = await api("GET", "/auth/current-user"));
  const userId = json?.data?._id || json?.data?.id;
  checks.push(
    res.status === 200 && userId
      ? pass("GET /auth/current-user (with session)")
      : fail("GET /auth/current-user", `${res.status} ${JSON.stringify(json)}`),
  );

  ({ res } = await api("GET", "/applications"));
  checks.push(
    res.status === 200 ? pass("GET /applications (jobseeker)") : fail("GET /applications", res.status),
  );

  ({ res } = await api("GET", "/saved-jobs"));
  checks.push(
    res.status === 200 ? pass("GET /saved-jobs") : fail("GET /saved-jobs", res.status),
  );

  ({ res } = await api("GET", "/users"));
  checks.push(
    res.status === 403
      ? pass("GET /users (non-admin) → 403")
      : fail("GET /users (non-admin)", res.status),
  );

  ({ res } = await api("GET", `/users/${userId}`));
  checks.push(
    res.status === 200 ? pass("GET /users/:id (self)") : fail("GET /users/:id (self)", res.status),
  );

  ({ res } = await api("GET", "/admin/users"));
  checks.push(
    res.status === 403
      ? pass("GET /admin/users (non-admin) → 403")
      : fail("GET /admin/users (non-admin)", res.status),
  );

  ({ res } = await api("POST", "/auth/logout"));
  checks.push(
    res.status === 200 ? pass("POST /auth/logout") : fail("POST /auth/logout", res.status),
  );

  cookieHeader = "";
  ({ res } = await api("GET", "/auth/current-user"));
  checks.push(
    res.status === 401
      ? pass("GET /auth/current-user after logout → 401")
      : fail("GET /auth/current-user after logout", res.status),
  );

  const failed = checks.filter((c) => !c).length;
  console.log(failed ? `\nDone: ${failed} check(s) failed.` : "\nDone: all checks passed.");
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
