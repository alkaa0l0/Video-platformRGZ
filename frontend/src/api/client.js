import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "";

export const api = axios.create({ baseURL });

const TOKEN_KEY = "yadro_tokens";

export function getTokens() {
  try {
    return JSON.parse(localStorage.getItem(TOKEN_KEY) || "null");
  } catch {
    return null;
  }
}

export function setTokens(tokens) {
  if (tokens) localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  else localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const tokens = getTokens();
  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  return config;
});

// Простой refresh-flow: при 401 пробуем обновить access по refresh
let refreshing = null;

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    const tokens = getTokens();
    if (
      error.response?.status === 401 &&
      tokens?.refresh &&
      !original._retry
    ) {
      original._retry = true;
      try {
        if (!refreshing) {
          refreshing = axios.post(`${baseURL}/api/auth/refresh/`, {
            refresh: tokens.refresh,
          });
        }
        const { data } = await refreshing;
        refreshing = null;
        setTokens({ ...tokens, access: data.access });
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch (e) {
        refreshing = null;
        setTokens(null);
      }
    }
    return Promise.reject(error);
  }
);
