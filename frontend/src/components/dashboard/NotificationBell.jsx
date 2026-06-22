import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api.js";

import { cn } from "../../lib/cn.js";

export default function NotificationBell({ basePath = "", className }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api.notifications
      .mine()
      .then((items) => setUnread(items.filter((item) => !item.read).length))
      .catch(() => setUnread(0));
  }, []);

  return (
    <Link
      to={`${basePath}/notifications`}
      className={cn("dash-notif-bell", className)}
      aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {unread > 0 && <span className="dash-notif-badge">{unread > 9 ? "9+" : unread}</span>}
    </Link>
  );
}
