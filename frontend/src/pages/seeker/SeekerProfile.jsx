import { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import ICONS, { Icon } from "../../components/dashboard/icons.jsx";

function profileFormFromUser(user) {
  return {
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
    skills: (user?.skills || []).join(", "),
  };
}

export default function SeekerProfile() {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const [form, setForm] = useState(() => profileFormFromUser(user));
  const [profileLoading, setProfileLoading] = useState(true);
  const [cvFile, setCvFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    api.users
      .me()
      .then((profile) => {
        if (!cancelled) {
          setForm(profileFormFromUser(profile));
        }
      })
      .catch(() => {
        if (!cancelled && user) {
          setForm(profileFormFromUser(user));
        }
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.users.updateMe({
        fullName: form.fullName,
        phone: form.phone,
        location: form.location,
        bio: form.bio,
      });
      const skills = form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await api.users.updateSkills(skills);
      const updated = await refreshUser();
      if (updated) setForm(profileFormFromUser(updated));
      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCvUpload = async () => {
    if (!cvFile) return;
    setLoading(true);
    setError("");
    try {
      const result = await api.users.uploadCv(cvFile);
      setParsed(result.parsed);
      if (result.user?.skills?.length) {
        setForm((prev) => ({ ...prev, skills: result.user.skills.join(", ") }));
      }
      await refreshUser();
      const addedCount = result.addedSkills?.length ?? result.parsed?.skills?.length ?? 0;
      setSuccess(
        addedCount > 0
          ? `CV uploaded — ${addedCount} skill${addedCount === 1 ? "" : "s"} added to your profile`
          : "CV uploaded and parsed successfully",
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="dash-page-title">Profile & CV</h1>
      {error && <div className="dash-alert error">{error}</div>}
      {success && <div className="dash-alert success">{success}</div>}

      {authLoading || profileLoading ? (
        <div className="dash-loading" style={{ minHeight: 320 }}>
          <div className="dash-spinner" />
        </div>
      ) : (
        <div className="dash-profile-grid dash-grid-2">
          <div className="dash-card dash-profile-card">
            <h3 className="dash-card-title">Personal Information</h3>
            <form onSubmit={handleSave} className="dash-profile-form">
              <div className="dash-form-group">
                <label className="dash-form-label">Full Name</label>
                <input
                  className="dash-input"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </div>
              <div className="dash-form-row dash-profile-form-row">
                <div className="dash-form-group">
                  <label className="dash-form-label">Phone</label>
                  <input
                    className="dash-input"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+220 123 4567"
                  />
                </div>
                <div className="dash-form-group">
                  <label className="dash-form-label">Address</label>
                  <input
                    className="dash-input"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Banjul, The Gambia"
                  />
                </div>
              </div>
              <div className="dash-form-group">
                <label className="dash-form-label">Bio</label>
                <textarea
                  className="dash-textarea"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Brief professional summary..."
                />
              </div>
              <div className="dash-form-group">
                <label className="dash-form-label">Skills (comma-separated)</label>
                <input
                  className="dash-input"
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="JavaScript, React, Project Management"
                />
                {form.skills.trim() && (
                  <div className="dash-skills dash-profile-skill-preview">
                    {form.skills
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((s) => (
                        <span key={s} className="dash-skill-tag">{s}</span>
                      ))}
                  </div>
                )}
              </div>
              <button type="submit" className="dash-btn primary dash-profile-save" disabled={loading}>
                Save Profile
              </button>
            </form>
          </div>

          <div className="dash-card dash-profile-card">
          <h3 className="dash-card-title">CV Upload</h3>
          {user?.cvFileName && (
            <div className="dash-alert info" style={{ marginBottom: 16 }}>
              Current CV: <strong>{user.cvFileName}</strong>
            </div>
          )}
          <div className="dash-form-group">
            <label className="dash-form-label">Upload CV (PDF, DOCX, TXT — max 5MB)</label>
            <input
              className="dash-profile-file-input"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => setCvFile(e.target.files?.[0] || null)}
            />
          </div>
          <button
            type="button"
            className="dash-btn primary dash-profile-save"
            onClick={handleCvUpload}
            disabled={!cvFile || loading}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Icon icon={ICONS.upload} size={16} />
            {loading ? "Uploading..." : "Upload & Parse CV"}
          </button>

          {parsed && (
            <div style={{ marginTop: 20 }}>
              <h4 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: 8 }}>
                AI Parsed Results
              </h4>
              {parsed.skills?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div className="dash-form-label">Detected Skills</div>
                  <div className="dash-skills">
                    {parsed.skills.map((s) => (
                      <span key={s} className="dash-skill-tag">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {parsed.experience?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div className="dash-form-label">Experience</div>
                  <ul style={{ fontSize: "0.8rem", paddingLeft: 16, margin: 0 }}>
                    {parsed.experience.slice(0, 3).map((exp, i) => (
                      <li key={i}>{exp}</li>
                    ))}
                  </ul>
                </div>
              )}
              {parsed.education?.length > 0 && (
                <div>
                  <div className="dash-form-label">Education</div>
                  <ul style={{ fontSize: "0.8rem", paddingLeft: 16, margin: 0 }}>
                    {parsed.education.slice(0, 3).map((edu, i) => (
                      <li key={i}>{edu}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {user?.skills?.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div className="dash-form-label">Your Skills</div>
              <div className="dash-skills">
                {user.skills.map((s) => (
                  <span key={s} className="dash-skill-tag">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </>
  );
}
