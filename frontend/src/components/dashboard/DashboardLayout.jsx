import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import BrandLogo from "../BrandLogo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import DashboardHeader from "./DashboardHeader.jsx";
import { initials } from "./icons.jsx";
import { cn } from "../../lib/cn.js";

const roleLabel = {
  job_seeker: "Job Seeker",
  employer: "Employer",
  admin: "Administrator",
};

function SidebarNav({ navItems, user, onNavigate, onLogout }) {
  return (
    <>
      <BrandLogo
        to="/"
        size="lg"
        className="px-2 pb-7"
        onClick={onNavigate}
      />

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-medium no-underline transition",
                isActive
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              )
            }
          >
            <span className="[&>svg]:h-[18px] [&>svg]:w-[18px]">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-2.5 border-t border-zinc-200 pt-4 pl-2">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-900">
          {initials(user?.fullName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold text-zinc-900">
            {user?.fullName || user?.email}
          </div>
          <div className="text-[11px] capitalize text-zinc-500">
            {roleLabel[user?.role] || user?.role}
          </div>
        </div>
        <button
          type="button"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          onClick={onLogout}
          title="Sign out"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </>
  );
}

export default function DashboardLayout({
  navItems = [],
  basePath = "",
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = () => {
    setLogoutOpen(true);
  };

  const confirmLogout = async () => {
    try {
      setLogoutLoading(true);
      await logout();
      setLogoutOpen(false);
      navigate("/login");
    } finally {
      setLogoutLoading(false);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="dash-shell flex min-h-screen bg-brand-wash">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-zinc-200 bg-white px-4 py-6 md:flex">
        <SidebarNav
          navItems={navItems}
          user={user}
          onLogout={handleLogout}
        />
      </aside>

      <div
        className={cn("dash-mobile-overlay", menuOpen && "open")}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <aside
        className={cn("dash-mobile-drawer", menuOpen && "open")}
        aria-hidden={!menuOpen}
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between px-4 pb-4 pt-6">
          <span className="text-sm font-semibold text-zinc-500">Menu</span>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full text-zinc-500 transition hover:bg-zinc-100"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex h-[calc(100%-4rem)] flex-col px-4 pb-6">
          <SidebarNav
            navItems={navItems}
            user={user}
            onNavigate={closeMenu}
            onLogout={handleLogout}
          />
        </div>
      </aside>

      <main className="dash-main ml-0 min-w-0 flex-1 md:ml-60">
        <DashboardHeader
          basePath={basePath}
          onMenuOpen={() => setMenuOpen(true)}
        />
        <div className="dash-main-content">
          <Outlet />
        </div>
      </main>

      {logoutOpen && (
        <div className="dash-modal-backdrop" onClick={() => !logoutLoading && setLogoutOpen(false)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="logout-modal-title">
            <div className="dash-modal-header">
              <h3 id="logout-modal-title">Sign out?</h3>
              <p className="dash-modal-subtitle">
                Are you sure you want to sign out of JobMatch AI?
              </p>
            </div>
            <div className="dash-modal-footer">
              <button
                type="button"
                className="dash-btn"
                onClick={() => setLogoutOpen(false)}
                disabled={logoutLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dash-btn danger"
                onClick={confirmLogout}
                disabled={logoutLoading}
              >
                {logoutLoading ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
