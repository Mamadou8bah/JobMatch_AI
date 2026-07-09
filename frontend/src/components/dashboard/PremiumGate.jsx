import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { billingPathForRole } from "../../services/api.js";

export default function PremiumGate({
  title = "Premium feature",
  message,
  children,
  compact = false,
}) {
  const { user } = useAuth();
  const to = billingPathForRole(user?.role);

  return (
    <div className={`dash-alert warning ${compact ? "" : "dash-premium-gate"}`}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <p style={{ margin: "0 0 12px", lineHeight: 1.5 }}>
        {message ||
          "This feature is included with JobMatch Premium. Upgrade to unlock AI tools that help you compete."}
      </p>
      {children}
      <Link to={to} className="dash-btn primary" style={{ display: "inline-flex" }}>
        Upgrade to Premium
      </Link>
    </div>
  );
}

export function isPremiumUser(user) {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.plan !== "premium" && user.plan !== "PREMIUM") return false;
  if (user.planExpiresAt && new Date(user.planExpiresAt).getTime() < Date.now()) return false;
  return true;
}
