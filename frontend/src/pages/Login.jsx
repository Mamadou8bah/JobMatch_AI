import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const ROLES = [
  { value: "job_seeker", label: "Job seeker" },
  { value: "employer", label: "Employer" },
];

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function AuthField({ label, type = "text", value, onChange, placeholder, autoComplete, required, minLength, suffix }) {
  return (
    <label className="auth-field">
      <span className="auth-label">{label}</span>
      <div className="auth-input-wrap">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
        />
        {suffix}
      </div>
    </label>
  );
}

export default function Login() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("job_seeker");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, register, getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;
  const isRegister = mode === "register";

  const setModeAndClear = (next) => {
    setMode(next);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isRegister) {
        const user = await register({ email, password, fullName, role });
        navigate(from || getDashboardRoute(user.role), { replace: true });
        return;
      }

      const user = await login(email, password);
      navigate(from || getDashboardRoute(user.role), { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title={isRegister ? "Create account" : "Sign in"}>
      <div className="auth-segment" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={!isRegister}
          className={!isRegister ? "is-active" : ""}
          onClick={() => setModeAndClear("login")}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isRegister}
          className={isRegister ? "is-active" : ""}
          onClick={() => setModeAndClear("register")}
        >
          Sign up
        </button>
      </div>

      {error && (
        <div className="auth-alert" role="alert">
          {error}
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {isRegister && (
          <>
            <AuthField
              label="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Awa Jallow"
              autoComplete="name"
              required
            />

            <fieldset className="auth-role">
              <legend className="auth-label">I am a</legend>
              <div className="auth-role-options">
                {ROLES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={role === option.value ? "is-active" : ""}
                    onClick={() => setRole(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </>
        )}

        <AuthField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <AuthField
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete={isRegister ? "new-password" : "current-password"}
          minLength={6}
          required
          suffix={
            <button
              type="button"
              className="auth-input-action"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon open={showPassword} />
            </button>
          }
        />

        {!isRegister && (
          <div className="auth-row-end">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
        )}

        <button type="submit" className="auth-btn-primary" disabled={loading}>
          {loading ? "Working…" : isRegister ? "Create account" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
