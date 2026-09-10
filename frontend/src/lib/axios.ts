import axios from "axios";
import { getAccessToken, setAccessToken } from "@/src/features/auth/services/auth-token";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; 

      try {
        const res = await axios.post(
       "http://localhost:5000/api/auth/refresh-token", 
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.accessToken;
        setAccessToken(newAccessToken); 

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest); 
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;