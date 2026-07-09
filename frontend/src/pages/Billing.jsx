import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Billing() {
  const { user, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [plans, setPlans] = useState(null);
  const [status, setStatus] = useState(null);
  const [interval, setInterval] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      const [planData, billingStatus] = await Promise.all([
        api.billing.plans(),
        api.billing.me(),
      ]);
      setPlans(planData);
      setStatus(billingStatus);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const result = searchParams.get("status");
    if (result === "success") {
      setSuccess("Payment received — Premium unlocks after ModemPay confirms (usually seconds).");
      refreshUser().then(load);
    } else if (result === "cancelled") {
      setError("Checkout was cancelled. You can try again anytime.");
    }
  }, [searchParams]);

  const audience =
    user?.role === "employer"
      ? "employer"
      : user?.role === "training_provider"
        ? "training_provider"
        : user?.role === "job_seeker"
          ? "job_seeker"
          : null;
  const planInfo = audience && plans?.plans?.[audience];
  const isPremium = status?.plan === "premium";

  const startCheckout = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const origin = window.location.origin;
      const result = await api.billing.checkout({
        interval,
        successUrl: `${origin}${
          user?.role === "employer"
            ? "/employer"
            : user?.role === "training_provider"
              ? "/provider"
              : "/seeker"
        }/billing?status=success`,
        cancelUrl: `${origin}${
          user?.role === "employer"
            ? "/employer"
            : user?.role === "training_provider"
              ? "/provider"
              : "/seeker"
        }/billing?status=cancelled`,
      });
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      setError("No checkout URL returned. Check ModemPay configuration.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="dash-page-title">Premium</h1>
      <p className="dash-page-subtitle" style={{ marginTop: -8, marginBottom: 20 }}>
        Unlock AI career tools and recruitment insights. Pay securely with ModemPay (GMD).
      </p>

      {error ? <div className="dash-alert error">{error}</div> : null}
      {success ? <div className="dash-alert success">{success}</div> : null}

      <div className="dash-grid-2" style={{ gap: 20 }}>
        <div className="dash-card">
          <h3 className="dash-card-title">Your plan</h3>
          <p style={{ fontSize: 28, fontWeight: 800, margin: "8px 0" }}>
            {isPremium ? "Premium" : "Free"}
          </p>
          {status?.planExpiresAt ? (
            <p className="text-sm text-zinc-500">
              Renews / expires {new Date(status.planExpiresAt).toLocaleDateString()}
            </p>
          ) : (
            <p className="text-sm text-zinc-500">Upgrade anytime — cancel by letting the period end.</p>
          )}

          {status?.features ? (
            <ul style={{ marginTop: 16, paddingLeft: 18, lineHeight: 1.8, fontSize: 14 }}>
              <li>
                AI Coach:{" "}
                {status.features.coachChat?.limit == null
                  ? "Unlimited"
                  : `${status.features.coachChat.used}/${status.features.coachChat.limit} today`}
              </li>
              <li>Learning roadmap: {status.features.learningRoadmap?.allowed ? "Included" : "Premium"}</li>
                  <li>Exact match scores: {status.features.advancedMatch?.allowed ? "Included" : "Premium"}</li>
              {user?.role === "employer" ? (
                <>
                  <li>
                    Active jobs:{" "}
                    {status.features.jobPosts?.limit == null
                      ? "Unlimited"
                      : `${status.features.jobPosts.used}/${status.features.jobPosts.limit}`}
                  </li>
                  <li>
                    Full AI ranking: {status.features.employerRanking?.fullAccess ? "Included" : "Top 3 only"}
                  </li>
                </>
              ) : null}
              {user?.role === "training_provider" ? (
                <li>
                  Active courses:{" "}
                  {status.features.providerCourses?.limit == null
                    ? "Unlimited"
                    : `${status.features.providerCourses.used}/${status.features.providerCourses.limit}`}
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>

        <div className="dash-card">
          <h3 className="dash-card-title">
            {planInfo?.name || "Premium"} — {plans?.currency || "GMD"}
          </h3>
          {!audience ? (
            <p>Premium checkout is for job seekers, employers, and training providers.</p>
          ) : isPremium ? (
            <p style={{ color: "#166534", fontWeight: 600 }}>You already have Premium active. Enjoy the full platform.</p>
          ) : (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {["monthly", "yearly"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`dash-btn ${interval === opt ? "primary" : ""}`}
                    onClick={() => setInterval(opt)}
                  >
                    {opt === "monthly"
                      ? `${planInfo?.monthly} GMD / mo`
                      : `${planInfo?.yearly} GMD / yr`}
                  </button>
                ))}
              </div>
              <ul style={{ paddingLeft: 18, lineHeight: 1.8, marginBottom: 20 }}>
                {(planInfo?.features || []).map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              {!status?.modemPayConfigured ? (
                <div className="dash-alert warning">
                  ModemPay is not configured on the server yet. Ask an admin to set{" "}
                  <code>MODEMPAY_SECRET_KEY</code>.
                </div>
              ) : (
                <button
                  type="button"
                  className="dash-btn primary"
                  disabled={loading}
                  onClick={startCheckout}
                >
                  {loading ? "Redirecting…" : "Upgrade with ModemPay"}
                </button>
              )}
            </>
          )}
          {plans?.note ? (
            <p className="text-sm text-zinc-500" style={{ marginTop: 16 }}>
              {plans.note}
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
