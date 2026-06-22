import {
  getDemoRole,
  getDemoStore,
  getDemoUser,
  saveDemoStore,
  updateDemoUser,
} from "./demoSession.js";

function parseBody(options) {
  if (options.body instanceof FormData) {
    return null;
  }
  return options.body ? JSON.parse(options.body) : null;
}

function filterSeekerJobs(jobs, params = {}) {
  let results = jobs.filter((job) => job.status === "published");

  if (params.search) {
    const term = params.search.toLowerCase();
    results = results.filter(
      (job) =>
        job.title.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term)
    );
  }

  if (params.location) {
    const term = params.location.toLowerCase();
    results = results.filter((job) => job.location.toLowerCase().includes(term));
  }

  return results.map((job) => ({
    ...job,
    requiredSkills: [...job.requiredSkills],
    employer: { ...job.employer },
    match: job.match ? { ...job.match, missingSkills: [...job.match.missingSkills] } : null,
  }));
}

function listJobs(params = {}) {
  const store = getDemoStore();
  const role = getDemoRole();

  if (role === "job_seeker") {
    return filterSeekerJobs(store.jobs, params);
  }

  if (params.status) {
    return store.jobs.filter((job) => job.status === params.status);
  }

  return store.jobs;
}

function updateApplicationStatus(store, appId, status) {
  for (const apps of Object.values(store.jobApplications)) {
    const app = apps.find((item) => item.id === appId);
    if (app) {
      app.status = status;
      saveDemoStore(store);
      return app;
    }
  }
  return null;
}

