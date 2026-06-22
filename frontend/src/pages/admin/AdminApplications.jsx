import { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import StatusBadge from "../../components/dashboard/StatusBadge.jsx";
import { formatDate, companyInitials } from "../../components/dashboard/icons.jsx";

export default function AdminApplications() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const jobList = await api.jobs.list();
        setJobs(jobList);
        const allApps = await Promise.all(
          jobList.map((j) => api.applications.forJob(j.id).catch(() => []))
        );
        setApplications(
          allApps.flat().map((app) => ({
            ...app,
            job: jobList.find((j) => j.id === app.jobId),
          }))
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="dash-loading" style={{ minHeight: 400 }}>
        <div className="dash-spinner" />
      </div>
    );
  }

  return (
    <>
      <h1 className="dash-page-title">Applications</h1>
      {error && <div className="dash-alert error">{error}</div>}

      <div className="dash-card">
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Job</th>
                <th>Company</th>
                <th>Match</th>
                <th>Status</th>
                <th>Applied</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="dash-empty">No applications yet</td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id}>
                    <td>{app.applicant?.fullName || "—"}</td>
                    <td>{app.job?.title || "—"}</td>
                    <td>
                      {app.job?.employer?.companyName || app.job?.employer?.fullName || "—"}
                    </td>
                    <td>
                      {app.matchScore != null ? `${Math.round(app.matchScore)}%` : "—"}
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
