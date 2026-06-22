import DashboardLayout from "../../components/dashboard/DashboardLayout.jsx";
import ICONS from "../../components/dashboard/icons.jsx";

const employerNav = [
  { to: "/employer", label: "Dashboard", icon: ICONS.dashboard, end: true },
  { to: "/employer/post", label: "Post Job", icon: ICONS.jobs },
  { to: "/employer/jobs", label: "My Jobs", icon: ICONS.categories },
  { to: "/employer/candidates", label: "Candidates", icon: ICONS.candidates },
  { to: "/employer/ranking", label: "AI Ranking", icon: ICONS.ranking },
  { to: "/employer/analytics", label: "Analytics", icon: ICONS.analytics },
  { to: "/employer/profile", label: "Company", icon: ICONS.companies },
  { to: "/employer/messages", label: "Messages", icon: ICONS.messages },
];

export default function EmployerLayout() {
  return <DashboardLayout navItems={employerNav} basePath="/employer" />;
}
