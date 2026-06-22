import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../services/api.js";
import StatusBadge from "../../components/dashboard/StatusBadge.jsx";
import { formatDate, companyInitials } from "../../components/dashboard/icons.jsx";

const FILTERS = [
  { value: "all", label: "All applications" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interviews" },
];

const PAGE_TITLES = {
  all: "My Applications",
  shortlisted: "Shortlisted Applications",
  interview: "Interview Applications",
};

export default function SeekerApplications() {
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "all";
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.applications
      .mine()
      .then(setApplications)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredApplications = applications.filter((app) => {
    if (statusFilter === "all") return true;
    return app.status === statusFilter;
  });

  const pageTitle = PAGE_TITLES[statusFilter] || PAGE_TITLES.all;

  if (loading) {
    return (
      <div className="dash-loading" style={{ minHeight: 400 }}>
        <div className="dash-spinner" />
      </div>
    );
  }

  return (
    <>
      <h1 className="dash-page-title">{pageTitle}</h1>
      {error && <div className="dash-alert error">{error}</div>}

      <div className="dash-card">
        <div className="dash-card-header">
          <div className="dash-filter-tabs">
            {FILTERS.map((filter) => (
              <Link
                key={filter.value}
                to={
                  filter.value === "all"
                    ? "/seeker/applications"
                    : `/seeker/applications?status=${filter.value}`
                }
                className={`dash-filter-tab${statusFilter === filter.value ? " active" : ""}`}
              >
                {filter.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Match Score</th>
                <th>Status</th>
                <th>Applied</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="dash-empty">
                    {statusFilter === "all"
                      ? "You haven't applied to any jobs yet"
                      : `No ${statusFilter} applications yet`}
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id}>
                    <td>{app.job?.title || "—"}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="dash-company-logo" style={{ width: 28, height: 28, fontSize: 10 }}>
                          {companyInitials(
                            app.job?.employer?.companyName || app.job?.employer?.fullName
                          )}
                        </span>
                        {app.job?.employer?.companyName || app.job?.employer?.fullName || "—"}
                      </div>
                    </td>
                    <td>{app.job?.location || "—"}</td>
                    <td>
                      {app.matchScore != null ? (
                        <strong>{Math.round(app.matchScore)}%</strong>
                      ) : "—"}
                    </td>
                    <td><StatusBadge status={app.status} /></td>
                    <td>{formatDate(app.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
