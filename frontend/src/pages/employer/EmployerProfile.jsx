import { useEffect, useRef, useState } from "react";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import UserAvatar from "../../components/dashboard/UserAvatar.jsx";

export default function EmployerProfile() {
  const { user, refreshUser } = useAuth();
  const avatarInputRef = useRef(null);
  const [avatarFile, setAvatarFile] = useState(null);
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
      setSuccess("Company profile updated");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setLoading(true);
    setError("");
    try {
      await api.users.uploadAvatar(avatarFile);
      await refreshUser();
      setAvatarFile(null);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
      setSuccess("Profile picture updated");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarRemove = async () => {
    setLoading(true);
    setError("");
    try {
      await api.users.removeAvatar();
      await refreshUser();
      setSuccess("Profile picture removed");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="dash-page-title">Company Profile</h1>
      {error && <div className="dash-alert error">{error}</div>}
      {success && <div className="dash-alert success">{success}</div>}

      <div className="dash-card" style={{ maxWidth: 640 }}>
        <h3 className="dash-card-title">Profile Picture</h3>
        <div className="dash-profile-avatar-row" style={{ marginBottom: 24 }}>
          <div className="dash-header-avatar" style={{ width: 88, height: 88 }}>
            <UserAvatar user={user} />
          </div>
          <div className="dash-profile-avatar-actions">
            <input
              ref={avatarInputRef}
              className="dash-profile-file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            />
            <button
              type="button"
              className="dash-btn primary"
              onClick={handleAvatarUpload}
              disabled={!avatarFile || loading}
            >
              {loading ? "Uploading..." : "Upload photo"}
            </button>
            {user?.avatarUrl ? (
              <button type="button" className="dash-btn" onClick={handleAvatarRemove} disabled={loading}>
                Remove photo
              </button>
            ) : null}
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="dash-form-group">
            <label className="dash-form-label">Contact Name</label>
            <input
              className="dash-input"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>
          <div className="dash-form-group">
            <label className="dash-form-label">Company Name</label>
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
            <label className="dash-form-label">Company Description</label>
            <textarea
              className="dash-input"
              rows={4}
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
