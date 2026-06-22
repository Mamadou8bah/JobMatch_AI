const PRODUCTION_API_BASE = "https://jobmatchgambia.onrender.com/api";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "/api" : PRODUCTION_API_BASE);

/** Fire-and-forget ping to wake a sleeping backend before the user needs data. */
export function wakeBackend() {
  return fetch(`${API_BASE}/health`, { method: "GET" }).catch(() => {});
}

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function getTokens() {
  return {
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
  };
}

function setTokens(accessToken, refreshToken) {
  if (accessToken) localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
}

function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

async function refreshAccessToken() {
  const { refreshToken } = getTokens();
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

async function request(path, options = {}) {
  const { accessToken } = getTokens();
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && accessToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    }
  }

  const contentType = res.headers.get("content-type");
  const data = contentType?.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const message =
      typeof data === "object" && data?.message
        ? Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message
        : `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: (path, body) =>
    request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),

  auth: {
    login: (email, password) =>
      api.post("/auth/login", { email, password }).then((data) => {
        setTokens(data.accessToken, data.refreshToken);
        return data;
      }),
    register: (payload) =>
      api.post("/auth/register", payload).then((data) => {
        setTokens(data.accessToken, data.refreshToken);
        return data;
      }),
    logout: async () => {
      const { refreshToken } = getTokens();
      try {
        if (refreshToken) await api.post("/auth/logout", { refreshToken });
      } finally {
        clearTokens();
      }
    },
    me: () => api.get("/auth/me"),
    forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
    resetPassword: (token, newPassword) =>
      api.post("/auth/reset-password", { token, newPassword }),
  },

  chat: {
    createThread: (participantId, jobId) =>
      api.post("/chat/threads", { participantId, jobId }),
    listThreads: () => api.get("/chat/threads"),
    listMessages: (threadId) => api.get(`/chat/threads/${threadId}/messages`),
    sendMessage: (threadId, content) =>
      api.post(`/chat/threads/${threadId}/messages`, { content }),
    markRead: (threadId) => api.patch(`/chat/threads/${threadId}/read`),
  },

  users: {
    me: () => api.get("/users/me"),
    updateMe: (data) => api.patch("/users/me", data),
    updateSkills: (skills) => api.patch("/users/me/skills", { skills }),
    uploadCv: (file) => {
      const form = new FormData();
      form.append("file", file);
      return api.post("/users/me/cv", form);
    },
    list: () => api.get("/users"),
    get: (id) => api.get(`/users/${id}`),
  },

  jobs: {
    list: (params = {}) => {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v != null && v !== "")
      ).toString();
      return api.get(`/jobs${qs ? `?${qs}` : ""}`);
    },
    get: (id) => api.get(`/jobs/${id}`),
    create: (data) => api.post("/jobs", data),
    update: (id, data) => api.patch(`/jobs/${id}`, data),
    delete: (id) => api.delete(`/jobs/${id}`),
    matches: (id) => api.get(`/jobs/${id}/matches`),
  },

  applications: {
    apply: (jobId, coverLetter) =>
      api.post("/applications", { jobId, coverLetter }),
    mine: () => api.get("/applications/me"),
    forJob: (jobId) => api.get(`/applications/job/${jobId}`),
    updateStatus: (id, status, interviewMessage) =>
      api.patch(`/applications/${id}/status`, { status, interviewMessage }),
  },

  employer: {
    analytics: () => api.get("/employer/analytics"),
  },

  admin: {
    analytics: () => api.get("/admin/analytics"),
    auditLogs: () => api.get("/admin/audit-logs"),
    aiConfig: () => api.get("/admin/ai-config"),
    updateAiConfig: (data) => api.patch("/admin/ai-config", data),
    aiHealth: () => api.get("/admin/ai-config/health"),
    approveUser: (id) => api.patch(`/admin/users/${id}/approve`),
    unapproveUser: (id) => api.patch(`/admin/users/${id}/unapprove`),
    blockUser: (id) => api.patch(`/admin/users/${id}/block`),
    unblockUser: (id) => api.patch(`/admin/users/${id}/unblock`),
    moderateJob: (id, status, reason) =>
      api.patch(`/admin/jobs/${id}/moderate`, { status, reason }),
  },

  training: {
    list: (skill) =>
      api.get(`/training${skill ? `?skill=${encodeURIComponent(skill)}` : ""}`),
    adminList: (skill) =>
      api.get(
        `/training/admin${skill ? `?skill=${encodeURIComponent(skill)}` : ""}`
      ),
    create: (data) => api.post("/training", data),
    update: (id, data) => api.patch(`/training/${id}`, data),
    delete: (id) => api.delete(`/training/${id}`),
    personalized: (jobId) => api.get(`/training/recommendations/${jobId}`),
  },

  ai: {
    matchScore: (jobId) => api.get(`/ai/match-score/${jobId}`),
    resumeParse: (payload) => api.post("/ai/resume-parse", payload),
    skillsGap: (candidateSkills, requiredSkills) =>
      api.post("/ai/skills-gap", { candidateSkills, requiredSkills }),
    trainingRecommendations: (missingSkills) =>
      api.post("/ai/training-recommendations", { missingSkills }),
    coachMessages: () => api.get("/ai/coach/messages"),
    clearCoachMessages: () => api.post("/ai/coach/clear", {}),
    chat: (message) => api.post("/ai/chat", { message }),
    learningRoadmap: (goal, currentSkills) =>
      api.post("/ai/learning-roadmap", { goal, currentSkills }),
  },

  notifications: {
    mine: () => api.get("/notifications/me"),
    markRead: (id) => api.patch(`/notifications/${id}/read`),
  },
};

export { ApiError, clearTokens, getTokens, setTokens };
