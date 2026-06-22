import { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import StatCard from "../../components/dashboard/StatCard.jsx";
import StatusBadge from "../../components/dashboard/StatusBadge.jsx";
import { formatDate, formatNumber } from "../../components/dashboard/icons.jsx";

export default function EmployerAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.employer
      .analytics()
      .then(setAnalytics)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="dash-loading" style={{ minHeight: 400 }}>
        <div className="dash-spinner" />
      </div>
    );
  }

  const funnel = analytics?.funnel || {};
  const funnelData = [
    { label: "Applied", value: funnel.applied ?? 0 },
    { label: "Shortlisted", value: funnel.shortlisted ?? 0 },
    { label: "Interview", value: funnel.interview ?? 0 },
    { label: "Hired", value: funnel.hired ?? 0 },
  ];

  return (
    <>
      <h1 className="dash-page-title">Hiring Analytics</h1>
      {error && <div className="dash-alert error">{error}</div>}

      <div className="dash-stats-row">
        <StatCard label="Active Jobs" value={formatNumber(analytics?.jobs?.published ?? 0)} highlight />
        <StatCard label="Total Applicants" value={formatNumber(analytics?.applications?.total ?? 0)} />
        <StatCard label="Avg Match Score" value={`${analytics?.applications?.avgMatchScore ?? 0}%`} />
        <StatCard label="Hired" value={formatNumber(analytics?.funnel?.hired ?? 0)} />
      </div>

      <div className="dash-grid-2">
        <div className="dash-card">
          <h3 className="dash-card-title">Hiring Funnel</h3>
          <div className="dash-pending-list">
            {funnelData.map((step) => (
              <div key={step.label} className="dash-pending-item">
                <span>{step.label}</span>
                <div className="dash-match-bar" style={{ flex: 1, margin: "0 12px" }}>
                  <div
                    className="dash-match-fill"
                    style={{
                      width: `${funnel.applied ? Math.round((step.value / funnel.applied) * 100) : 0}%`,
                    }}
                  />
                </div>
                <strong>{step.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card">
          <h3 className="dash-card-title">Applications by Status</h3>
          <div className="dash-pending-list">
            {Object.entries(analytics?.applications?.byStatus || {}).map(([status, count]) => (
              <div key={status} className="dash-pending-item">
                <StatusBadge status={status} />
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dash-card">
        <h3 className="dash-card-title">Performance by Job</h3>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Status</th>
                <th>Views</th>
                <th>Applicants</th>
                <th>Avg Match</th>
              </tr>
            </thead>
            <tbody>
              {(analytics?.applicationsByJob || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="dash-empty">No job data yet</td>
                </tr>
              ) : (
                analytics.applicationsByJob.map((row) => (
                  <tr key={row.jobId}>
                    <td>{row.title}</td>
                    <td><StatusBadge status={row.status} /></td>
                    <td>{row.views ?? 0}</td>
                    <td>{row.applicantCount}</td>
                    <td>{row.avgMatchScore}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dash-card">
        <h3 className="dash-card-title">Recent Applicants</h3>
        <div className="dash-pending-list">
          {(analytics?.recentApplications || []).length === 0 ? (
            <p className="dash-empty">No recent applications</p>
          ) : (
            analytics.recentApplications.map((app) => (
              <div key={app.id} className="dash-pending-item">
                <div className="dash-pending-info">
                  <div className="dash-pending-name">{app.applicant?.fullName || "Applicant"}</div>
                  <div className="dash-pending-date">
                    {app.job?.title} · Match {app.matchScore}% · {formatDate(app.createdAt)}
                  </div>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
