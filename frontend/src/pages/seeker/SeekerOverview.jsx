import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import StatusBadge from "../../components/dashboard/StatusBadge.jsx";
import ICONS, { formatDate, formatNumber, Icon } from "../../components/dashboard/icons.jsx";

export default function SeekerOverview() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.applications.mine(), api.jobs.list()])
      .then(([apps, jobList]) => {
        setApplications(apps);
        setJobs(jobList.filter((j) => j.status === "published"));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const profileComplete = [
    user?.fullName,
    user?.location,
    user?.skills?.length,
    user?.cvFileName,
  ].filter(Boolean).length;

  const shortlisted = applications.filter((a) => a.status === "shortlisted");
  const interviews = applications.filter((a) => a.status === "interview");
  const topMatches = jobs
    .filter((j) => j.match?.score)
    .sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0))
    .slice(0, 5);

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
          label="Applied Jobs"
          value={formatNumber(applications.length)}
          icon={<Icon icon={ICONS.applications} size={20} />}
          to="/seeker/applications"
        />
        <StatCard
          label="Shortlisted"
          value={formatNumber(shortlisted.length)}
          icon={<Icon icon={ICONS.recommendations} size={20} />}
          highlight
          to="/seeker/applications?status=shortlisted"
        />
        <StatCard
          label="Interviews"
          value={formatNumber(interviews.length)}
          icon={<Icon icon={ICONS.calendar} size={20} />}
          to="/seeker/applications?status=interview"
        />
        <StatCard
          label="Profile Complete"
          value={`${Math.round((profileComplete / 4) * 100)}%`}
          icon={<Icon icon={ICONS.checkCircle} size={20} />}
          to="/seeker/profile"
        />
        <StatCard
          label="Skills Listed"
          value={formatNumber(user?.skills?.length ?? 0)}
          icon={<Icon icon={ICONS.target} size={20} />}
          to="/seeker/profile#profile-skills"
        />
        <StatCard
          label="Open Jobs"
          value={formatNumber(jobs.length)}
          icon={<Icon icon={ICONS.jobs} size={20} />}
          to="/seeker/recommendations"
        />
      </div>

      <div className="dash-grid-2">
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Top Job Matches</h3>
            <Link to="/seeker/recommendations" className="dash-btn sm">View All</Link>
          </div>
          <div className="dash-pending-list">
            {topMatches.length === 0 ? (
              <p className="dash-empty">
                Upload your CV to get AI-powered job matches.{" "}
                <Link to="/seeker/profile">Update profile</Link>
              </p>
            ) : (
              topMatches.map((job) => (
                <div key={job.id} className="dash-pending-item">
                  <div className="dash-pending-info">
                    <div className="dash-pending-name">{job.title}</div>
                    <div className="dash-pending-date">
                      {job.employer?.companyName || job.employer?.fullName} · {job.location}
                    </div>
                    <div className="dash-match-bar">
                      <div
                        className="dash-match-fill"
                        style={{ width: `${job.match?.score || 0}%` }}
                      />
                    </div>
                    {job.match?.missingSkills?.length > 0 && (
                      <div className="dash-skills" style={{ marginTop: 8 }}>
                        {job.match.missingSkills.slice(0, 2).map((s) => (
                          <span key={s} className="dash-skill-tag missing">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight: 700 }}>
                    {Math.round(job.match?.score || 0)}%
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Recent Applications</h3>
            <Link to="/seeker/applications" className="dash-btn sm">View All</Link>
          </div>
          <div className="dash-pending-list">
            {applications.length === 0 ? (
              <p className="dash-empty">
                No applications yet.{" "}
                <Link to="/seeker/recommendations">Browse jobs</Link>
              </p>
            ) : (
              applications.slice(0, 5).map((app) => (
                <div key={app.id} className="dash-pending-item">
                  <div className="dash-pending-info">
                    <div className="dash-pending-name">{app.job?.title || "Job"}</div>
                    <div className="dash-pending-date">{formatDate(app.createdAt)}</div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {profileComplete < 4 && (
        <div className="dash-alert info">
          Complete your profile for better job matches.{" "}
          <Link to="/seeker/profile" className="dash-inline-link">
            Go to profile <Icon icon={ICONS.arrowRight} size={14} />
          </Link>
        </div>
      )}
    </>
  );
}
