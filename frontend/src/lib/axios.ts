
import axios from "axios";
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "@/src/features/auth/services/auth-token";

const apiBaseURL =
  typeof window === "undefined"
    ? `${(process.env.BACKEND_URL || "http://localhost:5000").replace(/\/$/, "")}/api`
    : "/api";

const refreshTokenURL = `${apiBaseURL}/auth/refresh-token`;

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          refreshTokenURL,
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.data.accessToken;

        setAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch {
        clearAccessToken();

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
