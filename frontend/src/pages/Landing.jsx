import { Link } from "react-router-dom";
import heroAsset from "../assets/hero.png";
import BrandLogo from "../components/BrandLogo.jsx";
import ICONS, { Icon } from "../components/dashboard/icons.jsx";
import Button from "../components/ui/Button.jsx";
import LandingNav from "../components/landing/LandingNav.jsx";
import ProfileMetricsBento from "../components/landing/ProfileMetricsBento.jsx";
import EcosystemMarquee from "../components/landing/EcosystemMarquee.jsx";
import { cn } from "../lib/cn.js";

const categories = [
  "AI Match Scores",
  "CV Parsing",
  "Skills Gaps",
  "Training Paths",
  "Employer Shortlists",
];

const jobs = [
  { role: "Frontend Developer", company: "Banjul Tech", range: "94% Match" },
  { role: "Accounts Assistant", company: "Kotu Finance", range: "87% Match" },
];

const steps = [
  {
    title: "Registration",
    text: "Job seekers, employers, and training providers create verified profiles.",
    tone: "bg-blue-700",
    icon: ICONS.userPlus,
  },
  {
    title: "Upload CV",
    text: "The AI engine parses skills, education, and experience from each resume.",
    tone: "bg-orange-400",
    icon: ICONS.upload,
  },
  {
    title: "AI Matching",
    text: "Candidates and job posts are compared to generate accurate match scores.",
    tone: "bg-emerald-600",
    icon: ICONS.ranking,
  },
  {
    title: "Close Skills Gaps",
    text: "The platform recommends targeted training before and after applications.",
    tone: "bg-amber-600",
    icon: ICONS.training,
  },
];

const featureCards = [
  {
    title: "Resume Parsing",
    text: "Skills extracted automatically",
    icon: ICONS.fileText,
    className: "bg-rose-500",
    position: "left-0 top-8 sm:top-16 lg:top-28",
  },
  {
    title: "Match Score",
    text: "Candidate fit ranked by AI",
    icon: ICONS.ranking,
    className: "bg-emerald-500",
    position: "left-4 top-28 sm:left-8 sm:top-36 lg:left-10 lg:top-44",
  },
  {
    title: "Training Path",
    text: "Courses mapped to skills gaps",
    icon: ICONS.training,
    className: "bg-lime-500",
    position: "left-8 top-48 sm:left-12 sm:top-56 lg:left-24 lg:top-72",
  },
];

