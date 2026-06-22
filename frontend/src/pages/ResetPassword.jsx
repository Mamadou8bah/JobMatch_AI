import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import BrandLogo from "../components/BrandLogo.jsx";
import { api } from "../services/api.js";
import ICONS, { Icon } from "../components/dashboard/icons.jsx";
export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(params.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await api.auth.resetPassword(token, password);
      setSuccess(data.message || "Password updated successfully.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell" style={{ gridTemplateColumns: "1fr" }}>
        <div className="auth-panel">
          <BrandLogo to="/" size="md" className="auth-brand" />

          <div className="auth-copy">
            <h1>Reset password</h1>
            <p>Enter your reset token and choose a new password.</p>
          </div>

          {error && <div className="auth-alert" role="alert">{error}</div>}
          {success && <div className="auth-alert" style={{ borderColor: "#bbf7d0", background: "#f0fdf4", color: "#166534" }}>{success}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Reset token</span>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </label>
            <label className="auth-field">
              <span>New password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>
            <label className="auth-field">
              <span>Confirm password</span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={6}
                required
              />
            </label>
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Please wait..." : "Update password"}
            </button>
          </form>

          <p className="auth-switch">
            <Link to="/login" className="dash-inline-link">
              <Icon icon={ICONS.arrowLeft} size={14} />
              Back to sign in
            </Link>
          </p>        </div>
      </section>
    </main>
  );
}
