import { Link } from "react-router-dom";
import ICONS, { Icon } from "../dashboard/icons.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

function MetricCard({ className, menu, children }) {
  return (
    <article className={`relative rounded-3xl bg-white p-5 shadow-sm sm:p-6 ${className ?? ""}`}>
      {menu && (
        <span className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-zinc-100 text-zinc-500">
          <Icon icon={ICONS.moreHorizontal} size={18} />
        </span>
      )}
      {children}
    </article>
  );
}

export default function ProfileMetricsBento() {
  const { user } = useAuth();
  const authPath = user ? "/portal" : "/login";

  return (
    <div className="order-2 grid gap-4 sm:grid-cols-2 lg:order-1 lg:grid-rows-2 lg:gap-5 lg:items-stretch">
      {/* Top left — Employer Interest */}
      <MetricCard menu className="sm:col-span-2 lg:col-span-1 lg:col-start-1 lg:row-start-1">
        <small className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Employer Interest
        </small>
        <strong className="mt-2 block text-4xl font-black text-zinc-900">29</strong>
        <p className="mt-2 text-sm text-zinc-600">Recruiters viewed this candidate profile</p>
        <div className="mt-4 h-20 rounded-2xl bg-gradient-to-t from-brand-lime/30 to-transparent" />
      </MetricCard>

      {/* Bottom left — Skills Gap */}
      <MetricCard className="lg:col-start-1 lg:row-start-2 lg:self-end">
        <small className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Skills Gap
        </small>
        <strong className="mt-2 block text-4xl font-black text-zinc-900">3</strong>
        <em className="mt-2 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-bold not-italic text-amber-700">
          priority skills
        </em>
        <p className="mt-3 text-sm text-zinc-600">Recommended learning areas before applying</p>
      </MetricCard>

      {/* Right — Candidate Match (spans both rows on desktop) */}
      <MetricCard
        menu
        className="sm:col-span-2 lg:col-span-1 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:flex lg:flex-col lg:justify-between"
      >
        <div>
          <small className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Candidate Match
          </small>
          <strong className="mt-2 block text-4xl font-black text-zinc-900">92%</strong>
          <em className="mt-2 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-bold not-italic text-amber-700">
            Strong Fit
          </em>
          <div className="mt-4 rounded-2xl bg-zinc-50 p-4">
            <b className="text-sm text-zinc-900">AI Recommendation</b>
            <p className="mt-1 text-sm text-zinc-600">
              Apply now and complete a short interview-prep course.
            </p>
          </div>
        </div>
        <Link
          to={authPath}
          className="mt-4 flex min-h-12 items-center justify-center rounded-full bg-brand-lime text-sm font-black text-brand-dark no-underline lg:mt-6"
        >
          View Match
        </Link>
      </MetricCard>
    </div>
  );
}
