import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import StatusBadge from "../../components/dashboard/StatusBadge.jsx";
import ICONS, { formatDate, Icon } from "../../components/dashboard/icons.jsx";

export default function EmployerJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.jobs
      .list()
      .then((all) => setJobs(all.filter((j) => j.employerId === user?.id)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this job posting?")) return;
    try {
      await api.jobs.delete(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = async (id) => {
    try {
      const updated = await api.jobs.update(id, { status: "closed" });
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
      <h1 className="dash-page-title">My Jobs</h1>
      {error && <div className="dash-alert error">{error}</div>}

      <div className="dash-card">
        <div className="dash-card-header">
          <h3 className="dash-card-title">Manage Jobs</h3>
          <Link to="/employer/post" className="dash-btn primary sm" style={{ display: "inline-flex", alignItems: "center" }}>
            <Icon icon={ICONS.plus} size={14} />
            Post Job
          </Link>
        </div>

        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Status</th>
                <th>Posted</th>
                <th>Views</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="dash-empty">
                    No jobs yet. <Link to="/employer/post">Post one now</Link>
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.title}</td>
                    <td>{job.location || "—"}</td>
                    <td><StatusBadge status={job.status?.replace(/_/g, " ")} /></td>
                    <td>{formatDate(job.createdAt)}</td>
                    <td>{job.views ?? 0}</td>
                    <td>
                      <div className="dash-actions">
                        <Link to={`/employer/jobs/${job.id}/edit`} className="dash-btn sm">
                          Edit
                        </Link>
                        <Link to={`/employer/candidates?job=${job.id}`} className="dash-btn sm">
                          Applicants
                        </Link>
                        {job.status !== "closed" && (
                          <button
                            type="button"
                            className="dash-btn sm"
                            onClick={() => handleClose(job.id)}
                          >
                            Close
                          </button>
                        )}
                        <button
                          type="button"
                          className="dash-btn sm danger"
                          onClick={() => handleDelete(job.id)}
                        >
                          Delete
                        </button>
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
