import { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import StatCard from "../../components/dashboard/StatCard.jsx";
import StatsChart, { buildMonthlyData } from "../../components/dashboard/StatsChart.jsx";
import { formatNumber } from "../../components/dashboard/icons.jsx";

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.admin.analytics(), api.jobs.list()])
      .then(([a, j]) => {
        setAnalytics(a);
        setJobs(j);
      })
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

  const chartData = buildMonthlyData(jobs, []);
  const topSkills = analytics?.labourMarket?.topRequiredSkills || [];

  return (
    <>
      <h1 className="dash-page-title">Analytics</h1>
      {error && <div className="dash-alert error">{error}</div>}

      <div className="dash-stats-row">
        <StatCard
          label="Job Seekers"
          value={formatNumber(analytics?.users?.jobSeekers ?? 0)}
        />
        <StatCard
          label="Employers"
          value={formatNumber(analytics?.users?.employers ?? 0)}
        />
        <StatCard
          label="Pending Employers"
          value={formatNumber(analytics?.users?.pendingEmployers ?? 0)}
        />
        <StatCard
          label="Hired"
          value={formatNumber(analytics?.applications?.hired ?? 0)}
          highlight
        />
        <StatCard
          label="Open Chats"
          value={formatNumber(analytics?.engagement?.openChatThreads ?? 0)}
        />
        <StatCard
          label="Training Courses"
          value={formatNumber(analytics?.training?.courses ?? 0)}
        />
      </div>

      <div className="dash-grid-2">
        <StatsChart data={chartData} title="Platform Activity" />

        <div className="dash-card">
          <h3 className="dash-card-title">Top Required Skills</h3>
          {topSkills.length === 0 ? (
            <p className="dash-empty">No skill data yet</p>
          ) : (
            <div className="dash-pending-list">
              {topSkills.slice(0, 8).map((item) => (
                <div key={item.skill} className="dash-pending-item">
                  <div className="dash-pending-info">
                    <div className="dash-pending-name">{item.skill}</div>
                    <div className="dash-match-bar">
                      <div
                        className="dash-match-fill"
                        style={{
                          width: `${Math.min(100, (item.count / (topSkills[0]?.count || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
