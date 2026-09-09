import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail, User, ShieldAlert } from "lucide-react";

const loginDefaults = {
  email: "",
  password: "",
};

const registerDefaults = {
  username: "",
  email: "",
  password: "",
  role: "jobseeker",
};

function AuthForm({ mode, onSubmit, loading }) {
  const [form, setForm] = useState(mode === "login" ? loginDefaults : registerDefaults);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setForm(mode === "login" ? loginDefaults : registerDefaults);
    setShowPassword(false);
  }, [mode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form, () => {
      setForm(mode === "login" ? loginDefaults : registerDefaults);
    });
  };

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      {mode === "register" && (
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-slate-700" htmlFor="username">
            Username
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="johndoe"
              required
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase text-slate-700" htmlFor={`${mode}-email`}>
          Email Address
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id={`${mode}-email`}
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase text-slate-700" htmlFor={`${mode}-password`}>
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id={`${mode}-password`}
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mode === "register" && (
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-slate-700" htmlFor="role">
            Account Type / Role
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, role: "jobseeker" }))}
              className={`rounded-xl border py-2.5 text-xs font-bold transition ${
                form.role === "jobseeker"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Job Seeker
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, role: "recruiter" }))}
              className={`rounded-xl border py-2.5 text-xs font-bold transition ${
                form.role === "recruiter"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Recruiter / Employer
            </button>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
      >
        {loading ? "Processing..." : mode === "login" ? "Sign In" : "Create Account"}
      </button>
    </form>
  );
}

export { AuthForm };
