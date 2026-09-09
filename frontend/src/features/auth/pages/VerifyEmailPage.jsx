import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { apiRequest } from "../../../shared/api/client.js";

function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState({ loading: true, success: false, message: "" });

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus({ loading: false, success: false, message: "Verification token is missing." });
        return;
      }
      try {
        const response = await apiRequest(`/auth/verify-email/${encodeURIComponent(token)}`);
        setStatus({
          loading: false,
          success: true,
          message: response?.message || "Your email has been successfully verified!",
        });
      } catch (err) {
        setStatus({
          loading: false,
          success: false,
          message: err.message || "This verification token is invalid or has expired.",
        });
      }
    }
    verify();
  }, [token]);

  return (
    <div className="mx-auto max-w-md py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        {status.loading ? (
          <div className="space-y-4">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Verifying Email...</h2>
            <p className="text-sm text-slate-500">Please wait while we confirm your email address.</p>
          </div>
        ) : status.success ? (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Email Verified!</h2>
            <p className="text-sm text-slate-600">{status.message}</p>
            <div className="pt-4">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-95"
              >
                Proceed to Sign In <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <XCircle className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Verification Failed</h2>
            <p className="text-sm text-rose-600">{status.message}</p>
            <div className="pt-4">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-slate-800"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { VerifyEmailPage };
