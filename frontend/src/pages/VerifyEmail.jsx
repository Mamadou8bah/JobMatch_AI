import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import BrandLogo from "../components/BrandLogo.jsx";
import { api } from "../services/api.js";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    setError("");
    try {
      await api.auth.verifyEmail(token.trim());
      setSuccess("Email verified successfully. You can now sign in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api.auth.resendVerification();
      if (result.verificationToken) {
        setToken(result.verificationToken);
      }
      setSuccess(result.message || "Verification email sent.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell" style={{ maxWidth: 480, margin: "0 auto" }}>
        <div className="auth-panel" style={{ width: "100%" }}>
          <BrandLogo to="/" size="md" className="auth-brand" />
          <h1 style={{ marginTop: 24 }}>Verify your email</h1>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            Enter the verification token sent to your email after registration.
          </p>

          {error && <div className="dash-alert error">{error}</div>}
          {success && <div className="dash-alert success">{success}</div>}

          <form onSubmit={handleVerify}>
            <div className="auth-field">
              <label htmlFor="token">Verification token</label>
              <input
                id="token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your verification token"
                required
              />
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Verifying…" : "Verify email"}
            </button>
          </form>

          <p style={{ marginTop: 20, fontSize: 14, color: "var(--muted)" }}>
            Didn&apos;t receive it?{" "}
            <button type="button" className="auth-link-btn" onClick={handleResend} disabled={loading}>
              Resend verification email
            </button>
          </p>
          <p style={{ marginTop: 12 }}>
            <Link to="/login">Back to sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
