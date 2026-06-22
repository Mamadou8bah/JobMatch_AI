import { useState } from "react";
import BrandLogo from "../BrandLogo.jsx";
import ICONS, { Icon } from "../dashboard/icons.jsx";
import Button from "../ui/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { cn } from "../../lib/cn.js";

const links = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "Solution" },
  { href: "#features", label: "AI Features" },
  { href: "#steps", label: "Workflow" },
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const authPath = user ? "/portal" : "/login";
  const authLabel = user ? "Portal" : "Sign in";

  const close = () => setOpen(false);

  return (
    <header className="relative z-50 mx-auto w-full max-w-7xl">
      <div className="flex items-center justify-between gap-4 py-0">
        <BrandLogo
          to="/"
          size="md"
          iconClassName="!h-14 !w-14 sm:!h-16 sm:!w-16 lg:!h-24 lg:!w-24"
          className="py-1.5 px-2"
          onClick={close}
        />

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-white/70 transition hover:text-brand-lime"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Button variant="landingPrimary" to={authPath} className="!min-h-11 !px-5 !text-sm">
            {authLabel} <Icon icon={ICONS.arrowRight} size={16} />
          </Button>
          <a
            href="#download"
            className="btn btn-outline !min-h-11 !px-5 !text-sm"
          >
            Mobile Access
          </a>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <Icon icon={open ? ICONS.close : ICONS.menu} size={20} />
        </button>
      </div>

      <div
        className={cn(
          "lg:hidden",
          open
            ? "mt-3 rounded-2xl border border-white/10 bg-[#0c170b]/95 p-4 shadow-2xl backdrop-blur-md"
            : "hidden"
        )}
      >
        <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={close}
              className="rounded-xl px-3 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-brand-lime"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button variant="landingPrimary" to={authPath} className="w-full !min-h-11" onClick={close}>
            {authLabel}
          </Button>
          <a href="#download" className="btn btn-outline w-full !min-h-11 !text-center" onClick={close}>
            Mobile Access
          </a>
        </div>
      </div>
    </header>
  );
}
