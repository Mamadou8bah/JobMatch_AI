import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function EmployerRanking() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [matches, setMatches] = useState([]);
  const [premiumGate, setPremiumGate] = useState(null);
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
    setError("");
    api.jobs
      .matches(selectedJob)
      .then((data) => {
        if (Array.isArray(data)) {
          setMatches(data);
          setPremiumGate(null);
        } else {
          setMatches(data.matches || []);
          setPremiumGate(data.premiumRequired ? data : null);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedJob]);

  return (
    <>
      <h1 className="dash-page-title">Applicant Ranking</h1>
      {error && <div className="dash-alert error">{error}</div>}
      {premiumGate ? (
        <div className="dash-alert warning">
          {premiumGate.message}{" "}
          <Link to="/employer/billing" className="dash-inline-link">
            Upgrade to Premium
          </Link>
          {premiumGate.totalCandidates != null
            ? ` (${premiumGate.totalCandidates} candidates matched)`
            : null}
        </div>
      ) : null}

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
                      {(entry.match?.matchedSkills || candidate?.skills || [])
                        .slice(0, 4)
                        .map((skill) => (
                          <span key={skill} className="dash-skill-tag">{skill}</span>
                        ))}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: "#1B6B45" }}>
                    {Math.round(score)}%
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
