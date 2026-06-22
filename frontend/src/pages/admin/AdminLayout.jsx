import DashboardLayout from "../../components/dashboard/DashboardLayout.jsx";
import ICONS from "../../components/dashboard/icons.jsx";

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: ICONS.dashboard, end: true },
  { to: "/admin/jobs", label: "Jobs", icon: ICONS.jobs },
  { to: "/admin/applications", label: "Applications", icon: ICONS.applications },
  { to: "/admin/users", label: "Users", icon: ICONS.users },
  { to: "/admin/training", label: "Training", icon: ICONS.training },
  { to: "/admin/analytics", label: "Analytics", icon: ICONS.analytics },
  { to: "/admin/ai-config", label: "AI Config", icon: ICONS.ranking },
  { to: "/admin/reports", label: "Reports", icon: ICONS.reports },
];

export default function AdminLayout() {
  return <DashboardLayout navItems={adminNav} basePath="/admin" />;
}
