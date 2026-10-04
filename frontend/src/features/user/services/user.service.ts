import api from "@/src/lib/axios";
import { AdminUserParams, AdminUsersResponse, ChangePasswordData, UpdateProfileData, User } from "../types/user";


export const getMyProfile = async (): Promise<User> => {
    const response = await api.get("/users/me");

    return response.data.data;
}

export const updateMyProfile = async (
    data: UpdateProfileData
): Promise<User> => {
    const respone = await api.patch("/users/me", data);

    return respone.data.data
}

export const changeMyPassword = async (
    data: ChangePasswordData
) => {
    const response = await api.patch("/users/me/password", data);

    return response.data.data;
}

export const uploadAvatar = async (source: File | string) => {
  if (source instanceof File) {
    const formData = new FormData();

    formData.append("avatar", source);

    const response = await api.post(
      "/users/me/avatar",
      formData
    );

    return response.data.data;
  }

  const response = await api.post(
    "/users/me/avatar",
    {
      imageUrl: source,
    }
  );

  return response.data.data;
};

export const getAdminUsers = async(
  params?: AdminUserParams
): Promise<AdminUsersResponse> => {

  const response = await api.get("/users/admin",{
    params
  });

  return{
    users: response.data.data,
    pagination: response.data.pagination
  }
}

export const getAdminUserById = async (
  userId : number
): Promise<User> => {
  const response = await api.get(
    `/users/admin/${userId}`
  );

  return response.data.data;

}

export const updateAdminUserStatus = async (
  userId: number,
  status: string
): Promise<User> => {
  const response = await api.patch(`/users/admin/${userId}/status`,{status}); // { status } là object gửi lên backend. ví dụ const status = "BANNED";

  return response.data.data;
}