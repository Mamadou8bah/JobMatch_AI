import { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function SeekerTraining() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [roadmap, setRoadmap] = useState(null);
  const [goal, setGoal] = useState("Frontend Developer");
  const [loading, setLoading] = useState(true);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const allCourses = await api.training.list();
        setCourses(allCourses);

        if (user?.skills?.length) {
          const topJobs = await api.jobs.list({ status: "published" });
          const bestJob = [...topJobs].sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0))[0];
          let recs = [];

          if (bestJob?.id) {
            const personalized = await api.training.personalized(bestJob.id);
            if (personalized.recommendations?.length) {
              recs = personalized.recommendations;
            }
          }

          if (!recs.length) {
            const requiredSkills = [
              ...new Set(topJobs.flatMap((job) => job.requiredSkills || [])),
            ];
            const gapResult = await api.ai.skillsGap(user.skills, requiredSkills);
            if (gapResult.missingSkills?.length) {
              const gapRecs = await api.ai.trainingRecommendations(gapResult.missingSkills);
              recs = gapRecs.recommendations || [];
            }
          }

          setRecommendations(recs);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.skills]);

  const generateRoadmap = async (e) => {
    e.preventDefault();
    setRoadmapLoading(true);
    setError("");
    try {
      const data = await api.ai.learningRoadmap(goal, user?.skills || []);
      setRoadmap(data.roadmap || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setRoadmapLoading(false);
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
      <h1 className="dash-page-title">Training Recommendations</h1>
      {error && <div className="dash-alert error">{error}</div>}

      <div className="dash-card" style={{ marginBottom: 20 }}>
        <h3 className="dash-card-title">AI Learning Roadmap</h3>
        <form className="dash-form-row" onSubmit={generateRoadmap}>
          <div className="dash-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <input
              className="dash-input"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Career goal, e.g. Data Analyst"
              required
            />
          </div>
          <button type="submit" className="dash-btn primary" disabled={roadmapLoading}>
            {roadmapLoading ? "Generating..." : "Generate roadmap"}
          </button>
        </form>
        {roadmap && (
          <div style={{ marginTop: 16 }}>
            {roadmap.summary && <p>{roadmap.summary}</p>}
            {roadmap.estimated_timeline && (
              <p style={{ color: "#71717a" }}>Timeline: {roadmap.estimated_timeline}</p>
            )}
            <div className="dash-pending-list">
              {(roadmap.steps || []).map((step) => (
                <div key={step.step} className="dash-pending-item">
                  <div className="dash-pending-info">
                    <div className="dash-pending-name">
                      Step {step.step}: {step.title}
                    </div>
                    <div className="dash-pending-date">
                      {step.duration} · {(step.skills_to_learn || []).join(", ")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {recommendations.length > 0 && (
        <div className="dash-card" style={{ marginBottom: 20 }}>
          <h3 className="dash-card-title">AI Recommended for You</h3>
          <div className="dash-pending-list">
            {recommendations.map((rec, i) => (
              <div key={i} className="dash-pending-item">
                <div className="dash-pending-info">
                  <div className="dash-pending-name">{rec.title}</div>
                  <div className="dash-pending-date">
                    {rec.provider} · Skill: {rec.skill}
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
                    Enroll
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dash-card">
        <h3 className="dash-card-title">Available Courses</h3>
        {courses.length === 0 ? (
          <p className="dash-empty">No training courses available yet</p>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Provider</th>
                  <th>Skills</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{course.title}</div>
                      {course.description && (
                        <div style={{ fontSize: "0.75rem", color: "#71717a" }}>
                          {course.description.slice(0, 80)}…
                        </div>
                      )}
                    </td>
                    <td>{course.provider}</td>
                    <td>
                      <div className="dash-skills">
                        {(course.skills || []).slice(0, 3).map((s) => (
                          <span key={s} className="dash-skill-tag">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {course.url ? (
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dash-btn sm"
                          style={{ textDecoration: "none" }}
                        >
                          View
                        </a>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