function SectionHeading({ eyebrow, title, description, className, dark = false }) {
  return (
    <div className={cn("mx-auto max-w-3xl", className)}>
      {eyebrow && (
        <p
          className={cn(
            "mb-4 inline-flex rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]",
            dark ? "bg-white/10 text-white/70" : "bg-brand-lime/15 text-emerald-800"
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl",
          dark ? "text-white" : "text-brand-dark"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-base leading-7 sm:text-lg",
            dark ? "text-white/60" : "text-zinc-600"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export default function Landing() {
  return (
    <main className="w-full overflow-x-hidden bg-white text-brand-dark antialiased">
      {/* Hero */}
      <section
        id="home"
        className="bg-hero-grid bg-hero bg-brand-dark px-4 pb-12 pt-1 text-white sm:px-6 sm:pb-16 lg:px-8"
      >
        <LandingNav />

        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 pt-8 sm:gap-10 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:gap-12 xl:pt-14">
          <div className="text-center lg:text-left">
            <p className="mx-auto text-blue-300 inline-flex min-h-10 items-center rounded-full bg-white/10 px-4 text-xs font-semibold text-white/75 sm:text-sm lg:mx-0">
              AI-Powered Employment Platform for The Gambia
            </p>
            <h1 className="mx-auto mt-6 max-w-xl text-4xl font-extrabold leading-[1.05] sm:text-5xl md:text-6xl lg:mx-0 lg:max-w-2xl xl:text-7xl">
              Match talent, jobs, and{" "}
              <span className="text-brand-lime">skills training</span> with AI
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/70 sm:text-lg lg:mx-0">
              JobMatch AI connects job seekers, employers, and training providers in one
              trusted marketplace built to reduce skills mismatch and improve hiring outcomes.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button variant="landingPrimary" to="/login" className="w-full sm:w-auto">
                Start Matching
              </Button>
              <a href="#features" className="btn btn-outline w-full text-center sm:w-auto">
                See AI Features
              </a>
            </div>
            <div className="mx-auto mt-10 grid w-full max-w-xs grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-left sm:max-w-sm lg:mx-0">
              <strong className="text-lg text-white">50k+</strong>
              <span className="text-sm text-white/55">Scalable User Target</span>
              <div className="col-span-2 mt-3 flex items-center">
                {["JS", "EM", "TP", "AD"].map((item) => (
                  <span
                    key={item}
                    className="-mr-2 grid h-9 w-9 place-items-center rounded-full border-2 border-brand-dark bg-gradient-to-br from-sky-100 to-sky-300 text-[11px] font-black text-brand-dark"
                  >
                    {item}
                  </span>
                ))}
                <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-brand-dark bg-white text-lg font-black text-brand-dark">
                  +
                </span>
              </div>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[300px] lg:max-w-[320px] lg:justify-self-end">
            <div className="absolute -left-2 top-8 z-10 hidden w-44 rounded-2xl bg-white p-3 shadow-2xl sm:block lg:-left-6 lg:top-20">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-100 text-xs font-black">
                  AI
                </span>
                <div>
                  <strong className="block text-xs text-zinc-900">Skills Gap Found</strong>
                  <small className="text-[11px] text-zinc-500">React, SQL, Interview Prep</small>
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[300px] rotate-0 rounded-[2rem] border-[8px] border-zinc-800 bg-zinc-50 p-3 shadow-phone sm:rotate-3 sm:rounded-[2.75rem] sm:border-[10px] sm:p-4 lg:rotate-6">
              <div className="mx-auto mb-4 h-4 w-20 rounded-full bg-zinc-900" />
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-100 text-xs font-black">
                  FA
                </span>
                <div>
                  <small className="block text-[11px] text-zinc-500">Welcome back</small>
                  <strong className="text-sm">Fatou A.</strong>
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-zinc-100 px-4 py-3 text-sm text-zinc-500">
                Search job name or company
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <span className="rounded-xl bg-white px-3 py-2 text-center text-xs font-bold">Banjul</span>
                <span className="rounded-xl bg-white px-3 py-2 text-center text-xs font-bold">Entry Level</span>
              </div>
              <button
                type="button"
                className="mt-3 w-full rounded-full bg-brand-lime py-3 text-sm font-black text-brand-dark"
              >
                Generate Matches
              </button>
              <div className="mt-5 flex items-center justify-between">
                <strong className="text-sm">Best Matches</strong>
                <small className="text-xs text-zinc-500">See All</small>
              </div>
              {jobs.map((job) => (
                <article
                  key={job.role}
                  className="mt-3 grid grid-cols-[auto_1fr_auto] gap-3 rounded-2xl bg-white p-3 shadow-sm"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-xs font-black text-blue-600">
                    {job.company[0]}
                  </span>
                  <div className="min-w-0">
                    <strong className="block truncate text-sm">{job.role}</strong>
                    <small className="block truncate text-[11px] text-zinc-500">
                      {job.company} • The Gambia
                    </small>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {["CV Parsed", "Skills Fit", "Training"].map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-extrabold uppercase text-zinc-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <b className="text-xs font-black text-brand-dark">{job.range}</b>
                </article>
              ))}
            </div>

            <article className="absolute -right-1 bottom-6 z-10 hidden w-48 rounded-2xl bg-white p-4 shadow-2xl sm:block lg:-right-4 lg:bottom-16">
              <strong className="block text-sm">Ranked Applicant</strong>
              <small className="block text-xs text-zinc-500">Employer shortlist ready</small>
              <span className="mt-2 block text-sm font-black">92% Match</span>
              <button
                type="button"
                className="mt-3 w-full rounded-full bg-zinc-100 py-2 text-xs font-extrabold text-brand-dark"
              >
                Invite Interview
              </button>
            </article>
          </div>
        </div>

        <div className="mx-auto mt-10 grid w-full max-w-7xl grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => (
            <a
              key={category}
              href="#features"
              className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-white/10 px-4 text-center text-sm font-bold text-white/90 transition hover:bg-white/15"
            >
              <Icon icon={ICONS.sparkle} size={14} className="text-brand-lime" />
              <span className="truncate">{category}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Trusted */}
      <section className="overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeading
          eyebrow="Who we serve"
          title="Built for The Gambia's employment ecosystem"
          description="One platform for every stakeholder shaping jobs, skills, and opportunity across the country."
          className="text-center"
        />
        <EcosystemMarquee />
      </section>

      {/* About */}
      <section
        id="about"
        className="grid items-center gap-10 bg-zinc-50 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8"
      >
        <div className="mx-auto w-full max-w-xl text-center lg:max-w-none lg:text-left">
          <SectionHeading
            title="A smarter national job marketplace"
            description="JobMatch AI replaces informal, fragmented job searching with a centralized platform that helps candidates find suitable roles and helps employers filter qualified applicants faster."
            className="lg:mx-0"
          />
          <div className="mx-auto mt-8 grid max-w-md gap-3 lg:mx-0">
            {[
              "AI-powered candidate-job matching",
              "Training recommendations for missing skills",
            ].map((text) => (
              <a
                key={text}
                href="#features"
                className="flex items-center justify-between rounded-xl bg-white px-4 py-4 text-sm font-semibold shadow-sm transition hover:shadow-md sm:text-base"
              >
                {text}
                <Icon icon={ICONS.arrowRight} size={16} className="text-zinc-400" />
              </a>
            ))}
          </div>
          <Button variant="landingDark" to="/login" className="mt-8 w-full sm:w-auto">
            Explore the platform
          </Button>
        </div>

        <div className="relative mx-auto min-h-[420px] w-full max-w-lg sm:min-h-[500px] lg:max-w-none">
          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80"
            alt="Professional working on a laptop"
            className="h-[320px] w-full rounded-[2rem] object-cover shadow-2xl sm:h-[420px] sm:rounded-[3rem] lg:absolute lg:right-0 lg:bottom-0 lg:h-[520px] lg:w-[min(520px,100%)]"
          />
          {featureCards.map((card) => (
            <div
              key={card.title}
              className={cn(
                "absolute z-10 flex min-w-[210px] items-center gap-3 rounded-2xl bg-white p-4 shadow-xl sm:min-w-[245px]",
                card.position
              )}
            >
              <span
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-full text-white",
                  card.className
                )}
              >
                <Icon icon={card.icon} size={20} />
              </span>
              <div>
                <strong className="block text-sm text-zinc-900">{card.title}</strong>
                <small className="text-xs text-zinc-500">{card.text}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="grid items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8"
      >
        <ProfileMetricsBento />

        <div className="order-1 mx-auto w-full max-w-xl text-center lg:order-2 lg:max-w-none lg:text-left">
          <SectionHeading
            title="AI features that make hiring measurable"
            description="Upload a CV, extract structured skills data, compare it against job requirements, identify gaps, and recommend the next training step from one connected workflow."
            className="lg:mx-0"
          />
          <Button variant="landingDark" to="/login" className="mt-8 w-full sm:w-auto">
            Create profile
          </Button>
        </div>
      </section>

      {/* Steps */}
      <section id="steps" className="bg-brand-dark px-4 py-14 text-white sm:px-6 sm:py-20 lg:px-8">
        <SectionHeading
          title="From CV upload to ranked shortlist"
          description="JobMatch AI gives every role and candidate a clear path through registration, profile data, AI validation, applications, and continuous engagement."
          className="text-center"
          dark
        />

        <div className="mx-auto mt-12 grid max-w-6xl gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="relative min-h-[280px] overflow-hidden rounded-3xl sm:min-h-[360px]">
            <img
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80"
              alt="Professional using a job application dashboard"
              className="h-full min-h-[280px] w-full object-cover sm:min-h-[360px]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/20 to-transparent" />
            <button
              type="button"
              className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white shadow-2xl sm:h-24 sm:w-24"
              aria-label="Play video"
            >
              <Icon icon={ICONS.play} size={32} />
            </button>
            <div className="absolute left-3 top-6 hidden rounded-2xl bg-white p-3 shadow-xl sm:block sm:-rotate-6">
              <strong className="block text-xs">Welcome Back to JobMatch AI</strong>
              <span className="mt-2 block rounded-full bg-zinc-100 px-3 py-1 text-[11px] text-zinc-500">
                email@example.com
              </span>
            </div>
            <div className="absolute bottom-6 right-3 hidden rounded-2xl bg-white p-3 shadow-xl sm:block sm:rotate-6">
              <strong className="block text-xs">Employer Overview</strong>
              <span className="mt-2 block rounded-full bg-zinc-100 px-3 py-1 text-[11px] text-zinc-500">
                Ranked Applicants 124
              </span>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {steps.map((step) => (
              <article key={step.title} className="grid grid-cols-[auto_1fr] gap-4 py-5 sm:gap-5 sm:py-6">
                <span
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-full text-white sm:h-11 sm:w-11",
                    step.tone
                  )}
                >
                  <Icon icon={step.icon} size={18} />
                </span>
                <div>
                  <h3 className="text-lg font-bold sm:text-xl">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/60 sm:text-base">{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Download */}
      <section
        id="download"
        className="grid items-center gap-6 bg-zinc-50 px-4 py-12 sm:grid-cols-[auto_1fr_auto] sm:gap-8 sm:px-6 sm:py-16 lg:px-8"
      >
        <img src={heroAsset} alt="" aria-hidden="true" className="mx-auto h-16 w-16 sm:h-24 sm:w-24" />
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
            Web and mobile access for inclusive employment.
          </h2>
          <p className="mt-3 text-sm leading-7 text-zinc-600 sm:text-base">
            The platform supports web and companion mobile workflows, including offline
            browsing goals for low-connectivity areas.
          </p>
        </div>
        <Button variant="landingPrimary" to="/login" className="w-full justify-self-center sm:w-auto">
          Create Account
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark px-4 py-12 text-white/70 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <BrandLogo to="/" size="lg" />
            <p className="mt-4 max-w-md text-sm leading-7 text-white/55">
              A centralized employment and skills-matching platform helping The Gambia connect
              job seekers, employers, and training providers.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold text-white">Platform</h3>
            <div className="grid gap-2 text-sm">
              <a href="#about" className="text-white/60 transition hover:text-brand-lime">Solution</a>
              <a href="#features" className="text-white/60 transition hover:text-brand-lime">AI Features</a>
              <a href="#steps" className="text-white/60 transition hover:text-brand-lime">Workflow</a>
              <a href="#download" className="text-white/60 transition hover:text-brand-lime">Mobile Access</a>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold text-white">For Users</h3>
            <div className="grid gap-2 text-sm">
              <Link to="/seeker" className="text-white/60 transition hover:text-brand-lime">Job Seekers</Link>
              <Link to="/employer" className="text-white/60 transition hover:text-brand-lime">Employers</Link>
              <Link to="/admin" className="text-white/60 transition hover:text-brand-lime">Administrators</Link>
              <Link to="/login" className="text-white/60 transition hover:text-brand-lime">Sign In</Link>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <span>© 2026 JobMatch AI. All rights reserved.</span>
          <span>Built for digital employment access in The Gambia.</span>
        </div>
      </footer>
    </main>
  );
}
