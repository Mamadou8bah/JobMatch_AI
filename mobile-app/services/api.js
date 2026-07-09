import Constants from "expo-constants";
import { Platform } from "react-native";
import { clearTokens, getTokens, setTokens } from "./storage.js";
import {
  getCachedApplications,
  getCachedCourses,
  getCachedJobs,
  setCachedApplications,
  setCachedCourses,
  setCachedJobs,
} from "./cache.js";

const PRODUCTION_API = "https://jobmatchgambia.onrender.com/api";
const REQUEST_TIMEOUT_MS = 90000;
const MAX_ATTEMPTS = 2;

function isEmulator() {
  return Constants.isDevice === false;
}

function getDefaultApiBase() {
  if (!__DEV__) {
    return PRODUCTION_API;
  }
  if (isEmulator()) {
    if (Platform.OS === "android") {
      return "http://10.0.2.2:3000/api";
    }
    return "http://localhost:3000/api";
  }
  return PRODUCTION_API;
}

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  getDefaultApiBase();

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }

  get isPremiumRequired() {
    return (
      this.status === 402 ||
      this.data?.error === "PremiumRequired" ||
      /premium|upgrade/i.test(this.message || "")
    );
  }

  get upgradePath() {
    return this.data?.upgradePath || "/billing";
  }
}

async function refreshAccessToken() {
  const { refreshToken } = await getTokens();
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    await clearTokens();
    return null;
  }

  const data = await res.json();
  await setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

async function wakeBackend() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    await fetch(`${API_BASE}/health`, {
      method: "GET",
      signal: controller.signal,
    });
  } catch {
    // Render may be cold-starting; the main request will retry.
  } finally {
    clearTimeout(timer);
  }
}

function isRetryableNetworkError(err) {
  if (err?.name === "AbortError") return true;
  if (err instanceof TypeError) return true;
  return /network|fetch|failed|timeout/i.test(err?.message || "");
}

async function request(path, options = {}) {
  const { accessToken } = await getTokens();
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let lastError;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    if (attempt === 1) {
      await wakeBackend();
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      let res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      if (res.status === 401 && accessToken) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          headers.Authorization = `Bearer ${newToken}`;
          res = await fetch(`${API_BASE}${path}`, { ...options, headers, signal: controller.signal });
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

      await cacheResponse(path, data);
      return data;
    } catch (err) {
      lastError = err;
      if (attempt < MAX_ATTEMPTS - 1 && isRetryableNetworkError(err)) {
        continue;
      }

      const cached = await getOfflineFallback(path);
      if (cached != null) return cached;

      if (err.name === "AbortError" || isRetryableNetworkError(err)) {
        throw new ApiError(
          "Having trouble reaching the server. Pull down to refresh in a moment.",
          0,
          null,
        );
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
}

async function getOfflineFallback(path) {
  const [pathname] = path.split("?");
  if (pathname === "/jobs") return getCachedJobs();
  if (pathname === "/applications/me") return getCachedApplications();
  if (pathname === "/training") return getCachedCourses();
  return null;
}

async function cacheResponse(path, data) {
  const [pathname] = path.split("?");
  if (pathname === "/jobs" && Array.isArray(data)) await setCachedJobs(data);
  if (pathname === "/applications/me" && Array.isArray(data)) await setCachedApplications(data);
  if (pathname === "/training" && Array.isArray(data)) await setCachedCourses(data);
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
      api.post("/auth/login", { email, password }).then(async (data) => {
        await setTokens(data.accessToken, data.refreshToken);
        return data;
      }),
    register: (payload) =>
      api.post("/auth/register", payload).then(async (data) => {
        await setTokens(data.accessToken, data.refreshToken);
        return data;
      }),
    logout: async () => {
      const { refreshToken } = await getTokens();
      try {
        if (refreshToken) await api.post("/auth/logout", { refreshToken });
      } finally {
        await clearTokens();
      }
    },
    forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
    me: () => api.get("/auth/me"),
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
    uploadAvatar: (file) => {
      const form = new FormData();
      form.append("file", file);
      return api.post("/users/me/avatar", form);
    },
    removeAvatar: () => api.delete("/users/me/avatar"),
  },

  billing: {
    plans: () => api.get("/billing/plans"),
    me: () => api.get("/billing/me"),
    checkout: (data) => api.post("/billing/checkout", data),
    confirm: (paymentIntentId) =>
      api.post("/billing/confirm", { paymentIntentId }),
  },

  jobs: {
    list: (params = {}) => {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v != null && v !== "")
      ).toString();
      return api.get(`/jobs${qs ? `?${qs}` : ""}`);
    },
    get: (id) => api.get(`/jobs/${id}`),
    matches: (id) => api.get(`/jobs/${id}/matches`),
  },

  applications: {
    apply: (jobId, coverLetter) =>
      api.post("/applications", { jobId, coverLetter }),
    mine: () => api.get("/applications/me"),
  },

  training: {
    list: () => api.get("/training"),
    personalized: (jobId) => api.get(`/training/recommendations/${jobId}`),
  },

  ai: {
    matchScore: (jobId) => api.get(`/ai/match-score/${jobId}`),
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

  chat: {
    listThreads: () => api.get("/chat/threads"),
    listMessages: (threadId) => api.get(`/chat/threads/${threadId}/messages`),
    sendMessage: (threadId, content) =>
      api.post(`/chat/threads/${threadId}/messages`, { content }),
    markRead: (threadId) => api.patch(`/chat/threads/${threadId}/read`),
    createThread: (participantId, jobId) =>
      api.post("/chat/threads", { participantId, jobId }),
  },
};

export { API_BASE };
