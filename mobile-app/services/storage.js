import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  demoSession: "demoSession",
  demoRole: "demoRole",
  demoEmail: "demoEmail",
  demoStore: "demoStore_job_seeker",
};

export async function getItem(key) {
  return AsyncStorage.getItem(key);
}

export async function setItem(key, value) {
  await AsyncStorage.setItem(key, value);
}

export async function removeItem(key) {
  await AsyncStorage.removeItem(key);
}

export async function getTokens() {
  const [accessToken, refreshToken] = await Promise.all([
    getItem(KEYS.accessToken),
    getItem(KEYS.refreshToken),
  ]);
  return { accessToken, refreshToken };
}

export async function setTokens(accessToken, refreshToken) {
  if (accessToken) await setItem(KEYS.accessToken, accessToken);
  if (refreshToken) await setItem(KEYS.refreshToken, refreshToken);
}

export async function clearTokens() {
  await Promise.all([removeItem(KEYS.accessToken), removeItem(KEYS.refreshToken)]);
}

export { KEYS };
