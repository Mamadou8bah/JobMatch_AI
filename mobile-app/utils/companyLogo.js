export const COMPANY_LOGO_FALLBACKS = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ79yatHcBd_lkPtV7JimWe3_9IYSB82dRBZ5O4GF-N-A&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYTWq19Uysv9K8-GmQiR5P-qWy8OgQiQe7EGyEDmnbjQ&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAEPdxsT22mZnMV3pgYTWebGMzJHDeHUF8cDYRrX-JpA&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVYY7UGjl5FhNbyr2wIhd4XriYP54RlY-myUSVHKIArQ&s=10",
];

function hashKey(key = "") {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash + key.charCodeAt(i)) % COMPANY_LOGO_FALLBACKS.length;
  }
  return hash;
}

export function getCompanyLogoUri({ logoUrl, avatarUrl, name, id } = {}) {
  const custom = logoUrl || avatarUrl;
  if (custom) return custom;
  const key = String(id || name || "company");
  return COMPANY_LOGO_FALLBACKS[hashKey(key)];
}

export function companyInitial(name = "C") {
  return name.trim().charAt(0).toUpperCase() || "C";
}

export function employerFromJob(job) {
  const employer = job?.employer || {};
  return {
    id: employer.id,
    name: employer.companyName || employer.fullName || "Company",
    logoUrl: employer.avatarUrl || employer.logoUrl || null,
  };
}
