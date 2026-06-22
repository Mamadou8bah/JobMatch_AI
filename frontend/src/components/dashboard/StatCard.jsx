import { Link } from "react-router-dom";
import { cn } from "../../lib/cn.js";

export default function StatCard({ label, value, icon, highlight = false, to }) {
  const className = cn(
    "flex flex-col gap-2 rounded-dash p-5 shadow-dash transition",
    highlight ? "bg-zinc-900 text-white" : "bg-white",
    to && "dash-stat-card-link no-underline"
  );

  const content = (
    <>
      {icon && (
        <span className={cn("inline-flex", highlight ? "text-white/70" : "text-zinc-500")}>
          {icon}
        </span>
      )}
      <span className={cn("text-xs font-medium", highlight ? "text-white/70" : "text-zinc-500")}>
        {label}
      </span>
      <span className={cn("text-2xl font-bold leading-none", highlight ? "text-white" : "text-zinc-900")}>
        {value}
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={className} aria-label={`${label}: ${value}`}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
