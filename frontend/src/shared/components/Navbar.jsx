import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  Building2,
  LayoutDashboard,
  LogOut,
  UserCircle2,
  PlusCircle,
  Menu,
  X,
  Bookmark,
  Sparkles
} from "lucide-react";
import { logoutUser } from "../../features/auth/api/auth.js";
import { brand } from "../../assets/brand.js";
import { useAppData } from "../../store/AppContext.jsx";

const getNavClass = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-blue-600 text-white shadow-sm"
      : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
  }`;

const getMobileNavClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition ${
    isActive
      ? "bg-blue-600 text-white shadow-sm"
      : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
  }`;

function Navbar() {
  const navigate = useNavigate();
  const { auth, clearSession } = useAppData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isRecruiter = auth.user?.role === "recruiter";
  const isJobSeeker = auth.user?.role === "jobseeker" || (!isRecruiter && auth.user);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      /* still clear session locally */
    }
    clearSession();
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="relative rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          className="inline-flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-slate-900 transition hover:opacity-90"
          to="/"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white shadow-md shadow-blue-500/20">
            <BriefcaseBusiness className="h-5 w-5" />
          </span>
          <span>{brand.name}</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-1.5 md:flex">
          <NavLink className={getNavClass} end to="/">
            Home
          </NavLink>
          <NavLink className={getNavClass} to="/jobs">
            <BriefcaseBusiness className="h-4 w-4" />
            Jobs
          </NavLink>
          <NavLink className={getNavClass} to="/companies">
            <Building2 className="h-4 w-4" />
            Companies
          </NavLink>

          {auth.status === "ready" && auth.user ? (
            <>
              <NavLink className={getNavClass} to="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </NavLink>

              {isRecruiter && (
                <NavLink className={getNavClass} to="/jobs/new">
                  <PlusCircle className="h-4 w-4" />
                  Post Job
                </NavLink>
              )}

              <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3">
                <div className="flex items-center gap-1.5 rounded-xl bg-slate-100/80 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  <UserCircle2 className="h-4 w-4 text-blue-600" />
                  <span className="max-w-[110px] truncate">{auth.user.fullName || auth.user.username}</span>
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] uppercase font-bold text-blue-800">
                    {auth.user.role || "User"}
                  </span>
                </div>
                <button
                  className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
                  onClick={handleLogout}
                  type="button"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3">
              <NavLink
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
                to="/auth"
              >
                Sign In
              </NavLink>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="inline-flex items-center justify-center rounded-xl p-2 text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3 md:hidden">
          <NavLink className={getMobileNavClass} end to="/" onClick={() => setMobileMenuOpen(false)}>
            Home
          </NavLink>
          <NavLink className={getMobileNavClass} to="/jobs" onClick={() => setMobileMenuOpen(false)}>
            <BriefcaseBusiness className="h-5 w-5" />
            Jobs
          </NavLink>
          <NavLink className={getMobileNavClass} to="/companies" onClick={() => setMobileMenuOpen(false)}>
            <Building2 className="h-5 w-5" />
            Companies
          </NavLink>

          {auth.status === "ready" && auth.user ? (
            <>
              <NavLink className={getMobileNavClass} to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </NavLink>

              {isRecruiter && (
                <NavLink className={getMobileNavClass} to="/jobs/new" onClick={() => setMobileMenuOpen(false)}>
                  <PlusCircle className="h-5 w-5 text-blue-600" />
                  Post a Job
                </NavLink>
              )}

              <div className="mt-2 border-t border-slate-100 pt-3">
                <div className="mb-3 flex items-center gap-2 px-2">
                  <UserCircle2 className="h-5 w-5 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">{auth.user.fullName || auth.user.username}</span>
                    <span className="text-xs text-slate-500 capitalize">{auth.user.role}</span>
                  </div>
                </div>
                <button
                  className="flex w-full items-center gap-3 rounded-xl bg-rose-50 px-4 py-3 text-base font-semibold text-rose-600 transition hover:bg-rose-100"
                  onClick={handleLogout}
                  type="button"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="mt-2 border-t border-slate-100 pt-3">
              <NavLink
                className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-center text-base font-bold text-white shadow-sm transition hover:bg-blue-700"
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </NavLink>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export { Navbar };
