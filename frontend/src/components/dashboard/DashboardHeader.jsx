import { Link } from "react-router-dom";
import BrandLogo from "../BrandLogo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import NotificationBell from "./NotificationBell.jsx";
import { initials } from "./icons.jsx";
import { cn } from "../../lib/cn.js";

const roleAccent = {
  job_seeker: "from-brand-lime/20 via-emerald-100/40 to-transparent",
  employer: "from-sky-100/60 via-blue-50/30 to-transparent",
  admin: "from-violet-100/60 via-purple-50/30 to-transparent",
};

const quickActions = {
  job_seeker: { to: "/seeker/recommendations", label: "Find jobs", icon: "search" },
  employer: { to: "/employer/post", label: "Post a job", icon: "plus" },
  admin: { to: "/admin/users", label: "Manage users", icon: "users" },
};

function greetingForHour(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function QuickActionIcon({ type }) {
  if (type === "plus") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    );
  }
  if (type === "users") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function DashboardHeader({ basePath = "", onMenuOpen }) {
  const { user } = useAuth();

  const firstName = user?.fullName?.split(" ")[0] || "there";
  const greeting = greetingForHour(new Date().getHours());

  const action = quickActions[user?.role];
  const profilePath = user?.role === "admin" ? null : `${basePath}/profile`;
  const accent = roleAccent[user?.role] || roleAccent.job_seeker;

  return (
    <header className="dash-header">
      <div className="dash-header-mobile-bar">
        <button
          type="button"
          className="dash-mobile-menu-btn"
          onClick={onMenuOpen}
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <BrandLogo
          to="/"
          size="md"
          iconClassName="!h-14 !w-14"
          className="dash-mobile-brand"
        />

        <div className="dash-mobile-top-actions">
          <NotificationBell basePath={basePath} className="dash-header-bell dash-mobile-bell" />
        </div>
      </div>

      <div className="dash-header-accent" aria-hidden="true" />

      <div className="dash-header-card relative overflow-hidden rounded-[18px] border border-zinc-200/80 bg-white shadow-dash">
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90",
            accent
          )}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-10 -top-10 hidden h-36 w-36 rounded-full bg-brand-lime/15 blur-3xl md:block"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-zinc-500 sm:text-base">
            {greeting},{" "}
            <span className="font-semibold text-zinc-800">{firstName}</span>
          </p>

          <div className="flex items-center gap-2 sm:gap-3">
            <label className="dash-header-search hidden lg:flex">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="search" placeholder="Search workspace…" aria-label="Search workspace" />
            </label>

            {action && (
              <Link to={action.to} className="dash-header-action">
                <QuickActionIcon type={action.icon} />
                <span className="hidden sm:inline">{action.label}</span>
              </Link>
            )}

            <NotificationBell basePath={basePath} className="dash-header-bell" />

            {profilePath ? (
              <Link to={profilePath} className="dash-header-avatar hidden sm:grid" title="Your profile">
                {initials(user?.fullName)}
              </Link>
            ) : (
              <div className="dash-header-avatar hidden sm:grid" title={user?.fullName || user?.email}>
                {initials(user?.fullName)}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
