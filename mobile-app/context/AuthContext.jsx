import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../services/api.js";
import { clearTokens, getTokens, removeItem } from "../services/storage.js";

const AuthContext = createContext(null);

async function clearLegacyDemoStorage() {
  await Promise.all([
    removeItem("demoSession"),
    removeItem("demoRole"),
    removeItem("demoEmail"),
    removeItem("demoStore_job_seeker"),
  ]);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const { accessToken } = await getTokens();
    if (!accessToken) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const me = await api.auth.me();
      if (me.role !== "job_seeker") {
        await api.auth.logout();
        setUser(null);
        return null;
      }
      setUser(me);
      return me;
    } catch {
      await clearTokens();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearLegacyDemoStorage().then(loadUser);
  }, [loadUser]);

  const login = async (email, password) => {
    const data = await api.auth.login(email, password);
    if (data.user.role !== "job_seeker") {
      await api.auth.logout();
      throw new Error("This app is for job seekers only.");
    }
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await api.auth.register({ ...payload, role: "job_seeker" });
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    const me = await api.auth.me();
    setUser(me);
    return me;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
