import { Link, NavLink, useNavigate } from "react-router-dom";
import { BriefcaseBusiness, Building2, LayoutDashboard, LogOut, UserCircle2 } from "lucide-react";
import { logoutUser } from "../../features/auth/api/auth.js";
import { brand } from "../../assets/brand.js";
import { useAppData } from "../../store/AppContext.jsx";

const navClass = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
    isActive ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
  }`;

function Navbar() {
  const navigate = useNavigate();
  const { auth, clearSession } = useAppData();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      /* still clear local session */
    }
    clearSession();
    navigate("/");
  };

  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <Link className="inline-flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900" to="/">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
          <BriefcaseBusiness className="h-4 w-4" />
        </span>
        {brand.name}
      </Link>
      <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
        <NavLink className={navClass} end to="/">
          Home
        </NavLink>
        <NavLink className={navClass} to="/jobs">
          <BriefcaseBusiness className="h-4 w-4" />
          Jobs
        </NavLink>
        <NavLink className={navClass} to="/companies">
          <Building2 className="h-4 w-4" />
          Companies
        </NavLink>
        {auth.status === "ready" && auth.user ? (
          <>
            <NavLink className={navClass} to="/dashboard">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-2 py-1">
              <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-medium text-slate-700">
                <UserCircle2 className="h-4 w-4" />
                {auth.user.username}
              </span>
              <button
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-700"
                onClick={handleLogout}
                type="button"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </button>
            </div>
          </>
        ) : (
          <NavLink className={navClass} to="/auth">
            Sign in
          </NavLink>
        )}
      </div>
    </nav>
  );
}

export { Navbar };
