import { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import StatusBadge from "../../components/dashboard/StatusBadge.jsx";
import { formatDate, companyInitials } from "../../components/dashboard/icons.jsx";

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("pending_review");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.jobs
      .list()
      .then(setJobs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  const moderate = async (id, status) => {
    try {
      const updated = await api.admin.moderateJob(id, status);
      setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="dash-loading" style={{ minHeight: 400 }}>
        <div className="dash-spinner" />
      </div>
    );
  }

  return (
    <>
      <h1 className="dash-page-title">Jobs</h1>
      {error && <div className="dash-alert error">{error}</div>}

      <div className="dash-card">
        <div className="dash-card-header">
          <h3 className="dash-card-title">Job Moderation</h3>
          <select
            className="dash-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending_review">Pending Review</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Status</th>
                <th>Posted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="dash-empty">No jobs in this category</td>
                </tr>
              ) : (
                filtered.map((job) => (
                  <tr key={job.id}>
                    <td>{job.title}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="dash-company-logo" style={{ width: 28, height: 28, fontSize: 10 }}>
                          {companyInitials(job.employer?.companyName || job.employer?.fullName)}
                        </span>
                        {job.employer?.companyName || job.employer?.fullName}
                      </div>
                    </td>
                    <td>{job.location || "—"}</td>
                    <td>
                      <StatusBadge status={job.status?.replace(/_/g, " ")} />
                    </td>
                    <td>{formatDate(job.createdAt)}</td>
                    <td>
                      <div className="dash-actions">
                        {job.status !== "published" && (
                          <button
                            type="button"
                            className="dash-btn sm primary"
                            onClick={() => moderate(job.id, "published")}
                          >
                            Publish
                          </button>
                        )}
                        {job.status !== "rejected" && (
                          <button
                            type="button"
                            className="dash-btn sm danger"
                            onClick={() => moderate(job.id, "rejected")}
                          >
                            Reject
                          </button>
                        )}
                        {job.status !== "closed" && (
                          <button
                            type="button"
                            className="dash-btn sm"
                            onClick={() => moderate(job.id, "closed")}
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </td>
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
