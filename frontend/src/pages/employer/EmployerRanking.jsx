import { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import StatusBadge from "../../components/dashboard/StatusBadge.jsx";

export default function EmployerRanking() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.jobs
      .list()
      .then((all) => {
        const mine = all.filter((j) => j.employerId === user?.id);
        setJobs(mine);
        if (mine.length) setSelectedJob(mine[0].id);
      })
      .catch((err) => setError(err.message));
  }, [user?.id]);

  useEffect(() => {
    if (!selectedJob) return;
    setLoading(true);
    api.jobs
      .matches(selectedJob)
      .then(setMatches)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedJob]);

  return (
    <>
      <h1 className="dash-page-title">Applicant Ranking</h1>
      {error && <div className="dash-alert error">{error}</div>}

      <div className="dash-card">
        <div className="dash-card-header">
          <h3 className="dash-card-title">AI-Ranked Candidates</h3>
          <select
            className="dash-select"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="dash-loading" style={{ minHeight: 200 }}>
            <div className="dash-spinner" />
          </div>
        ) : matches.length === 0 ? (
          <p className="dash-empty">No ranked candidates yet for this job</p>
        ) : (
          <div className="dash-pending-list">
            {matches.map((entry, idx) => {
              const score = entry.match?.score ?? entry.match?.matchScore ?? 0;
              const candidate = entry.user || entry.candidate;
              return (
                <div key={candidate?.id || idx} className="dash-pending-item">
                  <div
                    className="dash-company-logo"
                    style={{
                      background: idx === 0 ? "#18181b" : undefined,
                      color: idx === 0 ? "#fff" : undefined,
                    }}
                  >
                    #{idx + 1}
                  </div>
                  <div className="dash-pending-info">
                    <div className="dash-pending-name">
                      {candidate?.fullName || "Candidate"}
                    </div>
                    <div className="dash-skills" style={{ marginTop: 6 }}>
                      {(entry.match?.matchedSkills || []).slice(0, 4).map((s) => (
                        <span key={s} className="dash-skill-tag">{s}</span>
                      ))}
                      {(entry.match?.missingSkills || []).slice(0, 2).map((s) => (
                        <span key={s} className="dash-skill-tag missing">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                      {Math.round(score)}%
                    </div>
                    <StatusBadge
                      status={
                        score >= 70 ? "shortlisted" : score >= 40 ? "pending" : "rejected"
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