function handleDemoRequest(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const store = getDemoStore();
  const body = parseBody(options);
  const role = getDemoRole();

  if (path === "/auth/me" && method === "GET") {
    return getDemoUser();
  }

  if (path === "/users/me" && method === "GET") {
    return getDemoUser();
  }

  if (path === "/applications/me" && method === "GET") {
    return store.applications;
  }

  if (path.startsWith("/jobs") && method === "GET") {
    const [pathname, queryString = ""] = path.split("?");
    const params = Object.fromEntries(new URLSearchParams(queryString));

    if (pathname.match(/^\/jobs\/[^/]+\/matches$/)) {
      const jobId = pathname.split("/")[2];
      return store.jobApplications[jobId] || [];
    }

    if (pathname !== "/jobs") {
      const jobId = pathname.split("/")[2];
      const job = store.jobs.find((item) => item.id === jobId);
      return job || null;
    }

    return listJobs(params);
  }

  if (path.startsWith("/applications/job/") && method === "GET") {
    const jobId = path.split("/").pop();
    return store.jobApplications[jobId] || [];
  }

  if (path === "/training" && method === "GET") {
    return store.courses.filter((course) => course.status !== "inactive");
  }

  if (path === "/training/admin" && method === "GET") {
    return store.courses;
  }

  if (path === "/notifications/me" && method === "GET") {
    return store.notifications || [];
  }

  if (path.match(/^\/notifications\/[^/]+\/read$/) && method === "PATCH") {
    const notifId = path.split("/")[2];
    const notification = (store.notifications || []).find((item) => item.id === notifId);
    if (notification) {
      notification.read = true;
      saveDemoStore(store);
    }
    return notification || { read: true };
  }

  if (path === "/chat/threads" && method === "GET") {
    return store.chatThreads || [];
  }

  if (path === "/chat/threads" && method === "POST") {
    const existing = (store.chatThreads || []).find(
      (thread) =>
        thread.applicant?.id === body.participantId ||
        thread.employer?.id === body.participantId
    );
    if (existing) {
      return existing;
    }

    const thread = {
      id: `demo-thread-${Date.now()}`,
      status: "OPEN",
      employer: store.user.role === "employer" ? store.user : { id: body.participantId, fullName: "Contact" },
      applicant: store.user.role === "job_seeker" ? store.user : { id: body.participantId, fullName: "Contact" },
      job: body.jobId ? store.jobs.find((job) => job.id === body.jobId) : null,
      updatedAt: new Date().toISOString(),
    };
    store.chatThreads = [thread, ...(store.chatThreads || [])];
    store.chatMessages[thread.id] = [];
    saveDemoStore(store);
    return thread;
  }

  if (path.match(/^\/chat\/threads\/[^/]+\/messages$/) && method === "GET") {
    const threadId = path.split("/")[3];
    return store.chatMessages?.[threadId] || [];
  }

  if (path.match(/^\/chat\/threads\/[^/]+\/messages$/) && method === "POST") {
    const threadId = path.split("/")[3];
    const message = {
      id: `demo-msg-${Date.now()}`,
      content: body.content,
      createdAt: new Date().toISOString(),
      sender: {
        id: store.user.id,
        fullName: store.user.fullName,
      },
    };
    store.chatMessages[threadId] = [...(store.chatMessages[threadId] || []), message];
    const thread = (store.chatThreads || []).find((item) => item.id === threadId);
    if (thread) {
      thread.updatedAt = message.createdAt;
    }
    saveDemoStore(store);
    return message;
  }

  if (path.match(/^\/chat\/threads\/[^/]+\/read$/) && method === "PATCH") {
    return { markedRead: 1 };
  }

  if (path.match(/^\/users\/[^/]+$/) && method === "GET") {
    const userId = path.split("/")[2];
    return store.users.find((item) => item.id === userId) || getDemoUser();
  }

  if (path === "/admin/analytics" && method === "GET") {
    return store.analytics;
  }

  if (path === "/admin/audit-logs" && method === "GET") {
    return store.auditLogs;
  }

  if (path === "/admin/ai-config" && method === "GET") {
    return (
      store.aiConfig || {
        aiEngineUrl: "http://localhost:8000",
        aiMatchThreshold: 70,
        aiEnabled: true,
        careerChatEnabled: true,
        resumeParsingEnabled: true,
        updatedAt: new Date().toISOString(),
      }
    );
  }

  if (path === "/admin/ai-config" && method === "PATCH") {
    store.aiConfig = {
      ...(store.aiConfig || {}),
      ...body,
      updatedAt: new Date().toISOString(),
    };
    saveDemoStore(store);
    return store.aiConfig;
  }

  if (path === "/admin/ai-config/health" && method === "GET") {
    return {
      status: "online",
      latencyMs: 42,
      aiEngineUrl: store.aiConfig?.aiEngineUrl || "http://localhost:8000",
      checkedAt: new Date().toISOString(),
    };
  }

  if (path === "/employer/analytics" && method === "GET") {
    const user = getDemoUser();
    const jobs = store.jobs.filter((j) => j.employerId === user.id);
    const jobIds = new Set(jobs.map((j) => j.id));
    const applications = store.applications.filter((a) => jobIds.has(a.job?.id));
    const byStatus = { pending: 0, shortlisted: 0, interview: 0, rejected: 0, hired: 0 };
    let totalMatch = 0;
    applications.forEach((app) => {
      const key = app.status || "pending";
      if (byStatus[key] != null) byStatus[key]++;
      totalMatch += app.matchScore || 0;
    });
    return {
      jobs: {
        total: jobs.length,
        published: jobs.filter((j) => j.status === "published").length,
        pendingReview: jobs.filter((j) => j.status === "pending_review").length,
        draft: jobs.filter((j) => j.status === "draft").length,
        closed: jobs.filter((j) => j.status === "closed").length,
      },
      applications: {
        total: applications.length,
        byStatus,
        avgMatchScore: applications.length ? Math.round(totalMatch / applications.length) : 0,
      },
      funnel: {
        applied: applications.length,
        shortlisted: byStatus.shortlisted + byStatus.interview + byStatus.hired,
        interview: byStatus.interview + byStatus.hired,
        hired: byStatus.hired,
      },
      applicationsByJob: jobs.map((job) => {
        const jobApps = applications.filter((a) => a.job?.id === job.id);
        return {
          jobId: job.id,
          title: job.title,
          status: job.status,
          views: job.views || 0,
          applicantCount: jobApps.length,
          avgMatchScore: jobApps.length
            ? Math.round(jobApps.reduce((s, a) => s + (a.matchScore || 0), 0) / jobApps.length)
            : 0,
        };
      }),
      recentApplications: applications.slice(0, 10),
    };
  }

  if (path.match(/^\/training\/recommendations\/[^/]+$/) && method === "GET") {
    const jobId = path.split("/")[3];
    const job = store.jobs.find((item) => item.id === jobId);
    const user = getDemoUser();
    if (!job) {
      return { missingSkills: [], recommendations: [] };
    }
    const missingSkills = (job.requiredSkills || []).filter(
      (skill) => !(user.skills || []).map((s) => s.toLowerCase()).includes(skill.toLowerCase())
    );
    const recommendations = store.courses
      .filter((course) => course.skills.some((s) => missingSkills.includes(s)))
      .slice(0, 5)
      .map((course) => ({
        title: course.title,
        provider: course.provider,
        url: course.url || "",
        skill: course.skills[0],
        type: "local",
      }));
    return { missingSkills, recommendations };
  }

  if (path === "/applications" && method === "POST") {
    const job = store.jobs.find((item) => item.id === body.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    const existing = store.applications.find((app) => app.job?.id === body.jobId);
    if (existing) {
      return existing;
    }

    const application = {
      id: `demo-app-${Date.now()}`,
      status: "pending",
      matchScore: job.match?.score ?? null,
      createdAt: new Date().toISOString(),
      job,
      user: getDemoUser(),
      candidate: getDemoUser(),
    };

    store.applications.unshift(application);
    store.jobApplications[job.id] = store.jobApplications[job.id] || [];
    store.jobApplications[job.id].unshift(application);
    saveDemoStore(store);
    return application;
  }

  if (path.match(/^\/applications\/[^/]+\/status$/) && method === "PATCH") {
    const appId = path.split("/")[2];
    const updated = updateApplicationStatus(store, appId, body.status);
    if (!updated) {
      throw new Error("Application not found");
    }
    return updated;
  }

  if (path === "/jobs" && method === "POST") {
    const job = {
      id: `demo-job-${Date.now()}`,
      employerId: store.user.id,
      status: "pending_review",
      createdAt: new Date().toISOString(),
      employer: {
        id: store.user.id,
        fullName: store.user.fullName,
        companyName: store.user.companyName,
      },
      ...body,
      requiredSkills: body.requiredSkills || [],
    };
    store.jobs.unshift(job);
    store.jobApplications[job.id] = [];
    saveDemoStore(store);
    return job;
  }

  if (path.match(/^\/jobs\/[^/]+$/) && method === "PATCH") {
    const jobId = path.split("/")[2];
    const job = store.jobs.find((item) => item.id === jobId);
    if (!job) {
      throw new Error("Job not found");
    }
    Object.assign(job, body);
    saveDemoStore(store);
    return job;
  }

  if (path.match(/^\/jobs\/[^/]+$/) && method === "DELETE") {
    const jobId = path.split("/")[2];
    store.jobs = store.jobs.filter((item) => item.id !== jobId);
    delete store.jobApplications[jobId];
    saveDemoStore(store);
    return { message: "Job deleted" };
  }

  if (path.match(/^\/admin\/jobs\/[^/]+\/moderate$/) && method === "PATCH") {
    const jobId = path.split("/")[3];
    const job = store.jobs.find((item) => item.id === jobId);
    if (!job) {
      throw new Error("Job not found");
    }
    job.status = body.status;
    saveDemoStore(store);
    return job;
  }

  if (path.match(/^\/admin\/users\/[^/]+\/(approve|unapprove|block|unblock)$/) && method === "PATCH") {
    const [, , , userId, action] = path.split("/");
    const user = store.users.find((item) => item.id === userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (action === "approve") user.approved = true;
    if (action === "unapprove") user.approved = false;
    if (action === "block") user.blocked = true;
    if (action === "unblock") user.blocked = false;

    saveDemoStore(store);
    return user;
  }

  if (path === "/users/me" && method === "PATCH") {
    return updateDemoUser(body);
  }

  if (path === "/users/me/skills" && method === "PATCH") {
    return updateDemoUser({ skills: body.skills || [] });
  }

  if (path === "/users/me/cv" && method === "POST") {
    const parsed = {
      skills: ["JavaScript", "React", "Communication"],
      experience: ["Frontend Developer at Atlantic Tech (2023–Present)"],
      education: ["BSc Computer Science, University of The Gambia"],
    };
    const currentUser = getDemoUser();
    const mergedSkills = Array.from(
      new Set([...(currentUser?.skills || []), ...parsed.skills].map((skill) => skill.trim()).filter(Boolean)),
    );
    const addedSkills = mergedSkills.filter(
      (skill) => !(currentUser?.skills || []).some((existing) => existing.toLowerCase() === skill.toLowerCase()),
    );
    const user = updateDemoUser({
      cvFileName: "demo-cv.pdf",
      skills: mergedSkills,
    });
    return { parsed, user, addedSkills };
  }

  if (path === "/ai/skills-gap" && method === "POST") {
    const candidateSkills = (body.candidateSkills || []).map((skill) =>
      skill.toLowerCase()
    );
    const missingSkills = (body.requiredSkills || []).filter(
      (skill) => !candidateSkills.includes(skill.toLowerCase())
    );
    return { missingSkills };
  }

  if (path === "/ai/training-recommendations" && method === "POST") {
    const missingSkills = body.missingSkills || [];
    const recommendations = store.courses
      .filter((course) =>
        course.skills.some((skill) =>
          missingSkills.some(
            (missing) => missing.toLowerCase() === skill.toLowerCase()
          )
        )
      )
      .map((course) => ({
        title: course.title,
        provider: course.provider,
        description: course.description,
        url: course.url,
        skill: course.skills[0],
      }));

    return { recommendations };
  }

  if (path.match(/^\/ai\/match-score\/[^/]+$/) && method === "GET") {
    const jobId = path.split("/")[3];
    const job = store.jobs.find((item) => item.id === jobId);
    return {
      jobId,
      score: job?.match?.score ?? 75,
      matchedSkills: job?.match?.matchedSkills || ["JavaScript", "Communication"],
      missingSkills: job?.match?.missingSkills || [],
    };
  }

  if (path === "/ai/coach/messages" && method === "GET") {
    return store.coachMessages || [];
  }

  if (path === "/ai/coach/clear" && method === "POST") {
    store.coachMessages = [];
    saveDemoStore(store);
    return { cleared: true };
  }

  if (path === "/ai/chat" && method === "POST") {
    const assistantContent =
      "Based on your profile, focus on React and TypeScript roles in Banjul. Upload your CV and apply to Frontend Developer openings for the best match scores.";
    const userMessage = {
      id: `coach-user-${Date.now()}`,
      role: "user",
      content: body.message,
      createdAt: new Date().toISOString(),
    };
    const assistantMessage = {
      id: `coach-ai-${Date.now() + 1}`,
      role: "assistant",
      content: assistantContent,
      createdAt: new Date().toISOString(),
    };
    store.coachMessages = [...(store.coachMessages || []), userMessage, assistantMessage];
    saveDemoStore(store);
    return {
      response: assistantContent,
      userMessage,
      assistantMessage,
    };
  }

  if (path === "/ai/learning-roadmap" && method === "POST") {
    return {
      roadmap: {
        goal: body.goal,
        summary: `A practical path to become a ${body.goal} using your current skills.`,
        estimated_timeline: "3-6 months",
        steps: [
          {
            step: 1,
            title: "Strengthen core skills",
            skills_to_learn: body.currentSkills?.length ? ["TypeScript"] : ["JavaScript"],
            duration: "4 weeks",
            resources: ["JobMatch Academy courses"],
          },
          {
            step: 2,
            title: "Build portfolio projects",
            skills_to_learn: ["React", "Communication"],
            duration: "6 weeks",
            resources: ["GitHub portfolio", "Local hackathons"],
          },
        ],
      },
      response: `Roadmap created for ${body.goal}.`,
    };
  }

  if (path === "/training" && method === "POST") {
    const course = {
      id: `demo-course-${Date.now()}`,
      status: "active",
      ...body,
      skills: body.skills || [],
    };
    store.courses.unshift(course);
    saveDemoStore(store);
    return course;
  }

  if (path.match(/^\/training\/[^/]+$/) && method === "PATCH") {
    const courseId = path.split("/")[2];
    const course = store.courses.find((item) => item.id === courseId);
    if (!course) {
      throw new Error("Course not found");
    }
    Object.assign(course, body);
    saveDemoStore(store);
    return course;
  }

  if (path.match(/^\/training\/[^/]+$/) && method === "DELETE") {
    const courseId = path.split("/")[2];
    store.courses = store.courses.filter((item) => item.id !== courseId);
    saveDemoStore(store);
    return { message: "Training course deleted successfully" };
  }

  if (path === "/users" && method === "GET") {
    return store.users;
  }
}

export function getDemoResponse(path, options = {}) {
  return handleDemoRequest(path, options);
}
