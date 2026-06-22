import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const routes = {
      job_seeker: "/seeker",
      employer: "/employer",
      admin: "/admin",
    };
    return <Navigate to={routes[user.role] || "/"} replace />;
  }

  return children;
}
