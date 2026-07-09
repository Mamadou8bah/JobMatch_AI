import { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import PremiumGate from "../../components/dashboard/PremiumGate.jsx";

export default function ProviderCourses() {
  const { user, isPremium } = useAuth();
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    url: "",
    skills: "",
    featured: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [premiumBlocked, setPremiumBlocked] = useState(false);

  const load = () =>
    api.training
      .mine()
      .then(setCourses)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setPremiumBlocked(false);
    try {
      await api.training.createMine({
        title: form.title,
        description: form.description,
        url: form.url || undefined,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        featured: Boolean(form.featured && isPremium),
        provider: user?.companyName || user?.fullName,
      });
      setForm({ title: "", description: "", url: "", skills: "", featured: false });
      setSuccess("Course listed successfully");
      await load();
    } catch (err) {
      if (err.isPremiumRequired) setPremiumBlocked(true);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user?.approved) {
    return (
      <>
        <h1 className="dash-page-title">My Courses</h1>
        <div className="dash-alert warning">
          Your training provider account is waiting for admin approval before you can list courses.
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="dash-page-title">My Courses</h1>
      <p className="dash-page-subtitle" style={{ marginTop: -8, marginBottom: 16 }}>
        Free providers can list up to 2 active courses. Premium unlocks unlimited listings and featured placement.
      </p>
      {error ? <div className="dash-alert error">{error}</div> : null}
      {success ? <div className="dash-alert success">{success}</div> : null}
      {premiumBlocked ? (
        <PremiumGate
          title="Course limit reached"
          message="Upgrade to Provider Premium for unlimited course listings and featured placement."
        />
      ) : null}

      <div className="dash-grid-2" style={{ gap: 20 }}>
        <div className="dash-card">
          <h3 className="dash-card-title">Add course</h3>
          <form onSubmit={handleSubmit}>
            <div className="dash-form-group">
              <label className="dash-form-label">Title</label>
              <input
                className="dash-input"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="dash-form-group">
              <label className="dash-form-label">Description</label>
              <textarea
                className="dash-textarea"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="dash-form-group">
              <label className="dash-form-label">Course URL</label>
              <input
                className="dash-input"
                type="url"
                placeholder="https://"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
            <div className="dash-form-group">
              <label className="dash-form-label">Skills (comma-separated)</label>
              <input
                className="dash-input"
                required
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
              />
            </div>
            {isPremium ? (
              <label className="dash-form-group" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                Featured placement
              </label>
            ) : null}
            <button type="submit" className="dash-btn primary" disabled={saving}>
              {saving ? "Saving…" : "Publish course"}
            </button>
          </form>
        </div>

        <div className="dash-card">
          <h3 className="dash-card-title">Your listings ({courses.length})</h3>
          {loading ? (
            <div className="dash-spinner" />
          ) : courses.length === 0 ? (
            <p className="dash-empty">No courses yet.</p>
          ) : (
            <div className="dash-pending-list">
              {courses.map((course) => (
                <div key={course.id} className="dash-pending-item">
                  <div className="dash-pending-info">
                    <div className="dash-pending-name">
                      {course.title}
                      {course.featured ? " · Featured" : ""}
                    </div>
                    <div className="text-sm text-zinc-500">{course.provider}</div>
                  </div>
                  <span className="dash-skill-tag">{course.status?.toLowerCase()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
