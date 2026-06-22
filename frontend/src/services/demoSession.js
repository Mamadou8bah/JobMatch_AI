export const DEMO_PASSWORD = "11111111";

export const DEMO_ACCOUNTS = [
  {
    email: "bah@gmail.com",
    password: DEMO_PASSWORD,
    role: "job_seeker",
    label: "Job Seeker",
    dashboard: "/seeker",
  },
  {
    email: "employer@gmail.com",
    password: DEMO_PASSWORD,
    role: "employer",
    label: "Employer",
    dashboard: "/employer",
  },
  {
    email: "admin@gmail.com",
    password: DEMO_PASSWORD,
    role: "admin",
    label: "Admin",
    dashboard: "/admin",
  },
];

const DEMO_SESSION_KEY = "demoSession";
const DEMO_ROLE_KEY = "demoRole";
const DEMO_EMAIL_KEY = "demoEmail";

const SEEKER_ID = "demo-bah-user";
const EMPLOYER_ID = "demo-employer-user";
const ADMIN_ID = "demo-admin-user";

const SHARED_JOBS = [
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
  {
    id: "demo-job-4",
    employerId: EMPLOYER_ID,
    title: "Marketing Coordinator",
    description: "Support outreach campaigns for training providers and employers.",
    location: "Banjul",
    employmentType: "full-time",
    experienceLevel: "mid",
    requiredSkills: ["communication", "marketing"],
    status: "draft",
    createdAt: "2026-06-01T09:00:00.000Z",
    employer: {
      id: EMPLOYER_ID,
      fullName: "Awa Jallow",
      companyName: "Atlantic Tech",
    },
  },
  {
    id: "demo-job-5",
    employerId: "demo-pending-employer",
    title: "Warehouse Assistant",
    description: "Assist with inventory and logistics for a Banjul distribution center.",
    location: "Banjul",
    employmentType: "full-time",
    experienceLevel: "entry",
    requiredSkills: ["communication", "teamwork"],
    status: "pending_review",
    createdAt: "2026-06-18T09:00:00.000Z",
    employer: {
      id: "demo-pending-employer",
      fullName: "Lamin Ceesay",
      companyName: "River Logistics",
    },
  },
];

const SHARED_COURSES = [
  {
    id: "demo-course-1",
    title: "Intro to CV Writing",
    provider: "JobMatch Academy",
    description: "Learn how to write a strong CV tailored to local employers.",
    skills: ["communication"],
    url: "https://example.com/cv-writing",
  },
  {
    id: "demo-course-2",
    title: "SQL Basics",
    provider: "JobMatch Academy",
    description: "Understand database queries and relational data.",
    skills: ["database", "sql"],
    url: "https://example.com/sql-basics",
  },
  {
    id: "demo-course-3",
    title: "React for Beginners",
    provider: "JobMatch Academy",
    description: "Build modern interfaces with React and TypeScript.",
    skills: ["react", "typescript"],
    url: "https://example.com/react-basics",
  },
];

const CANDIDATE_BAH = {
  id: SEEKER_ID,
  fullName: "Bah User",
  email: "bah@gmail.com",
  skills: ["JavaScript", "Communication"],
};

