import { useEffect, useState } from "react";
import { api } from "../../services/api.js";

export default function AdminTraining() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    title: "",
    provider: "",
    description: "",
    url: "",
    skills: "",
    status: "active",
  });
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = () => {
    setLoading(true);
    api.training
      .adminList()
      .then(setCourses)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      provider: "",
      description: "",
      url: "",
      skills: "",
      status: "active",
    });
    setEditingId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      title: form.title,
      provider: form.provider,
      description: form.description,
      url: form.url || undefined,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      status: form.status,
    };

    try {
      if (editingId) {
        await api.training.update(editingId, payload);
        setSuccess("Course updated.");
      } else {
        await api.training.create(payload);
        setSuccess("Course created.");
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (course) => {
    setEditingId(course.id);
    setForm({
      title: course.title,
      provider: course.provider,
      description: course.description || "",
      url: course.url || "",
      skills: (course.skills || []).join(", "),
      status: course.status || "active",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await api.training.delete(id);
      load();
    } catch (err) {
      setError(err.message);
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
      <h1 className="dash-page-title">Training Courses</h1>
      {error && <div className="dash-alert error">{error}</div>}
      {success && <div className="dash-alert success">{success}</div>}

      <div className="dash-grid-2">
        <div className="dash-card">
          <h3 className="dash-card-title">{editingId ? "Edit Course" : "Add Course"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="dash-form-group">
              <label className="dash-form-label">Title</label>
              <input className="dash-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="dash-form-group">
              <label className="dash-form-label">Provider</label>
              <input className="dash-input" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} required />
            </div>
            <div className="dash-form-group">
              <label className="dash-form-label">Description</label>
              <textarea className="dash-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="dash-form-group">
              <label className="dash-form-label">URL</label>
              <input className="dash-input" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </div>
            <div className="dash-form-group">
              <label className="dash-form-label">Skills (comma-separated)</label>
              <input className="dash-input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
            </div>
            <div className="dash-form-group">
              <label className="dash-form-label">Status</label>
              <select className="dash-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="dash-btn primary" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
              {editingId && (
                <button type="button" className="dash-btn" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="dash-card">
          <h3 className="dash-card-title">All Courses</h3>
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <strong>{course.title}</strong>
                      <div style={{ fontSize: "0.75rem", color: "#71717a" }}>{course.provider}</div>
                    </td>
                    <td>{course.status || "active"}</td>
                    <td>
                      <button type="button" className="dash-btn sm" onClick={() => startEdit(course)}>Edit</button>{" "}
                      <button type="button" className="dash-btn sm danger" onClick={() => handleDelete(course.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
