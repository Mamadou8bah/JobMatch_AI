import { Link } from "react-router-dom";
import logoSrc from "../assets/jobmatch_logo.png";
import { cn } from "../lib/cn.js";

const sizeMap = {
  xs: "h-12 w-12",
  sm: "h-16 w-16",
  md: "h-20 w-20",
  lg: "h-24 w-24",
  xl: "h-32 w-32",
};

/** Zoom past the empty margin baked into the PNG asset. */
const LOGO_CROP_CLASS = "scale-[1.55]";

export default function BrandLogo({
  to = "/",
  asLink = true,
  size = "md",
  className,
  iconClassName,
  onClick,
}) {
  const frame = (
    <span
      className={cn(
        sizeMap[size] || sizeMap.md,
        "block shrink-0 overflow-hidden rounded-lg",
        iconClassName
      )}
    >
      <img
        src={logoSrc}
        alt="JobMatch AI"
        className={cn("h-full w-full origin-center", LOGO_CROP_CLASS)}
      />
    </span>
  );

  if (asLink && to) {
    return (
      <Link
        to={to}
        className={cn("inline-flex items-center no-underline", className)}
        onClick={onClick}
        aria-label="JobMatch AI home"
      >
        {frame}
      </Link>
    );
  }

  return <div className={cn("inline-flex items-center", className)}>{frame}</div>;
}
