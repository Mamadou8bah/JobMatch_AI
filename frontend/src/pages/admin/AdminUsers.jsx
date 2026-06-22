import { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import EmployerReviewModal from "../../components/admin/EmployerReviewModal.jsx";
import StatusBadge from "../../components/dashboard/StatusBadge.jsx";
import { formatDate } from "../../components/dashboard/icons.jsx";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [reviewEmployer, setReviewEmployer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    api.users
      .list()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    if (filter === "all") return true;
    if (filter === "pending") return u.role === "employer" && !u.approved;
    return u.role === filter;
  });

  const updateUser = (updated) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setReviewEmployer((current) => (current?.id === updated.id ? updated : current));
  };

  const handleAction = async (id, action) => {
    try {
      setActionLoading(true);
      let updated;
      switch (action) {
        case "approve":
          updated = await api.admin.approveUser(id);
          break;
        case "unapprove":
          updated = await api.admin.unapproveUser(id);
          break;
        case "block":
          updated = await api.admin.blockUser(id);
          break;
        case "unblock":
          updated = await api.admin.unblockUser(id);
          break;
        default:
          return;
      }
      updateUser(updated);
      setActionMsg("User updated successfully");
      setTimeout(() => setActionMsg(""), 3000);
      if (action === "approve") {
        setReviewEmployer(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
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
      <h1 className="dash-page-title">Users</h1>
      {error && <div className="dash-alert error">{error}</div>}
      {actionMsg && <div className="dash-alert success">{actionMsg}</div>}

      <div className="dash-card">
        <div className="dash-card-header">
          <h3 className="dash-card-title">User Management</h3>
          <select
            className="dash-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="job_seeker">Job Seekers</option>
            <option value="employer">Employers</option>
            <option value="admin">Admins</option>
            <option value="pending">Pending Employers</option>
          </select>
        </div>

        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="dash-empty">No users found</td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {user.role === "employer" ? (
                        <button
                          type="button"
                          className="dash-link-btn"
                          onClick={() => setReviewEmployer(user)}
                        >
                          {user.companyName || user.fullName}
                        </button>
                      ) : (
                        user.fullName
                      )}
                    </td>
                    <td>{user.email}</td>
                    <td style={{ textTransform: "capitalize" }}>
                      {user.role?.replace(/_/g, " ")}
                    </td>
                    <td>
                      {user.blocked ? (
                        <StatusBadge status="blocked" />
                      ) : user.role === "employer" && !user.approved ? (
                        <StatusBadge status="pending" />
                      ) : (
                        <StatusBadge status="approved" />
                      )}
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="dash-actions">
                        {user.role === "employer" && (
                          <button
                            type="button"
                            className="dash-btn sm"
                            onClick={() => setReviewEmployer(user)}
                          >
                            View
                          </button>
                        )}
                        {user.role === "employer" && user.approved && !user.blocked && (
                          <button
                            type="button"
                            className="dash-btn sm"
                            onClick={() => handleAction(user.id, "unapprove")}
                          >
                            Unapprove
                          </button>
                        )}
                        {user.blocked ? (
                          <button
                            type="button"
                            className="dash-btn sm"
                            onClick={() => handleAction(user.id, "unblock")}
                          >
                            Unblock
                          </button>
                        ) : (
                          user.role !== "admin" && (
                            <button
                              type="button"
                              className="dash-btn sm danger"
                              onClick={() => handleAction(user.id, "block")}
                            >
                              Block
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EmployerReviewModal
        employer={reviewEmployer}
        onClose={() => setReviewEmployer(null)}
        onApprove={(id) => handleAction(id, "approve")}
        onUnapprove={(id) => handleAction(id, "unapprove")}
        actionLoading={actionLoading}
      />
    </>
  );
}
