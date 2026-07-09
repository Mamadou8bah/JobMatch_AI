import { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ProviderProfile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    location: user?.location || "",
    companyName: user?.companyName || "",
    companyDescription: user?.companyDescription || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setForm({
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      location: user?.location || "",
      companyName: user?.companyName || "",
      companyDescription: user?.companyDescription || "",
    });
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.users.updateMe(form);
      await refreshUser();
      setSuccess("Provider profile updated");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="dash-page-title">Provider Profile</h1>
      {error ? <div className="dash-alert error">{error}</div> : null}
      {success ? <div className="dash-alert success">{success}</div> : null}
      <div className="dash-card" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSave}>
          <div className="dash-form-group">
            <label className="dash-form-label">Contact name</label>
            <input
              className="dash-input"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>
          <div className="dash-form-group">
            <label className="dash-form-label">Organization</label>
            <input
              className="dash-input"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            />
          </div>
          <div className="dash-form-group">
            <label className="dash-form-label">Phone</label>
            <input
              className="dash-input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="dash-form-group">
            <label className="dash-form-label">Location</label>
            <input
              className="dash-input"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div className="dash-form-group">
            <label className="dash-form-label">About your training programs</label>
            <textarea
              className="dash-textarea"
              value={form.companyDescription}
              onChange={(e) => setForm({ ...form, companyDescription: e.target.value })}
            />
          </div>
          <button type="submit" className="dash-btn primary" disabled={loading}>
            {loading ? "Saving…" : "Save profile"}
          </button>
        </form>
      </div>
    </>
  );
}
