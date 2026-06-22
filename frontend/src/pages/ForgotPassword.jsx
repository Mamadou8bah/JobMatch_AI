import { useState } from "react";
import { Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo.jsx";
import { api } from "../services/api.js";
import ICONS, { Icon } from "../components/dashboard/icons.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await api.auth.forgotPassword(email);
      setMessage("If an account exists for that email, password reset instructions have been sent.");
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
            <h1>Forgot password</h1>
            <p>Enter your email and we will generate a password reset token.</p>
          </div>

          {error && <div className="auth-alert" role="alert">{error}</div>}
          {message && <div className="auth-alert" style={{ borderColor: "#bbf7d0", background: "#f0fdf4", color: "#166534" }}>{message}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Email address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Please wait..." : "Send reset link"}
            </button>
          </form>

          <p className="auth-switch">
            Remember your password?
            <Link to="/login" className="dash-inline-link">
              <Icon icon={ICONS.arrowLeft} size={14} />
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
