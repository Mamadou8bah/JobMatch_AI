import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];
const EXPERIENCE_LEVELS = ["Entry", "Mid", "Senior", "Lead", "Executive"];

export default function EmployerEditJob() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api.jobs
      .get(id)
      .then((job) => {
        if (job.employerId !== user?.id && user?.role !== "admin") {
          throw new Error("You cannot edit this job.");
        }
        setForm({
          title: job.title || "",
          description: job.description || "",
          location: job.location || "",
          employmentType: job.employmentType || "Full-time",
          experienceLevel: job.experienceLevel || "Mid",
          requiredSkills: (job.requiredSkills || []).join(", "),
          salaryMin: job.salaryMin ?? "",
          salaryMax: job.salaryMax ?? "",
          status: job.status || "published",
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, user?.id, user?.role]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.jobs.update(id, {
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
      setSuccess("Job updated successfully.");
      setTimeout(() => navigate("/employer/jobs"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dash-loading" style={{ minHeight: 400 }}>
        <div className="dash-spinner" />
      </div>
    );
  }

  if (!form) {
    return (
      <>
        <h1 className="dash-page-title">Edit Job</h1>
        <div className="dash-alert error">{error || "Job not found."}</div>
        <Link to="/employer/jobs" className="dash-btn">Back to jobs</Link>
      </>
    );
  }

  return (
    <>
      <h1 className="dash-page-title">Edit Job</h1>
      {error && <div className="dash-alert error">{error}</div>}
      {success && <div className="dash-alert success">{success}</div>}

      <div className="dash-card" style={{ maxWidth: 720 }}>
        <form onSubmit={handleSubmit}>
          <div className="dash-form-group">
            <label className="dash-form-label">Job Title</label>
            <input className="dash-input" name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div className="dash-form-group">
            <label className="dash-form-label">Description</label>
            <textarea className="dash-textarea" name="description" value={form.description} onChange={handleChange} required />
          </div>
          <div className="dash-form-row">
            <div className="dash-form-group">
              <label className="dash-form-label">Location</label>
              <input className="dash-input" name="location" value={form.location} onChange={handleChange} />
            </div>
            <div className="dash-form-group">
              <label className="dash-form-label">Employment Type</label>
              <select className="dash-input" name="employmentType" value={form.employmentType} onChange={handleChange}>
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="dash-form-row">
            <div className="dash-form-group">
              <label className="dash-form-label">Experience Level</label>
              <select className="dash-input" name="experienceLevel" value={form.experienceLevel} onChange={handleChange}>
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div className="dash-form-group">
              <label className="dash-form-label">Status</label>
              <select className="dash-input" name="status" value={form.status} onChange={handleChange}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div className="dash-form-group">
            <label className="dash-form-label">Required Skills</label>
            <input className="dash-input" name="requiredSkills" value={form.requiredSkills} onChange={handleChange} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="dash-btn primary" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
            <Link to="/employer/jobs" className="dash-btn">Cancel</Link>
          </div>
        </form>
      </div>
    </>
  );
}
