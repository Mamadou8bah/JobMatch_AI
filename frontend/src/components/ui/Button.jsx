import { Link } from "react-router-dom";
import { cn } from "../../lib/cn.js";

const variants = {
  landingPrimary:
    "btn btn-primary",
  landingDark:
    "btn btn-dark text-white",
  landingOutline:
    "btn btn-outline",
  default:
    "dash-btn",
  primary:
    "dash-btn primary",
  danger:
    "dash-btn danger",
};

export default function Button({
  variant = "default",
  size,
  className,
  children,
  to,
  href,
  ...props
}) {
  const classes = cn(variants[variant] ?? variants.default, size === "sm" && "sm", className);

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
