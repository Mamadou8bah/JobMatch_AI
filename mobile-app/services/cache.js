import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_KEYS = {
  jobs: "cache_jobs",
  applications: "cache_applications",
  courses: "cache_courses",
  cachedAt: "cache_cachedAt",
};

export async function cacheSet(key, data) {
  await AsyncStorage.setItem(key, JSON.stringify(data));
  await AsyncStorage.setItem(CACHE_KEYS.cachedAt, new Date().toISOString());
}

export async function cacheGet(key) {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function getCachedJobs() {
  return cacheGet(CACHE_KEYS.jobs);
}

export async function setCachedJobs(jobs) {
  return cacheSet(CACHE_KEYS.jobs, jobs);
}

export async function getCachedApplications() {
  return cacheGet(CACHE_KEYS.applications);
}

export async function setCachedApplications(applications) {
  return cacheSet(CACHE_KEYS.applications, applications);
}

export async function getCachedCourses() {
  return cacheGet(CACHE_KEYS.courses);
}

export async function setCachedCourses(courses) {
  return cacheSet(CACHE_KEYS.courses, courses);
}

export { CACHE_KEYS };
