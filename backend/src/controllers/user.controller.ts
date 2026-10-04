
import { Request, Response, NextFunction } from "express";

import {
  changeMyPassword,
  getAdminUserById,
  getAllUsers,
  getMyProfile,
  updateMyProfile,
  updateUserStatus,
} from "../services/user.service";

import {
  changePasswordSchema,
  updateProfileSchema,
  uploadAvatarUrlSchema,
} from "../validations/user.validation";

import { uploadImage, uploadImageFromUrl } from "../services/upload.service";
import { prisma } from "../config/prisma";
import { UserRole, UserStatus } from "../generated/prisma/enums";
import { success } from "zod";

// GET /api/users/me
export const getMyProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;

    const user = await getMyProfile(userId);

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/me
export const updateMyProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;

    const validation = updateProfileSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile data",
        errors: validation.error.issues,
      });
    }

    const user = await updateMyProfile(
      userId,
      validation.data
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/me/password
export const changeMyPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;

    const validation = changePasswordSchema.safeParse(
      req.body
    );

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid password data",
        errors: validation.error.issues,
      });
    }

    const result = await changeMyPassword(
      userId,
      validation.data.currentPassword,
      validation.data.newPassword
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/me/avatar
export const uploadAvatarController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;

    let avatarUrl: string;

    // Trường hợp 1: upload file
    if (req.file) {
      const result = await uploadImage(
        req.file.buffer,
        "electroshop/avatars"
      );

      avatarUrl = result.secure_url;
    } 
    // Trường hợp 2: upload bằng URL
    else {
      const validation = uploadAvatarUrlSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid avatar URL",
          errors: validation.error.issues,
        });
      }

      const result = await uploadImageFromUrl(
        validation.data.imageUrl,
        "electroshop/avatars"
      );

      avatarUrl = result.secure_url;
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatarUrl,
      },
          select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
    });

    return res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = req.query.page === undefined ? 1 : Number(req.query.page); // dùng toán tử ternary ? : để kiểm tra page có được truyền từ URL hay không. page không có thì lấy 1, nếu có thì lấy giá trị page và chuyển thành số.

    const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);

    const role = req.query.role === undefined ? undefined : String(req.query.role).toUpperCase(); // toUpperCase(); chuyển string thành chữ in hoa

    const status = req.query.status === undefined ? undefined : String(req.query.status).toUpperCase();

    const search = req.query.search === undefined ? undefined : String(req.query.search).trim();

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page <= 0 ||
      limit <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    const result = await getAllUsers(
      page,
      limit,
      role as UserRole | undefined,
      status as UserStatus | undefined,
      search
    );

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUserByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
  try{
    const userId = Number(req.params.id);

    if(!Number.isInteger(userId) || userId <= 0){
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    };

    const user = await getAdminUserById(userId);

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  }catch(error){
    next(error)
  }
};

export const updateUserStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const userId = Number(req.params.id);

    if(!Number.isInteger(userId) || userId <= 0)
    {
      res.status(400).json({
        success: false,
        message: "Invalid user ID",
      })
    }

    const status = String(req.body.status).toUpperCase();

    if(
       status !== "ACTIVE" &&
      status !== "INACTIVE" &&
      status !== "BANNED"
    ) {
      return res.status(400).json({
         success: false,
         message: "Invalid user status",
      })
    }

    const user = await updateUserStatus(
      userId,
      status as UserStatus
    );

    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: user,
    });

  }catch(error){
    next(error)
  }
}