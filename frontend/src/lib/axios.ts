
import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "@/src/features/auth/services/auth-token";

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const backendUrl = (
  process.env.BACKEND_URL || "http://localhost:5000"
).replace(/\/$/, "");

const apiBaseURL =
  typeof window === "undefined"
    ? `${backendUrl}/api`
    : "/api";

const refreshTokenURL = `${apiBaseURL}/auth/refresh-token`;

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
});

// Dùng riêng Axios instance để refresh, tránh interceptor lặp.
const refreshClient = axios.create({
  withCredentials: true,
});

// Request Interceptor
api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Quản lý các request refresh đồng thời.
let refreshPromise: Promise<string> | null = null;

// Response Interceptor
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Không refresh nếu chính request refresh thất bại.
    if (originalRequest.url?.includes("/auth/refresh-token")) {
      clearAccessToken();
      return Promise.reject(error);
    }

    // Không retry request quá một lần.
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshClient
          .post(refreshTokenURL, {})
          .then((response) => {
            const newAccessToken =
              response.data.data.accessToken;

            setAccessToken(newAccessToken);

            return newAccessToken;
          })
          .catch((refreshError) => {
            clearAccessToken();
            throw refreshError;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearAccessToken();
      return Promise.reject(refreshError);
    }
  }
);

export default api;
