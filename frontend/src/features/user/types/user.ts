export type User = {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfileData = {
  name?: string;
  email?: string;
};

export type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
};

export type AdminUserParams = {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
};

export type AdminUsersResponse = {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};