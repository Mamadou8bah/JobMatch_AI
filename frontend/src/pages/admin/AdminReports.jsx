import { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import { formatDate } from "../../components/dashboard/icons.jsx";

export default function AdminReports() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.admin
      .auditLogs()
      .then(setLogs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="dash-loading" style={{ minHeight: 400 }}>
        <div className="dash-spinner" />
      </div>
    );
  }

  return (
    <>
      <h1 className="dash-page-title">Reports</h1>
      {error && <div className="dash-alert error">{error}</div>}

      <div className="dash-card">
        <div className="dash-card-header">
          <h3 className="dash-card-title">Audit Logs</h3>
          <button
            type="button"
            className="dash-btn"
            onClick={() => {
              const csv = [
                ["Action", "Entity", "Entity ID", "Date"].join(","),
                ...logs.map((l) =>
                  [l.action, l.entityType, l.entityId, l.createdAt].join(",")
                ),
              ].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "audit-logs.csv";
              a.click();
            }}
          >
            Export CSV
          </button>
        </div>

        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Entity Type</th>
                <th>Entity ID</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="dash-empty">No audit logs yet</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.action}</td>
                    <td>{log.entityType}</td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                      {log.entityId?.slice(0, 8)}…
                    </td>
                    <td>{formatDate(log.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
