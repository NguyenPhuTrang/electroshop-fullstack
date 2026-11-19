
import api from "@/src/lib/axios";

type RegisterData = {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
};

type LoginData = {
  email: string;
  password: string;
};

// Register
export const register = async (data: RegisterData) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

// Login with Email / Password
export const login = async (data: LoginData) => {
  const response = await api.post("/auth/login", data, {
    withCredentials: true,
  });

  return response.data;
};

// Login with Google
export const googleLogin = async (idToken: string) => {
  const response = await api.post(
    "/auth/google",
    { idToken },
    { withCredentials: true }
  );

  return response.data;
};

// Logout
export const logout = async () => {
  const response = await api.post(
    "/auth/logout",
    {},
    { withCredentials: true }
  );

  return response.data;
};
