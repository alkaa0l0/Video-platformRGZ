import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { api, getTokens, setTokens } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    if (!getTokens()?.access) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/api/auth/me/");
      setUser(data);
    } catch {
      setTokens(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = async (email, password) => {
    const { data } = await api.post("/api/auth/login/", { email, password });
    setTokens(data.tokens);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/api/auth/register/", payload);
    setTokens(data.tokens);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    setTokens(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, reload: loadMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
