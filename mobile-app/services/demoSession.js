import { getItem, setItem, removeItem, KEYS } from "./storage.js";

export const DEMO_PASSWORD = "11111111";

export const DEMO_ACCOUNT = {
  email: "bah@gmail.com",
  password: DEMO_PASSWORD,
  role: "job_seeker",
};

const SEEKER_ID = "demo-bah-user";
const EMPLOYER_ID = "demo-employer-user";

const PUBLISHED_JOBS = [
  {
    id: "demo-job-1",
    employerId: EMPLOYER_ID,
    title: "Frontend Developer",
    description:
      "Build responsive web interfaces for JobMatch AI and partner platforms across The Gambia.",
    location: "Banjul",
    employmentType: "full-time",
    experienceLevel: "mid",
    requiredSkills: ["typescript", "react", "communication"],
    status: "published",
    createdAt: "2026-05-01T09:00:00.000Z",
    employer: {
      id: EMPLOYER_ID,
      fullName: "Awa Jallow",
      companyName: "Atlantic Tech",
    },
    match: { score: 88, missingSkills: ["typescript"] },
  },
  {
    id: "demo-job-2",
    employerId: EMPLOYER_ID,
    title: "Data Analyst",
    description:
      "Analyze hiring trends and produce insights for training providers and employers.",
    location: "Serrekunda",
    employmentType: "full-time",
    experienceLevel: "junior",
    requiredSkills: ["sql", "python", "communication"],
    status: "published",
    createdAt: "2026-05-10T09:00:00.000Z",
    employer: {
      id: EMPLOYER_ID,
      fullName: "Awa Jallow",
      companyName: "Atlantic Tech",
    },
    match: { score: 72, missingSkills: ["sql", "python"] },
  },
  {
    id: "demo-job-3",
    employerId: EMPLOYER_ID,
    title: "Customer Support Specialist",
    description:
      "Help job seekers and employers get the most from the JobMatch AI platform.",
    location: "Brikama",
    employmentType: "part-time",
    experienceLevel: "entry",
    requiredSkills: ["communication", "customer service"],
    status: "published",
    createdAt: "2026-05-15T09:00:00.000Z",
    employer: {
      id: EMPLOYER_ID,
      fullName: "Awa Jallow",
      companyName: "Atlantic Tech",
    },
    match: { score: 91, missingSkills: [] },
  },
];

const TRAINING_COURSES = [
  {
    id: "demo-course-1",
    title: "Intro to CV Writing",
    provider: "JobMatch Academy",
    description: "Learn how to write a strong CV tailored to local employers.",
    skills: ["communication"],
    url: "https://example.com/cv-writing",
    status: "active",
  },
  {
    id: "demo-course-2",
    title: "SQL Basics",
    provider: "JobMatch Academy",
    description: "Understand database queries and relational data.",
    skills: ["database", "sql"],
    url: "https://example.com/sql-basics",
    status: "active",
  },
  {
    id: "demo-course-3",
    title: "React for Beginners",
    provider: "JobMatch Academy",
    description: "Build modern interfaces with React and TypeScript.",
    skills: ["react", "typescript"],
    url: "https://example.com/react-basics",
    status: "active",
  },
];

const SEEKER_PROFILE = {
  id: SEEKER_ID,
  email: DEMO_ACCOUNT.email,
  role: "job_seeker",
  fullName: "Bah User",
  phone: "+220 123 4567",
  location: "Banjul",
  bio: "Job seeker exploring opportunities in The Gambia.",
  approved: true,
  emailVerified: true,
  blocked: false,
  skills: ["JavaScript", "Communication"],
  cvFileName: null,
};

function cloneJob(job) {
  return {
    ...job,
    requiredSkills: [...(job.requiredSkills || [])],
    employer: job.employer ? { ...job.employer } : undefined,
    match: job.match
      ? { ...job.match, missingSkills: [...(job.match.missingSkills || [])] }
      : undefined,
  };
}

