import { useEffect, useState } from "react";

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

  useEffect(() => {
    setForm(mode === "login" ? loginDefaults : registerDefaults);
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
    <form className="auth-form" onSubmit={handleSubmit}>
      {mode === "register" ? (
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Enter a username"
            required
          />
        </div>
      ) : null}

      <div className="input-group">
        <label htmlFor={`${mode}-email`}>Email</label>
        <input
          id={`${mode}-email`}
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />
      </div>

      <div className="input-group">
        <label htmlFor={`${mode}-password`}>Password</label>
        <input
          id={`${mode}-password`}
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
        />
      </div>

      {mode === "register" ? (
        <div className="input-group">
          <label htmlFor="role">Role</label>
          <select id="role" name="role" value={form.role} onChange={handleChange}>
            <option value="jobseeker">Job seeker</option>
            <option value="recruiter">Recruiter</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      ) : null}

      <button className="primary-button" disabled={loading} type="submit">
        {loading ? "Submitting..." : mode === "login" ? "Login" : "Create account"}
      </button>
    </form>
  );
}

export { AuthForm };
