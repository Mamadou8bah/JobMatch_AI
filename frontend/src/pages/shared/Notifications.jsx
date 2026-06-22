import { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import { formatDate } from "../../components/dashboard/icons.jsx";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api.notifications
      .mine()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    try {
      await api.notifications.markRead(id);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
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
      <h1 className="dash-page-title">Notifications</h1>
      {error && <div className="dash-alert error">{error}</div>}

      <div className="dash-card">
        {items.length === 0 ? (
          <p className="dash-empty">No notifications yet</p>
        ) : (
          <div className="dash-pending-list">
            {items.map((item) => (
              <div
                key={item.id}
                className={`dash-pending-item${item.read ? "" : " unread-notif"}`}
              >
                <div className="dash-pending-info">
                  <div className="dash-pending-name">{item.title}</div>
                  <div className="dash-pending-date">{item.message}</div>
                  <div className="dash-pending-date">{formatDate(item.createdAt)}</div>
                </div>
                {!item.read && (
                  <button
                    type="button"
                    className="dash-btn sm"
                    onClick={() => markRead(item.id)}
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
