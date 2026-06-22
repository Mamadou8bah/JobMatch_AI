import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api.js";
import StatusBadge from "../../components/dashboard/StatusBadge.jsx";
import { companyInitials } from "../../components/dashboard/icons.jsx";

export default function SeekerRecommendations() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [detailJob, setDetailJob] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [applyJob, setApplyJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);

  const loadJobs = () => {
    setLoading(true);
    Promise.all([
      api.jobs.list({ search: search || undefined, location: location || undefined, status: "published" }),
      api.applications.mine(),
    ])
      .then(([jobList, applications]) => {
        setJobs(
          [...jobList].sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0))
        );
        setAppliedJobIds(new Set(applications.map((app) => app.job?.id).filter(Boolean)));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const openDetail = async (job) => {
    setDetailJob(job);
    setDetailLoading(true);

    try {
      let match = job.match;
      if (match?.score == null) {
        match = await api.ai.matchScore(job.id);
      }

      const missingSkills = match?.missingSkills || [];
      let recommendations = [];

      if (missingSkills.length) {
        try {
          const personalized = await api.training.personalized(job.id);
          recommendations = personalized.recommendations || [];
        } catch {
          try {
            const fallback = await api.ai.trainingRecommendations(missingSkills);
            recommendations = fallback.recommendations || [];
          } catch {
            recommendations = [];
          }
        }
      }

      setDetailJob({
        ...job,
        match: {
          score: match?.score,
          missingSkills,
          matchedSkills: match?.matchedSkills || [],
        },
        recommendations,
      });
    } catch {
      setDetailJob(job);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!applyJob) return;

    setApplying(true);
    setError("");
    try {
      await api.applications.apply(applyJob.id, coverLetter || undefined);
      setAppliedJobIds((prev) => new Set(prev).add(applyJob.id));
      setSuccess("Application submitted!");
      setApplyJob(null);
      setCoverLetter("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setApplying(false);
    }
  };

  const messageEmployer = async (job) => {
    const employerId = job.employer?.id || job.employerId;
    if (!employerId) return;

    try {
      await api.chat.createThread(employerId, job.id);
      navigate("/seeker/messages");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <h1 className="dash-page-title">Recommended Jobs</h1>
      {error && <div className="dash-alert error">{error}</div>}
      {success && <div className="dash-alert success">{success}</div>}

      <div className="dash-card" style={{ marginBottom: 20 }}>
        <div className="dash-form-row">
          <div className="dash-form-group" style={{ marginBottom: 0 }}>
            <input
              className="dash-input"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="dash-form-group" style={{ marginBottom: 0 }}>
            <input
              className="dash-input"
              placeholder="Location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button type="button" className="dash-btn primary" onClick={loadJobs}>
            Search
          </button>
        </div>
      </div>

      {loading ? (
        <div className="dash-loading" style={{ minHeight: 200 }}>
          <div className="dash-spinner" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="dash-card">
          <p className="dash-empty">No jobs found matching your criteria</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {jobs.map((job) => {
            const applied = appliedJobIds.has(job.id);
            return (
              <div key={job.id} className="dash-card dash-job-card">
                <div className="dash-job-card-inner">
                  <div className="dash-job-card-main">
                    <div className="dash-company-logo">
                      {companyInitials(job.employer?.companyName || job.employer?.fullName)}
                    </div>
                    <div className="dash-job-card-content">
                      <button type="button" className="dash-link-btn" onClick={() => openDetail(job)}>
                        <h3 style={{ margin: "0 0 4px", fontSize: "1rem", fontWeight: 600 }}>
                          {job.title}
                        </h3>
                      </button>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "#71717a" }}>
                        {job.employer?.companyName || job.employer?.fullName} · {job.location} · {job.employmentType}
                      </p>
                      <p style={{ margin: "8px 0 0", fontSize: "0.85rem", color: "#52525b", lineHeight: 1.5 }}>
                        {job.description?.slice(0, 180)}…
                      </p>
                      <div className="dash-skills" style={{ marginTop: 10 }}>
                        {(job.requiredSkills || []).slice(0, 5).map((s) => (
                          <span key={s} className="dash-skill-tag">{s}</span>
                        ))}
                      </div>
                      {job.match?.missingSkills?.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: 4 }}>
                            Skills to develop
                          </div>
                          <div className="dash-skills">
                            {job.match.missingSkills.slice(0, 3).map((s) => (
                              <span key={s} className="dash-skill-tag missing">{s}</span>
                            ))}
                            {job.match.missingSkills.length > 3 && (
                              <span className="dash-skill-tag missing">
                                +{job.match.missingSkills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="dash-job-card-actions">
                    {job.match?.score != null ? (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: "1.5rem" }}>
                          {Math.round(job.match.score)}%
                        </div>
                        <div className="dash-match-bar" style={{ width: 80 }}>
                          <div className="dash-match-fill" style={{ width: `${job.match.score}%` }} />
                        </div>
                      </div>
                    ) : (
                      <StatusBadge status="pending" />
                    )}
                    <div className="dash-job-card-buttons">
                      <button type="button" className="dash-btn sm" onClick={() => openDetail(job)}>
                        View details
                      </button>
                      {applied ? (
                        <span className="dash-btn sm" style={{ opacity: 0.7 }}>Applied</span>
                      ) : (
                        <button
                          type="button"
                          className="dash-btn primary sm"
                          onClick={() => setApplyJob(job)}
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detailJob && (
        <div className="dash-modal-backdrop" onClick={() => setDetailJob(null)}>
          <div className="dash-modal dash-modal-scroll" onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <h3>{detailJob.title}</h3>
              <p className="dash-modal-subtitle">
                {detailJob.employer?.companyName || detailJob.employer?.fullName} · {detailJob.location}
              </p>
            </div>

            <div className="dash-modal-body">
              <p className="dash-modal-description">{detailJob.description}</p>
              {detailJob.match?.score != null && (
                <p><strong>Match score:</strong> {Math.round(detailJob.match.score)}%</p>
              )}

              {detailLoading ? (
                <div className="dash-loading" style={{ minHeight: 80, marginTop: 16 }}>
                  <div className="dash-spinner" />
                </div>
              ) : (
                <>
                  {detailJob.match?.matchedSkills?.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <div className="dash-form-label">Skills you have</div>
                      <div className="dash-skills">
                        {detailJob.match.matchedSkills.map((s) => (
                          <span key={s} className="dash-skill-tag matched">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {detailJob.match?.missingSkills?.length > 0 ? (
                    <div style={{ marginTop: 16 }}>
                      <div className="dash-form-label">Skills to develop</div>
                      <div className="dash-skills">
                        {detailJob.match.missingSkills.map((s) => (
                          <span key={s} className="dash-skill-tag missing">{s}</span>
                        ))}
                      </div>
                    </div>
                  ) : detailJob.match?.score != null ? (
                    <div className="dash-alert success" style={{ marginTop: 16 }}>
                      You match all required skills for this role.
                    </div>
                  ) : null}

                  {detailJob.recommendations?.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <div className="dash-form-label">Recommended courses</div>
                      <div className="dash-pending-list">
                        {detailJob.recommendations.map((rec, index) => (
                          <div key={`${rec.title}-${index}`} className="dash-pending-item">
                            <div className="dash-pending-info">
                              <div className="dash-pending-name">{rec.title}</div>
                              <div className="dash-pending-date">
                                {[rec.provider, rec.skill].filter(Boolean).join(" · ")}
                              </div>
                              {rec.description && (
                                <p style={{ fontSize: "0.8rem", margin: "4px 0 0", color: "#52525b" }}>
                                  {rec.description}
                                </p>
                              )}
                            </div>
                            {rec.url && (
                              <a
                                href={rec.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="dash-btn sm primary"
                                style={{ textDecoration: "none" }}
                              >
                                View course
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="dash-modal-footer">
              {!appliedJobIds.has(detailJob.id) && (
                <button type="button" className="dash-btn primary" onClick={() => { setApplyJob(detailJob); setDetailJob(null); }}>
                  Apply now
                </button>
              )}
              <button type="button" className="dash-btn" onClick={() => messageEmployer(detailJob)}>
                Message employer
              </button>
              <button type="button" className="dash-btn" onClick={() => setDetailJob(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {applyJob && (
        <div className="dash-modal-backdrop" onClick={() => setApplyJob(null)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Apply to {applyJob.title}</h3>
            <form onSubmit={handleApply}>
              <div className="dash-form-group">
                <label className="dash-form-label">Cover letter (optional)</label>
                <textarea
                  className="dash-textarea"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Explain why you are a good fit..."
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="dash-btn primary" disabled={applying}>
                  {applying ? "Submitting..." : "Submit application"}
                </button>
                <button type="button" className="dash-btn" onClick={() => setApplyJob(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
