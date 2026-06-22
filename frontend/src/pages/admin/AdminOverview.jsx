import { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import EmployerReviewModal from "../../components/admin/EmployerReviewModal.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import StatusBadge from "../../components/dashboard/StatusBadge.jsx";
import StatsChart, { buildMonthlyData } from "../../components/dashboard/StatsChart.jsx";
import ICONS, { formatDate, formatNumber, companyInitials, Icon } from "../../components/dashboard/icons.jsx";

export default function AdminOverview() {
  const [analytics, setAnalytics] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewEmployer, setReviewEmployer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [analyticsData, jobsData, usersData] = await Promise.all([
          api.admin.analytics(),
          api.jobs.list(),
          api.users.list(),
        ]);
        setAnalytics(analyticsData);
        setJobs(jobsData);
        setUsers(usersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const pendingEmployers = users.filter(
    (u) => u.role === "employer" && !u.approved && !u.blocked
  );

  const pendingJobs = jobs.filter(
    (j) => j.status === "pending_review" || j.status === "pending"
  );

  const reportedJobs = jobs.filter((j) => j.status === "rejected");

  const filteredJobs =
    statusFilter === "all"
      ? jobs
      : jobs.filter((j) => j.status === statusFilter);

  const chartData = buildMonthlyData(jobs, []);

  const handleApproveEmployer = async (id) => {
    try {
      setActionLoading(true);
      const updated = await api.admin.approveUser(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      setReviewEmployer(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
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
      <h1 className="dash-page-title">Dashboard</h1>
      {error && <div className="dash-alert error">{error}</div>}

      <div className="dash-stats-row">
        <StatCard
          label="Total Users"
          value={formatNumber(analytics?.users?.total ?? users.length)}
          icon={<Icon icon={ICONS.users} size={20} />}
        />
        <StatCard
          label="Total Companies"
          value={formatNumber(analytics?.users?.employers ?? 0)}
          icon={<Icon icon={ICONS.companies} size={20} />}
        />
        <StatCard
          label="Active Jobs Posted"
          value={formatNumber(analytics?.jobs?.published ?? 0)}
          icon={<Icon icon={ICONS.jobs} size={20} />}
          highlight
        />
        <StatCard
          label="Total Applications"
          value={formatNumber(analytics?.applications?.total ?? 0)}
          icon={<Icon icon={ICONS.applications} size={20} />}
        />
        <StatCard
          label="Pending Jobs"
          value={formatNumber(analytics?.jobs?.pendingReview ?? pendingJobs.length)}
          icon={<Icon icon={ICONS.alertTriangle} size={20} />}
        />
        <StatCard
          label="Reported Jobs"
          value={formatNumber(reportedJobs.length)}
          icon={<Icon icon={ICONS.ban} size={20} />}
        />
      </div>

      <div className="dash-grid-2">
        <StatsChart data={chartData} title="Statistics" />

        <div className="dash-card">
          <h3 className="dash-card-title">Pending Approvals</h3>
          <div className="dash-pending-list">
            {pendingEmployers.length === 0 ? (
              <p className="dash-empty">No pending employer approvals</p>
            ) : (
              pendingEmployers.slice(0, 6).map((employer) => (
                <button
                  key={employer.id}
                  type="button"
                  className="dash-pending-item clickable"
                  onClick={() => setReviewEmployer(employer)}
                >
                  <div className="dash-company-logo">
                    {companyInitials(employer.companyName || employer.fullName)}
                  </div>
                  <div className="dash-pending-info">
                    <div className="dash-pending-name">
                      {employer.companyName || employer.fullName}
                    </div>
                    <div className="dash-pending-date">
                      {formatDate(employer.createdAt)} · Click to review
                    </div>
                  </div>
                  <StatusBadge status="Pending" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-header">
          <h3 className="dash-card-title">Manage Jobs</h3>
          <div className="dash-actions">
            <select
              className="dash-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="pending_review">Pending Review</option>
              <option value="rejected">Rejected</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Status</th>
                <th>Posted Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="dash-empty">
                    No jobs found
                  </td>
                </tr>
              ) : (
                filteredJobs.slice(0, 10).map((job) => (
                  <tr key={job.id}>
                    <td>{job.title}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="dash-company-logo" style={{ width: 28, height: 28, fontSize: 10 }}>
                          {companyInitials(job.employer?.companyName || job.employer?.fullName)}
                        </span>
                        {job.employer?.companyName || job.employer?.fullName || "—"}
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
                            onClick={async () => {
                              await api.admin.moderateJob(job.id, "published");
                              setJobs((prev) =>
                                prev.map((j) =>
                                  j.id === job.id ? { ...j, status: "published" } : j
                                )
                              );
                            }}
                          >
                            Approve
                          </button>
                        )}
                        {job.status !== "rejected" && (
                          <button
                            type="button"
                            className="dash-btn sm danger"
                            onClick={async () => {
                              await api.admin.moderateJob(job.id, "rejected");
                              setJobs((prev) =>
                                prev.map((j) =>
                                  j.id === job.id ? { ...j, status: "rejected" } : j
                                )
                              );
                            }}
                          >
                            Reject
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

      <EmployerReviewModal
        employer={reviewEmployer}
        onClose={() => setReviewEmployer(null)}
        onApprove={handleApproveEmployer}
        actionLoading={actionLoading}
      />
    </>
  );
}
