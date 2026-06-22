import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import StatusBadge from "../../components/dashboard/StatusBadge.jsx";
import ICONS, { formatDate, formatNumber, companyInitials, Icon } from "../../components/dashboard/icons.jsx";

export default function EmployerOverview() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const allJobs = await api.jobs.list();
        const myJobs = allJobs.filter((j) => j.employerId === user?.id);
        setJobs(myJobs);

        const appLists = await Promise.all(
          myJobs.map((j) =>
            api.applications.forJob(j.id).catch(() => [])
          )
        );
        setApplications(appLists.flat());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (user?.id) load();
  }, [user?.id]);

  const activeJobs = jobs.filter((j) => j.status === "published");
  const pendingApps = applications.filter((a) => a.status === "pending");
  const interviews = applications.filter((a) => a.status === "interview");

  if (loading) {
    return (
      <div className="dash-loading" style={{ minHeight: 400 }}>
        <div className="dash-spinner" />
      </div>
    );
  }

  if (!user?.approved && user?.role === "employer") {
    return (
      <>
        <h1 className="dash-page-title">Dashboard</h1>
        <div className="dash-alert info">
          Your employer account is pending admin approval. You will be able to post jobs once approved.
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="dash-page-title">Dashboard</h1>
      {error && <div className="dash-alert error">{error}</div>}

      <div className="dash-stats-row">
        <StatCard label="Active Job Posts" value={formatNumber(activeJobs.length)} icon={<Icon icon={ICONS.jobs} size={20} />} highlight />
        <StatCard label="Total Applicants" value={formatNumber(applications.length)} icon={<Icon icon={ICONS.candidates} size={20} />} />
        <StatCard label="Pending Review" value={formatNumber(pendingApps.length)} icon={<Icon icon={ICONS.clock} size={20} />} />
        <StatCard label="Interviews Scheduled" value={formatNumber(interviews.length)} icon={<Icon icon={ICONS.calendar} size={20} />} />
        <StatCard label="Total Jobs" value={formatNumber(jobs.length)} icon={<Icon icon={ICONS.clipboard} size={20} />} />
        <StatCard
          label="Company"
          value={user?.companyName || "—"}
          icon={<Icon icon={ICONS.companies} size={20} />}
        />
      </div>

      <div className="dash-grid-2">
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Recent Applicants</h3>
            <Link to="/employer/candidates" className="dash-btn sm">
              View All
            </Link>
          </div>
          <div className="dash-pending-list">
            {applications.length === 0 ? (
              <p className="dash-empty">No applicants yet</p>
            ) : (
              applications.slice(0, 5).map((app) => (
                <div key={app.id} className="dash-pending-item">
                  <div className="dash-company-logo">
                    {(app.applicant?.fullName || "?").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="dash-pending-info">
                    <div className="dash-pending-name">
                      {app.applicant?.fullName || "Applicant"}
                    </div>
                    <div className="dash-pending-date">
                      Match: {app.matchScore != null ? `${Math.round(app.matchScore)}%` : "—"} · {formatDate(app.createdAt)}
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Quick Actions</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link to="/employer/post" className="dash-btn primary" style={{ textAlign: "center", textDecoration: "none", justifyContent: "center" }}>
              <Icon icon={ICONS.plus} size={16} />
              Post a New Job
            </Link>
            <Link to="/employer/jobs" className="dash-btn" style={{ textAlign: "center", textDecoration: "none" }}>
              Manage Jobs
            </Link>
            <Link to="/employer/ranking" className="dash-btn" style={{ textAlign: "center", textDecoration: "none" }}>
              AI Applicant Ranking
            </Link>
          </div>
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-header">
          <h3 className="dash-card-title">Your Job Posts</h3>
          <Link to="/employer/jobs" className="dash-btn sm">Manage All</Link>
        </div>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Location</th>
                <th>Status</th>
                <th>Posted</th>
                <th>Views</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="dash-empty">
                    No jobs posted yet. <Link to="/employer/post">Post your first job</Link>
                  </td>
                </tr>
              ) : (
                jobs.slice(0, 8).map((job) => (
                  <tr key={job.id}>
                    <td>{job.title}</td>
                    <td>{job.location || "—"}</td>
                    <td><StatusBadge status={job.status?.replace(/_/g, " ")} /></td>
                    <td>{formatDate(job.createdAt)}</td>
                    <td>{job.views ?? 0}</td>
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
