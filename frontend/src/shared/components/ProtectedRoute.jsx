import { Navigate, useLocation } from "react-router-dom";
import { useAppData } from "../../store/AppContext.jsx";

function ProtectedRoute({ children }) {
  const { auth } = useAppData();
  const location = useLocation();

  if (auth.status === "loading") {
    return (
      <div className="page-loading">
        <div className="loading-spinner" aria-hidden />
        <p>Loading your session…</p>
      </div>
    );
  }

  if (auth.status !== "ready" || !auth.user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export { ProtectedRoute };
