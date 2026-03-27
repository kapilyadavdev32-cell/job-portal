import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout.jsx";
import { NotFoundPage } from "../pages/NotFoundPage.jsx";
import { HomePage } from "../pages/HomePage.jsx";
import { JobsPage } from "../pages/JobsPage.jsx";
import { JobDetailPage } from "../pages/JobDetailPage.jsx";
import { CompaniesPage } from "../pages/CompaniesPage.jsx";
import { CompanyDetailPage } from "../pages/CompanyDetailPage.jsx";
import { AuthPage } from "../pages/AuthPage.jsx";
import { DashboardPage } from "../pages/DashboardPage.jsx";
import { ProtectedRoute } from "../components/ProtectedRoute.jsx";

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/companies/:companyId" element={<CompanyDetailPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}

export { AppRouter };
