import api from "@/src/lib/axios";

type RegisterData = {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
};

export const register = async (data: RegisterData) => {
  const response = await api.post("/auth/register", data);

  return response.data;
};

type LoginData = {
  email: string;
  password: string;
};

export const login = async (data: LoginData) => {
  const response = await api.post("/auth/login", data, {
    withCredentials: true,
  });

  return response.data;
};

export const logout = async () => {
  const responce = await api.post("/auth/logout");

  return responce.data;
}