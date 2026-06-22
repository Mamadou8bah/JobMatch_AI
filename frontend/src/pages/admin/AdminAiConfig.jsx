import { useEffect, useState } from "react";
import { api } from "../../services/api.js";

export default function AdminAiConfig() {
  const [config, setConfig] = useState(null);
  const [form, setForm] = useState({
    aiEngineUrl: "",
    aiMatchThreshold: 70,
    aiEnabled: true,
    careerChatEnabled: true,
    resumeParsingEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [health, setHealth] = useState(null);

  useEffect(() => {
    api.admin
      .aiConfig()
      .then((data) => {
        setConfig(data);
        setForm({
          aiEngineUrl: data.aiEngineUrl || "",
          aiMatchThreshold: data.aiMatchThreshold ?? 70,
          aiEnabled: data.aiEnabled ?? true,
          careerChatEnabled: data.careerChatEnabled ?? true,
          resumeParsingEnabled: data.resumeParsingEnabled ?? true,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    api.admin.aiHealth().then(setHealth).catch(() => setHealth({ status: "unknown" }));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await api.admin.updateAiConfig(form);
      setConfig(updated);
      setSuccess("AI configuration saved");
      setTimeout(() => setSuccess(""), 3000);
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

  return (
    <>
      <h1 className="dash-page-title">AI Configuration</h1>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>
        Monitor and configure AI engine settings for matching, resume parsing, and the career chatbot.
      </p>
      {error && <div className="dash-alert error">{error}</div>}
      {success && <div className="dash-alert success">{success}</div>}

      {health && (
        <div className={`dash-alert ${health.status === "online" ? "success" : "info"}`} style={{ marginBottom: 16 }}>
          AI Engine: {health.status}
          {health.geminiModel ? ` · ${health.geminiModel}` : ""}
          {health.latencyMs != null ? ` · ${health.latencyMs}ms` : ""}
          {health.checkedAt ? ` · checked ${new Date(health.checkedAt).toLocaleTimeString()}` : ""}
        </div>
      )}

      <div className="dash-card" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSave}>
          <div className="dash-form-group">
            <label className="dash-form-label">AI Engine URL</label>
            <input
              className="dash-input"
              value={form.aiEngineUrl}
              onChange={(e) => setForm({ ...form, aiEngineUrl: e.target.value })}
              placeholder="http://localhost:8000"
            />
          </div>
          <div className="dash-form-group">
            <label className="dash-form-label">Match Score Threshold (%)</label>
            <input
              className="dash-input"
              type="number"
              min={0}
              max={100}
              value={form.aiMatchThreshold}
              onChange={(e) => setForm({ ...form, aiMatchThreshold: Number(e.target.value) })}
            />
          </div>
          <div className="dash-form-group">
            <label className="dash-form-label">
              <input
                type="checkbox"
                checked={form.aiEnabled}
                onChange={(e) => setForm({ ...form, aiEnabled: e.target.checked })}
              />{" "}
              AI matching enabled
            </label>
          </div>
          <div className="dash-form-group">
            <label className="dash-form-label">
              <input
                type="checkbox"
                checked={form.resumeParsingEnabled}
                onChange={(e) => setForm({ ...form, resumeParsingEnabled: e.target.checked })}
              />{" "}
              Resume parsing enabled
            </label>
          </div>
          <div className="dash-form-group">
            <label className="dash-form-label">
              <input
                type="checkbox"
                checked={form.careerChatEnabled}
                onChange={(e) => setForm({ ...form, careerChatEnabled: e.target.checked })}
              />{" "}
              Career chatbot enabled
            </label>
          </div>
          {config?.updatedAt && (
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
              Last updated: {new Date(config.updatedAt).toLocaleString()}
            </p>
          )}
          <button type="submit" className="dash-btn primary" disabled={saving}>
            {saving ? "Saving…" : "Save configuration"}
          </button>
        </form>
      </div>
    </>
  );
}
