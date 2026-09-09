import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BriefcaseBusiness, CheckCircle2, ShieldCheck, Mail, ArrowLeft, Lock } from "lucide-react";
import { loginUser, registerUser, resendVerificationEmail } from "../api/auth.js";
import { AuthForm } from "../components/AuthForm.jsx";
import { useAppData } from "../../../store/AppContext.jsx";

function AuthPage() {
  const [mode, setMode] = useState("login");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [lastLoginEmail, setLastLoginEmail] = useState("");
  const [canResendVerification, setCanResendVerification] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { auth, setUserFromLogin } = useAppData();

  const redirectTo = location.state?.from || "/dashboard";

  useEffect(() => {
    if (auth.status === "ready" && auth.user) {
      navigate(redirectTo, { replace: true });
    }
  }, [auth.status, auth.user, navigate, redirectTo]);

  const handleSubmit = async (payload, reset) => {
    setLoading(true);
    setStatus({ type: "", message: "" });
    setCanResendVerification(false);
    if (mode === "login") {
      setLastLoginEmail(payload.email || "");
    }

    try {
      const action = mode === "login" ? loginUser : registerUser;
      const result = await action(payload);
      if (mode === "login") {
        setUserFromLogin(result);
        setStatus({
          type: "success",
          message: result?.message || "Signed in successfully.",
        });
        reset();
        navigate(redirectTo, { replace: true });
      } else {
        setStatus({
          type: "success",
          message:
            result?.message ||
            "Account created! Check your email to verify, then sign in.",
        });
        reset();
        setMode("login");
      }
    } catch (error) {
      const message = error.message || "Authentication request failed.";
      const needsVerification = mode === "login" && /verify your email/i.test(message);
      setStatus({
        type: "error",
        message,
      });
      setCanResendVerification(needsVerification);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!lastLoginEmail) return;
    setResendLoading(true);
    try {
      const result = await resendVerificationEmail({ email: lastLoginEmail });
      setStatus({
        type: "success",
        message:
          result?.message ||
          "Verification link has been sent to your email address.",
      });
      setCanResendVerification(false);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to resend verification email.",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-4">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* LEFT BANNER */}
        <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-8 text-white shadow-xl flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur">
              <BriefcaseBusiness className="h-6 w-6" />
            </div>

            <h2 className="text-3xl font-extrabold leading-tight">
              Join Thousands of Professionals & Employers
            </h2>

            <p className="text-sm text-blue-100/90 leading-relaxed">
              Create an account to save top job opportunities, track your application progress in real-time, or recruit top talent for your team.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs font-semibold text-blue-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                Verified employer listings and secure applications
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-blue-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                Resume uploading & Google Drive integration
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-blue-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                Real-time application status dashboard
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-blue-400/20 text-xs text-blue-200">
            <ShieldCheck className="h-4 w-4 inline-block mr-1 text-blue-300" />
            Protected by JWT authentication & HTTPS security.
          </div>
        </div>

        {/* RIGHT AUTH CONTAINER */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {/* TAB SWITCHER */}
          <div className="flex rounded-2xl bg-slate-100 p-1">
            <button
              onClick={() => {
                setMode("login");
                setStatus({ type: "", message: "" });
              }}
              type="button"
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${
                mode === "login"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode("register");
                setStatus({ type: "", message: "" });
              }}
              type="button"
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${
                mode === "register"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Register Account
            </button>
          </div>

          <p className="mt-4 text-xs font-medium text-slate-500">
            {mode === "login"
              ? "Sign in with your email and password to access your account."
              : "Register a new account as a Job Seeker or Recruiter."}
          </p>

          {/* STATUS NOTIFICATION */}
          {status.message && (
            <div
              className={`mt-4 rounded-xl p-3.5 text-xs font-semibold ${
                status.type === "error"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              {status.message}
            </div>
          )}

          {/* RESEND VERIFICATION LINK BUTTON */}
          {mode === "login" && canResendVerification && lastLoginEmail && (
            <button
              onClick={handleResendVerification}
              disabled={resendLoading}
              type="button"
              className="mt-3 w-full rounded-xl bg-amber-50 border border-amber-200 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100"
            >
              {resendLoading ? "Sending Verification..." : "Resend Email Verification Link"}
            </button>
          )}

          <AuthForm loading={loading} mode={mode} onSubmit={handleSubmit} />

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <Link to="/jobs" className="text-xs font-bold text-slate-500 hover:text-blue-600">
              Continue browsing jobs as guest →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export { AuthPage };
