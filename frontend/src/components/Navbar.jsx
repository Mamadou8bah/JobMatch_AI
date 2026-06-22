// Navbar component with basic navigation links
import { NavLink } from "react-router-dom";

const navLinkClass = "mx-2 text-base font-medium hover:underline";

export default function Navbar() {
  return (
    <nav className="py-4 border-b border-gray-200 dark:border-gray-700 mb-6">
      <NavLink to="/" end className={navLinkClass}>Home</NavLink>
      <NavLink to="/seeker" className={navLinkClass}>Job Seeker</NavLink>
      <NavLink to="/employer" className={navLinkClass}>Employer</NavLink>
      <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
    </nav>
  );
}
