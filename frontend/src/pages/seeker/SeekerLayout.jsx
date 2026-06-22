import DashboardLayout from "../../components/dashboard/DashboardLayout.jsx";
import ICONS from "../../components/dashboard/icons.jsx";

const seekerNav = [
  { to: "/seeker", label: "Dashboard", icon: ICONS.dashboard, end: true },
  { to: "/seeker/profile", label: "Profile & CV", icon: ICONS.profile },
  { to: "/seeker/recommendations", label: "Job Matches", icon: ICONS.recommendations },
  { to: "/seeker/applications", label: "Applications", icon: ICONS.applications },
  { to: "/seeker/training", label: "Training", icon: ICONS.training },
  { to: "/seeker/coach", label: "AI Coach", icon: ICONS.coach },
  { to: "/seeker/messages", label: "Messages", icon: ICONS.messages },
];

export default function SeekerLayout() {
  return <DashboardLayout navItems={seekerNav} basePath="/seeker" />;
}