const CANDIDATE_FATOU = {
  id: "demo-candidate-2",
  fullName: "Fatou A.",
  email: "fatou@gmail.com",
  skills: ["React", "TypeScript", "Communication"],
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

function createJobApplications() {
  return {
    "demo-job-1": [
      {
        id: "demo-app-1",
        status: "shortlisted",
        matchScore: 88,
        createdAt: "2026-06-10T10:00:00.000Z",
        user: CANDIDATE_BAH,
        candidate: CANDIDATE_BAH,
        match: {
          score: 88,
          matchedSkills: ["JavaScript", "Communication"],
          missingSkills: ["typescript"],
        },
        job: cloneJob(SHARED_JOBS[0]),
      },
      {
        id: "demo-app-3",
        status: "interview",
        matchScore: 94,
        createdAt: "2026-06-12T11:00:00.000Z",
        user: CANDIDATE_FATOU,
        candidate: CANDIDATE_FATOU,
        match: {
          score: 94,
          matchedSkills: ["React", "TypeScript", "Communication"],
          missingSkills: [],
        },
        job: cloneJob(SHARED_JOBS[0]),
      },
    ],
    "demo-job-2": [
      {
        id: "demo-app-2",
        status: "pending",
        matchScore: 72,
        createdAt: "2026-06-15T14:30:00.000Z",
        user: CANDIDATE_BAH,
        candidate: CANDIDATE_BAH,
        match: {
          score: 72,
          matchedSkills: ["Communication"],
          missingSkills: ["sql", "python"],
        },
        job: cloneJob(SHARED_JOBS[1]),
      },
    ],
  };
}

function createDefaultStore(role) {
  const jobs = SHARED_JOBS.map(cloneJob);
  const jobApplications = createJobApplications();
  const seekerApplications = [
    jobApplications["demo-job-1"][0],
    jobApplications["demo-job-2"][0],
  ];

  const users = [
    {
      id: SEEKER_ID,
      email: "bah@gmail.com",
      role: "job_seeker",
      fullName: "Bah User",
      approved: true,
      blocked: false,
      emailVerified: true,
      createdAt: "2026-04-01T09:00:00.000Z",
      skills: ["JavaScript", "Communication"],
    },
    {
      id: EMPLOYER_ID,
      email: "employer@gmail.com",
      role: "employer",
      fullName: "Awa Jallow",
      companyName: "Atlantic Tech",
      approved: true,
      blocked: false,
      emailVerified: true,
      createdAt: "2026-03-15T09:00:00.000Z",
      skills: [],
    },
    {
      id: "demo-pending-employer",
      email: "pending@company.gm",
      role: "employer",
      fullName: "Lamin Ceesay",
      companyName: "River Logistics",
      approved: false,
      blocked: false,
      emailVerified: true,
      createdAt: "2026-06-19T09:00:00.000Z",
      skills: [],
    },
    {
      id: ADMIN_ID,
      email: "admin@gmail.com",
      role: "admin",
      fullName: "System Admin",
      approved: true,
      blocked: false,
      emailVerified: true,
      createdAt: "2026-01-01T09:00:00.000Z",
      skills: [],
    },
  ];

  const analytics = {
    users: {
      total: users.length,
      jobSeekers: 1,
      employers: 2,
      pendingEmployers: 1,
    },
    jobs: {
      total: jobs.length,
      published: jobs.filter((job) => job.status === "published").length,
      pendingReview: jobs.filter((job) => job.status === "pending_review").length,
    },
    applications: {
      total: seekerApplications.length + 1,
      hired: 0,
    },
    engagement: {
      openChatThreads: 2,
    },
    training: {
      courses: SHARED_COURSES.length,
    },
    labourMarket: {
      topRequiredSkills: [
        { skill: "communication", count: 4 },
        { skill: "react", count: 2 },
        { skill: "typescript", count: 2 },
        { skill: "sql", count: 1 },
      ],
    },
  };

  const auditLogs = [
    {
      id: "demo-log-1",
      action: "JOB_MODERATED",
      message: "Approved job posting: Frontend Developer",
      createdAt: "2026-06-01T10:00:00.000Z",
    },
    {
      id: "demo-log-2",
      action: "USER_APPROVED",
      message: "Approved employer account: Atlantic Tech",
      createdAt: "2026-05-20T10:00:00.000Z",
    },
  ];

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
        fullName: "Bah User",
        email: "bah@gmail.com",
      },
      job: cloneJob(SHARED_JOBS[0]),
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
          fullName: "Bah User",
        },
      },
    ],
  };

  const roleUsers = {
    job_seeker: {
      id: SEEKER_ID,
      email: "bah@gmail.com",
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
    },
    employer: {
      id: EMPLOYER_ID,
      email: "employer@gmail.com",
      role: "employer",
      fullName: "Awa Jallow",
      companyName: "Atlantic Tech",
      companyDescription: "Technology company building digital products in The Gambia.",
      phone: "+220 555 0101",
      location: "Banjul",
      approved: true,
      emailVerified: true,
      blocked: false,
      skills: [],
    },
    admin: {
      id: ADMIN_ID,
      email: "admin@gmail.com",
      role: "admin",
      fullName: "System Admin",
      approved: true,
      emailVerified: true,
      blocked: false,
      skills: [],
    },
  };

  return {
    user: roleUsers[role],
    jobs,
    applications: seekerApplications.map((app) => ({
      ...app,
      job: cloneJob(app.job),
    })),
    jobApplications,
    users,
    analytics,
    auditLogs,
    notifications,
    chatThreads,
    chatMessages,
    coachMessages: [],
    courses: SHARED_COURSES.map((course) => ({
      ...course,
      skills: [...course.skills],
      status: "active",
    })),
  };
}

function findDemoAccount(email) {
  return DEMO_ACCOUNTS.find(
    (account) => account.email === email.trim().toLowerCase()
  );
}

export function matchesDemoAccount(email, password) {
  const account = findDemoAccount(email);
  if (!account || account.password !== password) {
    return null;
  }
  return account;
}

export function isDemoSession() {
  return localStorage.getItem(DEMO_SESSION_KEY) === "true";
}

export function getDemoRole() {
  return localStorage.getItem(DEMO_ROLE_KEY);
}

function getStoreKey(role = getDemoRole()) {
  return `demoStore_${role}`;
}

export function enableDemoSession(email) {
  const account = findDemoAccount(email);
  if (!account) {
    return null;
  }

  localStorage.setItem(DEMO_SESSION_KEY, "true");
  localStorage.setItem(DEMO_ROLE_KEY, account.role);
  localStorage.setItem(DEMO_EMAIL_KEY, account.email);

  const storeKey = getStoreKey(account.role);
  if (!localStorage.getItem(storeKey)) {
    localStorage.setItem(storeKey, JSON.stringify(createDefaultStore(account.role)));
  }

  return account;
}

export function disableDemoSession() {
  localStorage.removeItem(DEMO_SESSION_KEY);
  localStorage.removeItem(DEMO_ROLE_KEY);
  localStorage.removeItem(DEMO_EMAIL_KEY);
}

export function getDemoStore() {
  const role = getDemoRole() || "job_seeker";
  const storeKey = getStoreKey(role);

  if (!localStorage.getItem(storeKey)) {
    localStorage.setItem(storeKey, JSON.stringify(createDefaultStore(role)));
  }

  return JSON.parse(localStorage.getItem(storeKey));
}

export function saveDemoStore(store) {
  localStorage.setItem(getStoreKey(), JSON.stringify(store));
}

export function getDemoUser() {
  return getDemoStore().user;
}

export function updateDemoUser(updates) {
  const store = getDemoStore();
  store.user = { ...store.user, ...updates };
  saveDemoStore(store);
  return store.user;
}
