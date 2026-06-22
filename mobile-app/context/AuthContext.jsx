import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../services/api.js";
import {
  disableDemoSession,
  enableDemoSession,
  getDemoUser,
  isDemoSession,
  matchesDemoAccount,
} from "../services/demoSession.js";
import { clearTokens, getTokens } from "../services/storage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      if (await isDemoSession()) {
        const demoUser = await getDemoUser();
        setUser(demoUser);
        return demoUser;
      }

      const { accessToken } = await getTokens();
      if (!accessToken) {
        setUser(null);
        return null;
      }

      const me = await api.auth.me();
      if (me.role !== "job_seeker") {
        await api.auth.logout();
        await disableDemoSession();
        setUser(null);
        return null;
      }
      setUser(me);
      return me;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const demoAccount = await matchesDemoAccount(email, password);

    if (demoAccount) {
      try {
        const data = await api.auth.login(email, password);
        if (data.user.role !== "job_seeker") {
          throw new Error("This app is for job seekers only.");
        }
        await disableDemoSession();
        setUser(data.user);
        return data.user;
      } catch {
        await clearTokens();
        await enableDemoSession(email);
        const demoUser = await getDemoUser();
        setUser(demoUser);
        return demoUser;
      }
    }

    const data = await api.auth.login(email, password);
    if (data.user.role !== "job_seeker") {
      await api.auth.logout();
      throw new Error("This app is for job seekers only.");
    }
    await disableDemoSession();
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await api.auth.register({ ...payload, role: "job_seeker" });
    await disableDemoSession();
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    if (await isDemoSession()) {
      await disableDemoSession();
      setUser(null);
      return;
    }
    await api.auth.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    if (await isDemoSession()) {
      const demoUser = await getDemoUser();
      setUser(demoUser);
      return demoUser;
    }
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
