import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import StatusBadge from "../../components/dashboard/StatusBadge.jsx";
import { formatDate } from "../../components/dashboard/icons.jsx";

const STATUS_OPTIONS = ["pending", "shortlisted", "interview", "rejected", "hired"];

export default function EmployerCandidates() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobFilter = searchParams.get("job");

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(jobFilter || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.jobs
      .list()
      .then((all) => {
        const mine = all.filter((j) => j.employerId === user?.id);
        setJobs(mine);
        if (!selectedJob && mine.length) setSelectedJob(jobFilter || mine[0].id);
      })
      .catch((err) => setError(err.message));
  }, [user?.id, jobFilter, selectedJob]);

  useEffect(() => {
    if (!selectedJob) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.applications
      .forJob(selectedJob)
      .then(setApplications)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedJob]);

  const updateStatus = async (appId, status) => {
    let interviewMessage;
    if (status === "interview") {
      interviewMessage = window.prompt(
        "Optional message for the candidate (date, time, location, etc.):"
      );
      if (interviewMessage === null) return;
    }
    try {
      const updated = await api.applications.updateStatus(appId, status, interviewMessage || undefined);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? updated : a))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const messageApplicant = async (app) => {
    const applicantId = app.applicant?.id || app.user?.id;
    if (!applicantId) return;

    try {
      await api.chat.createThread(applicantId, selectedJob);
      navigate("/employer/messages");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <h1 className="dash-page-title">Candidates</h1>
      {error && <div className="dash-alert error">{error}</div>}

      <div className="dash-card">
        <div className="dash-card-header">
          <h3 className="dash-card-title">Applicants</h3>
          <select
            className="dash-select"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
          >
            <option value="">Select a job</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="dash-loading" style={{ minHeight: 200 }}>
            <div className="dash-spinner" />
          </div>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Email</th>
                  <th>Match Score</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="dash-empty">No applicants for this job</td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id}>
                      <td>{app.applicant?.fullName || "—"}</td>
                      <td>{app.applicant?.email || "—"}</td>
                      <td>
                        {app.matchScore != null ? (
                          <div>
                            <strong>{Math.round(app.matchScore)}%</strong>
                            <div className="dash-match-bar">
                              <div
                                className="dash-match-fill"
                                style={{ width: `${app.matchScore}%` }}
                              />
                            </div>
                          </div>
                        ) : "—"}
                      </td>
                      <td><StatusBadge status={app.status} /></td>
                      <td>{formatDate(app.createdAt)}</td>
                      <td>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <select
                            className="dash-select"
                            value={app.status}
                            onChange={(e) => updateStatus(app.id, e.target.value)}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="dash-btn sm"
                            onClick={() => messageApplicant(app)}
                          >
                            Message
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
