import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, clearTokens, getTokens } from "../services/api.js";

const AuthContext = createContext(null);

const ROLE_ROUTES = {
  job_seeker: "/seeker",
  employer: "/employer",
  admin: "/admin",
};

function clearLegacyDemoStorage() {
  ["demoSession", "demoRole", "demoEmail"].forEach((key) => localStorage.removeItem(key));
  Object.keys(localStorage)
    .filter((key) => key.startsWith("demoStore_"))
    .forEach((key) => localStorage.removeItem(key));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
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
      clearTokens();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearLegacyDemoStorage();
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const data = await api.auth.login(email, password);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await api.auth.register(payload);
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
