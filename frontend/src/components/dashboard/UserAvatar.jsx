import { initials } from "./icons.jsx";
import { cn } from "../../lib/cn.js";

export default function UserAvatar({ user, className, title }) {
  const label = title || user?.fullName || user?.email || "Profile";

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={label}
        title={label}
        className={cn("h-full w-full rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span className={cn("grid h-full w-full place-items-center rounded-full bg-brand-lime/20 text-sm font-bold text-brand-forest", className)}>
      {initials(user?.fullName)}
    </span>
  );
}
