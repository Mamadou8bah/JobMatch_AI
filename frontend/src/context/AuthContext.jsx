import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, clearTokens, getTokens } from "../services/api.js";
import {
  disableDemoSession,
  enableDemoSession,
  getDemoUser,
  isDemoSession,
  matchesDemoAccount,
} from "../services/demoSession.js";

const AuthContext = createContext(null);

const ROLE_ROUTES = {
  job_seeker: "/seeker",
  employer: "/employer",
  admin: "/admin",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (isDemoSession()) {
      const demoUser = getDemoUser();
      setUser(demoUser);
      setLoading(false);
      return demoUser;
    }

    const { accessToken } = getTokens();
    if (!accessToken) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const me = await api.auth.me();
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
    const demoAccount = matchesDemoAccount(email, password);

    if (demoAccount) {
      try {
        const data = await api.auth.login(email, password);
        disableDemoSession();
        setUser(data.user);
        return data.user;
      } catch {
        clearTokens();
        enableDemoSession(demoAccount.email);
        const demoUser = getDemoUser();
        setUser(demoUser);
        return demoUser;
      }
    }

    const data = await api.auth.login(email, password);
    disableDemoSession();
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await api.auth.register(payload);
    disableDemoSession();
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    if (isDemoSession()) {
      disableDemoSession();
      setUser(null);
      return;
    }

    await api.auth.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    if (isDemoSession()) {
      const demoUser = getDemoUser();
      setUser(demoUser);
      return demoUser;
    }

    const me = await api.auth.me();
    setUser(me);
    return me;
  };

  const getDashboardRoute = (role) => ROLE_ROUTES[role] || "/";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        getDashboardRoute,
        isAuthenticated: !!user,
      }}
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
