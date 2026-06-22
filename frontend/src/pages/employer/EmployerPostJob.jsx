import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];
const EXPERIENCE_LEVELS = ["Entry", "Mid", "Senior", "Lead", "Executive"];

export default function EmployerPostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    employmentType: "Full-time",
    experienceLevel: "Mid",
    requiredSkills: "",
    salaryMin: "",
    salaryMax: "",
    status: "published",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.jobs.create({
        title: form.title,
        description: form.description,
        location: form.location,
        employmentType: form.employmentType,
        experienceLevel: form.experienceLevel,
        requiredSkills: form.requiredSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        status: form.status,
      });
      setSuccess("Job posted successfully!");
      setTimeout(() => navigate("/employer/jobs"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.approved) {
    return (
      <>
        <h1 className="dash-page-title">Post a Job</h1>
        <div className="dash-alert info">
          Your account must be approved before you can post jobs.
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="dash-page-title">Post a Job</h1>
      {error && <div className="dash-alert error">{error}</div>}
      {success && <div className="dash-alert success">{success}</div>}

      <div className="dash-card" style={{ maxWidth: 720 }}>
        <form onSubmit={handleSubmit}>
          <div className="dash-form-group">
            <label className="dash-form-label">Job Title *</label>
            <input
              className="dash-input"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Product Designer"
              required
            />
          </div>

          <div className="dash-form-group">
            <label className="dash-form-label">Description *</label>
            <textarea
              className="dash-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, and requirements..."
              required
            />
          </div>

          <div className="dash-form-row">
            <div className="dash-form-group">
              <label className="dash-form-label">Location</label>
              <input
                className="dash-input"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Banjul, The Gambia"
              />
            </div>
            <div className="dash-form-group">
              <label className="dash-form-label">Employment Type</label>
              <select
                className="dash-input"
                name="employmentType"
                value={form.employmentType}
                onChange={handleChange}
              >
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="dash-form-row">
            <div className="dash-form-group">
              <label className="dash-form-label">Experience Level</label>
              <select
                className="dash-input"
                name="experienceLevel"
                value={form.experienceLevel}
                onChange={handleChange}
              >
                {EXPERIENCE_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="dash-form-group">
              <label className="dash-form-label">Status</label>
              <select
                className="dash-input"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="published">Publish</option>
                <option value="draft">Save as Draft</option>
              </select>
            </div>
          </div>

          <div className="dash-form-group">
            <label className="dash-form-label">Required Skills (comma-separated)</label>
            <input
              className="dash-input"
              name="requiredSkills"
              value={form.requiredSkills}
              onChange={handleChange}
              placeholder="React, TypeScript, UI Design"
            />
          </div>

          <div className="dash-form-row">
            <div className="dash-form-group">
              <label className="dash-form-label">Salary Min (GMD)</label>
              <input
                className="dash-input"
                type="number"
                name="salaryMin"
                value={form.salaryMin}
                onChange={handleChange}
                placeholder="15000"
              />
            </div>
            <div className="dash-form-group">
              <label className="dash-form-label">Salary Max (GMD)</label>
              <input
                className="dash-input"
                type="number"
                name="salaryMax"
                value={form.salaryMax}
                onChange={handleChange}
                placeholder="35000"
              />
            </div>
          </div>

          <button type="submit" className="dash-btn primary" disabled={loading}>
            {loading ? "Posting..." : "Post Job"}
          </button>
        </form>
      </div>
    </>
  );
}
