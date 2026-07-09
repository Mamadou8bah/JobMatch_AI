import DashboardLayout from "../../components/dashboard/DashboardLayout.jsx";
import ICONS from "../../components/dashboard/icons.jsx";

const providerNav = [
  { to: "/provider", label: "Courses", icon: ICONS.training, end: true },
  { to: "/provider/billing", label: "Premium", icon: ICONS.analytics },
  { to: "/provider/profile", label: "Profile", icon: ICONS.profile },
];

export default function ProviderLayout() {
  return <DashboardLayout navItems={providerNav} basePath="/provider" />;
}
