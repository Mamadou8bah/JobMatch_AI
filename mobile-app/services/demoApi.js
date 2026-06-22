import {
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

function filterPublishedJobs(jobs, params = {}) {
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
    match: job.match
      ? { ...job.match, missingSkills: [...job.match.missingSkills] }
      : null,
  }));
}

async function handleDemoRequest(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const store = await getDemoStore();
  const body = parseBody(options);

  if (path === "/auth/me" && method === "GET") {
    return getDemoUser();
  }

  if (path === "/applications/me" && method === "GET") {
    return store.applications;
  }

  if (path.startsWith("/jobs") && method === "GET") {
    const [pathname, queryString = ""] = path.split("?");
    const params = Object.fromEntries(new URLSearchParams(queryString));

    if (pathname !== "/jobs") {
      const jobId = pathname.split("/")[2];
      const job = store.jobs.find((item) => item.id === jobId);
      return job || null;
    }

    return filterPublishedJobs(store.jobs, params);
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

    const user = await getDemoUser();
    const application = {
      id: `demo-app-${Date.now()}`,
      status: "pending",
      matchScore: job.match?.score ?? null,
      createdAt: new Date().toISOString(),
      job,
      user,
      candidate: user,
    };

    store.applications.unshift(application);
    store.jobApplications[job.id] = store.jobApplications[job.id] || [];
    store.jobApplications[job.id].unshift(application);
    await saveDemoStore(store);
    return application;
  }

  if (path === "/notifications/me" && method === "GET") {
    return store.notifications || [];
  }

  if (path.match(/^\/notifications\/[^/]+\/read$/) && method === "PATCH") {
    const notifId = path.split("/")[2];
    const notification = (store.notifications || []).find((item) => item.id === notifId);
    if (notification) {
      notification.read = true;
      await saveDemoStore(store);
    }
    return notification || { read: true };
  }

  if (path === "/chat/threads" && method === "GET") {
    return store.chatThreads || [];
  }

  if (path === "/chat/threads" && method === "POST") {
    const user = await getDemoUser();
    const participantId = body.participantId;
    const jobId = body.jobId;
    const existing = (store.chatThreads || []).find(
      (t) => t.participant?.id === participantId && t.job?.id === jobId
    );
    if (existing) return existing;

    const thread = {
      id: `demo-thread-${Date.now()}`,
      job: store.jobs.find((j) => j.id === jobId) || null,
      participant: store.users?.find((u) => u.id === participantId) || {
        id: participantId,
        fullName: "Candidate",
      },
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
    };
    store.chatThreads = [thread, ...(store.chatThreads || [])];
    store.chatMessages[thread.id] = store.chatMessages[thread.id] || [];
    await saveDemoStore(store);
    return thread;
  }

  if (path.match(/^\/chat\/threads\/[^/]+\/read$/) && method === "PATCH") {
    return { markedRead: 1 };
  }

  if (path === "/users/me/cv" && method === "POST") {
    const current = await getDemoUser();
    const user = await updateDemoUser({
      cvFileName: "demo-resume.pdf",
      skills: Array.from(new Set([...(current.skills || []), "Communication", "Teamwork"])),
    });
    return {
      user,
      parsed: {
        skills: ["Communication", "Teamwork"],
        education: [],
        experience: [],
        rawText: "Demo CV parsed successfully.",
      },
    };
  }

  if (path.match(/^\/chat\/threads\/[^/]+\/messages$/) && method === "GET") {
    const threadId = path.split("/")[3];
    return store.chatMessages?.[threadId] || [];
  }

  if (path.match(/^\/chat\/threads\/[^/]+\/messages$/) && method === "POST") {
    const threadId = path.split("/")[3];
    const user = await getDemoUser();
    const message = {
      id: `demo-msg-${Date.now()}`,
      content: body.content,
      createdAt: new Date().toISOString(),
      sender: {
        id: user.id,
        fullName: user.fullName,
      },
    };
    store.chatMessages[threadId] = [...(store.chatMessages[threadId] || []), message];
    await saveDemoStore(store);
    return message;
  }

  if (path === "/training" && method === "GET") {
    return store.courses.filter((course) => course.status !== "inactive");
  }

  if (path === "/users/me" && method === "PATCH") {
    return updateDemoUser(body);
  }

  if (path === "/users/me/skills" && method === "PATCH") {
    return updateDemoUser({ skills: body.skills || [] });
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

  if (path === "/ai/chat" && method === "POST") {
    return {
      response:
        "Based on your profile, focus on React and TypeScript roles in Banjul. Upload your CV and apply to Frontend Developer openings for the best match scores.",
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

  return null;
}

export async function getDemoResponse(path, options = {}) {
  return handleDemoRequest(path, options);
}