function createDefaultStore() {
  const jobs = PUBLISHED_JOBS.map(cloneJob);
  const candidate = {
    id: SEEKER_ID,
    fullName: SEEKER_PROFILE.fullName,
    email: SEEKER_PROFILE.email,
    skills: [...SEEKER_PROFILE.skills],
  };

  const jobApplications = {
    "demo-job-1": [
      {
        id: "demo-app-1",
        status: "shortlisted",
        matchScore: 88,
        createdAt: "2026-06-10T10:00:00.000Z",
        user: candidate,
        candidate,
        match: {
          score: 88,
          matchedSkills: ["JavaScript", "Communication"],
          missingSkills: ["typescript"],
        },
        job: cloneJob(jobs[0]),
      },
    ],
    "demo-job-2": [
      {
        id: "demo-app-2",
        status: "pending",
        matchScore: 72,
        createdAt: "2026-06-15T14:30:00.000Z",
        user: candidate,
        candidate,
        match: {
          score: 72,
          matchedSkills: ["Communication"],
          missingSkills: ["sql", "python"],
        },
        job: cloneJob(jobs[1]),
      },
    ],
  };

  const applications = [
    jobApplications["demo-job-1"][0],
    jobApplications["demo-job-2"][0],
  ].map((app) => ({
    ...app,
    job: cloneJob(app.job),
  }));

  const notifications = [
    {
      id: "demo-notif-1",
      title: "Application shortlisted",
      message: "Your application for Frontend Developer was shortlisted.",
      type: "APPLICATION",
      read: false,
      createdAt: "2026-06-11T09:00:00.000Z",
    },
    {
      id: "demo-notif-2",
      title: "New job match",
      message: "Customer Support Specialist is a 91% match for your profile.",
      type: "JOB",
      read: false,
      createdAt: "2026-06-16T09:00:00.000Z",
    },
    {
      id: "demo-notif-3",
      title: "Training recommendation",
      message: "SQL Basics may help close your skills gap.",
      type: "INFO",
      read: true,
      createdAt: "2026-06-05T09:00:00.000Z",
    },
  ];

  const chatThreads = [
    {
      id: "demo-thread-1",
      status: "OPEN",
      employer: {
        id: EMPLOYER_ID,
        fullName: "Awa Jallow",
        companyName: "Atlantic Tech",
      },
      applicant: {
        id: SEEKER_ID,
        fullName: SEEKER_PROFILE.fullName,
        email: SEEKER_PROFILE.email,
      },
      job: cloneJob(jobs[0]),
      updatedAt: "2026-06-12T15:00:00.000Z",
    },
  ];

  const chatMessages = {
    "demo-thread-1": [
      {
        id: "demo-msg-1",
        content: "Hi Bah, thanks for applying. Can you share your React experience?",
        createdAt: "2026-06-12T14:00:00.000Z",
        sender: {
          id: EMPLOYER_ID,
          fullName: "Awa Jallow",
        },
      },
      {
        id: "demo-msg-2",
        content: "Hello! I have been building React apps for 2 years at Atlantic Tech.",
        createdAt: "2026-06-12T14:30:00.000Z",
        sender: {
          id: SEEKER_ID,
          fullName: SEEKER_PROFILE.fullName,
        },
      },
    ],
  };

  return {
    user: { ...SEEKER_PROFILE, skills: [...SEEKER_PROFILE.skills] },
    jobs,
    applications,
    jobApplications,
    notifications,
    chatThreads,
    chatMessages,
    coachMessages: [],
    courses: TRAINING_COURSES.map((course) => ({
      ...course,
      skills: [...course.skills],
    })),
  };
}

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

export async function matchesDemoAccount(email, password) {
  const normalized = normalizeEmail(email);
  if (
    normalized !== DEMO_ACCOUNT.email ||
    password !== DEMO_ACCOUNT.password
  ) {
    return null;
  }
  return DEMO_ACCOUNT;
}

export async function isDemoSession() {
  return (await getItem(KEYS.demoSession)) === "true";
}

export async function enableDemoSession(email) {
  const normalized = normalizeEmail(email);
  if (normalized !== DEMO_ACCOUNT.email) {
    return null;
  }

  await setItem(KEYS.demoSession, "true");
  await setItem(KEYS.demoRole, DEMO_ACCOUNT.role);
  await setItem(KEYS.demoEmail, DEMO_ACCOUNT.email);

  const existing = await getItem(KEYS.demoStore);
  if (!existing) {
    await setItem(KEYS.demoStore, JSON.stringify(createDefaultStore()));
  }

  return DEMO_ACCOUNT;
}

export async function disableDemoSession() {
  await Promise.all([
    removeItem(KEYS.demoSession),
    removeItem(KEYS.demoRole),
    removeItem(KEYS.demoEmail),
  ]);
}

export async function getDemoStore() {
  const raw = await getItem(KEYS.demoStore);
  if (!raw) {
    const store = createDefaultStore();
    await setItem(KEYS.demoStore, JSON.stringify(store));
    return store;
  }
  return JSON.parse(raw);
}

export async function saveDemoStore(store) {
  await setItem(KEYS.demoStore, JSON.stringify(store));
}

export async function getDemoUser() {
  const store = await getDemoStore();
  return store.user;
}

export async function updateDemoUser(updates) {
  const store = await getDemoStore();
  store.user = { ...store.user, ...updates };
  await saveDemoStore(store);
  return store.user;
}
