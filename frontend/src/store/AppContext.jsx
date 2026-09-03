import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchCompanies } from "../features/company/api/companies.js";
import { fetchCurrentUser } from "../features/auth/api/auth.js";
import { fetchHealthcheck } from "../features/app/api/health.js";
import { fetchJobs } from "../features/jobs/api/jobs.js";
import { fetchApplications } from "../features/applications/api/applications.js";
import { fetchSavedJobs } from "../features/jobs/api/savedJobs.js";
import {
  extractApplications,
  extractCompanies,
  extractJobs,
  extractSavedJobs,
  extractUser,
} from "../shared/utils/normalizers.js";

const AppContext = createContext(null);

function createAsyncState() {
  return {
    status: "idle",
    message: "",
    items: [],
  };
}

function AppProvider({ children }) {
  const [health, setHealth] = useState({ status: "loading", message: "" });
  const [jobs, setJobs] = useState(createAsyncState);
  const [companies, setCompanies] = useState(createAsyncState);
  const [auth, setAuth] = useState({ user: null, status: "loading" });
  const [applications, setApplications] = useState(createAsyncState);
  const [savedJobs, setSavedJobs] = useState(createAsyncState);

  const refreshHealth = useCallback(async () => {
    setHealth({ status: "loading", message: "" });
    try {
      const result = await fetchHealthcheck();
      setHealth({
        status: "ready",
        message: result?.message || "Backend responded successfully.",
      });
    } catch (error) {
      setHealth({
        status: "error",
        message: error.message || "Backend is not reachable.",
      });
    }
  }, []);

  const refreshJobs = useCallback(async (filters = {}) => {
    setJobs((current) => ({ ...current, status: "loading", message: "" }));
    try {
      const result = await fetchJobs(filters);
      setJobs({
        status: "ready",
        message: result?.message || "",
        items: extractJobs(result),
      });
    } catch (error) {
      setJobs({
        status: "error",
        message: error.message || "Unable to load jobs.",
        items: [],
      });
    }
  }, []);

  const refreshCompanies = useCallback(async () => {
    setCompanies((current) => ({ ...current, status: "loading", message: "" }));
    try {
      const result = await fetchCompanies();
      setCompanies({
        status: "ready",
        message: result?.message || "",
        items: extractCompanies(result),
      });
    } catch (error) {
      setCompanies({
        status: "error",
        message: error.message || "Unable to load companies.",
        items: [],
      });
    }
  }, []);

  const refreshSession = useCallback(async () => {
    setAuth((current) => ({ ...current, status: "loading" }));
    try {
      const result = await fetchCurrentUser();
      const user = extractUser(result);
      if (user?._id) {
        setAuth({ user, status: "ready" });
      } else {
        setAuth({ user: null, status: "guest" });
      }
    } catch {
      setAuth({ user: null, status: "guest" });
    }
  }, []);

  const setUserFromLogin = useCallback((payload) => {
    const user = extractUser(payload);
    if (user?._id) {
      setAuth({ user, status: "ready" });
    }
  }, []);

  const clearSession = useCallback(() => {
    setAuth({ user: null, status: "guest" });
    setApplications(createAsyncState());
    setSavedJobs(createAsyncState());
  }, []);

  const refreshApplications = useCallback(async () => {
    setApplications((current) => ({ ...current, status: "loading", message: "" }));
    try {
      const result = await fetchApplications();
      setApplications({
        status: "ready",
        message: result?.message || "",
        items: extractApplications(result),
      });
    } catch (error) {
      setApplications({
        status: "error",
        message: error.message || "Unable to load applications.",
        items: [],
      });
    }
  }, []);

  const refreshSavedJobs = useCallback(async () => {
    setSavedJobs((current) => ({ ...current, status: "loading", message: "" }));
    try {
      const result = await fetchSavedJobs();
      setSavedJobs({
        status: "ready",
        message: result?.message || "",
        items: extractSavedJobs(result),
      });
    } catch (error) {
      setSavedJobs({
        status: "error",
        message: error.message || "Unable to load saved jobs.",
        items: [],
      });
    }
  }, []);

  useEffect(() => {
    refreshHealth();
    refreshJobs();
    refreshCompanies();
    refreshSession();
  }, [refreshHealth, refreshJobs, refreshCompanies, refreshSession]);

  useEffect(() => {
    if (auth.status === "ready" && auth.user) {
      refreshApplications();
      refreshSavedJobs();
    }
  }, [auth.status, auth.user, refreshApplications, refreshSavedJobs]);

  const value = useMemo(
    () => ({
      health,
      jobs,
      companies,
      auth,
      applications,
      savedJobs,
      refreshHealth,
      refreshJobs,
      refreshCompanies,
      refreshSession,
      setUserFromLogin,
      clearSession,
      refreshApplications,
      refreshSavedJobs,
    }),
    [
      health,
      jobs,
      companies,
      auth,
      applications,
      savedJobs,
      refreshHealth,
      refreshJobs,
      refreshCompanies,
      refreshSession,
      setUserFromLogin,
      clearSession,
      refreshApplications,
      refreshSavedJobs,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function useAppData() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppData must be used within AppProvider");
  }

  return context;
}

export { AppProvider, useAppData };
