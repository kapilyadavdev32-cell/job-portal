import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
            "Account created. Check your email to verify, then sign in.",
        });
        reset();
      }
    } catch (error) {
      const message = error.message || "Request failed.";
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
          "If that email exists and is not verified, a verification link has been sent.",
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
    <section className="section-block auth-layout">
      <article className="hero-banner">
        <p className="surface-label">Account</p>
        <h2>Sign in to save jobs, apply, and track everything in your dashboard.</h2>
        <p>
          New users receive a verification email. After you verify, you can sign in with email and
          password. Sessions use secure HTTP-only cookies from the API.
        </p>
        <div className="feature-grid">
          <div className="card">
            <h3>Job seekers</h3>
            <p className="muted">Apply with a resume link and optional cover letter.</p>
          </div>
          <div className="card">
            <h3>Recruiters</h3>
            <p className="muted">Review applications for your companies from the same workspace.</p>
          </div>
        </div>
      </article>

      <article className="auth-panel">
        <div className="auth-tabs">
          <button
            className={mode === "login" ? "primary-button" : "secondary-button"}
            onClick={() => setMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={mode === "register" ? "primary-button" : "secondary-button"}
            onClick={() => setMode("register")}
            type="button"
          >
            Register
          </button>
        </div>

        <p className="muted" style={{ marginTop: "1rem" }}>
          {mode === "login"
            ? "Welcome back — we will redirect you after a successful login."
            : "Create an account and choose how you will use the platform."}
        </p>

        {status.message ? (
          <div className={`status-note ${status.type}`}>{status.message}</div>
        ) : null}

        {mode === "login" && canResendVerification && lastLoginEmail ? (
          <button
            className="secondary-button"
            disabled={resendLoading}
            onClick={handleResendVerification}
            style={{ marginBottom: "1rem", width: "100%" }}
            type="button"
          >
            {resendLoading ? "Sending verification email..." : "Resend verification email"}
          </button>
        ) : null}

        <AuthForm loading={loading} mode={mode} onSubmit={handleSubmit} />

        <p className="muted" style={{ marginTop: "1rem" }}>
          <Link to="/jobs">Continue without signing in</Link>
        </p>
      </article>
    </section>
  );
}

export { AuthPage };
