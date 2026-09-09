import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout.jsx";
import { NotFoundPage } from "../features/app/pages/NotFoundPage.jsx";
import { HomePage } from "../features/app/pages/HomePage.jsx";
import { JobsPage } from "../features/jobs/pages/JobsPage.jsx";
import { JobDetailPage } from "../features/jobs/pages/JobDetailPage.jsx";
import { JobEditorPage } from "../features/jobs/pages/JobEditorPage.jsx";
import { CompaniesPage } from "../features/company/pages/CompaniesPage.jsx";
import { CompanyDetailPage } from "../features/company/pages/CompanyDetailPage.jsx";
import { CompanyEditorPage } from "../features/company/pages/CompanyEditorPage.jsx";
import { AuthPage } from "../features/auth/pages/AuthPage.jsx";
import { VerifyEmailPage } from "../features/auth/pages/VerifyEmailPage.jsx";
import { DashboardPage } from "../features/applications/pages/DashboardPage.jsx";
import { ProtectedRoute } from "../shared/components/ProtectedRoute.jsx";

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailPage />} />
        <Route
          path="/jobs/new"
          element={
            <ProtectedRoute>
              <JobEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:jobId/edit"
          element={
            <ProtectedRoute>
              <JobEditorPage />
            </ProtectedRoute>
          }
        />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/companies/:companyId" element={<CompanyDetailPage />} />
        <Route
          path="/companies/new"
          element={
            <ProtectedRoute>
              <CompanyEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/companies/:companyId/edit"
          element={
            <ProtectedRoute>
              <CompanyEditorPage />
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
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
