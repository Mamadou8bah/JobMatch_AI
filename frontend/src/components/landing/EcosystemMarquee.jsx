const ecosystemGroups = [
  "Job Seekers",
  "SMEs",
  "Employers",
  "Trainers",
  "Agencies",
  "NGOs",
];

export default function EcosystemMarquee() {
  const items = [...ecosystemGroups, ...ecosystemGroups];

  return (
    <div className="marquee-row relative mt-10 overflow-hidden py-2 sm:mt-12" aria-label="Platform audience groups">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent sm:w-20"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent sm:w-20"
        aria-hidden="true"
      />

      <div className="marquee-track flex w-max items-center gap-3 sm:gap-4">
        {items.map((label, index) => (
          <span
            key={`${label}-${index}`}
            className="inline-flex shrink-0 items-center rounded-full border border-zinc-200 bg-zinc-50 px-5 py-2.5 text-sm font-bold tracking-tight text-brand-dark sm:px-6 sm:py-3 sm:text-base"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
