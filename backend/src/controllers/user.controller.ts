
import { Request, Response, NextFunction } from "express";

import {
  changeMyPassword,
  getMyProfile,
  updateMyProfile,
} from "../services/user.service";

import {
  changePasswordSchema,
  updateProfileSchema,
  uploadAvatarUrlSchema,
} from "../validations/user.validation";

import { uploadImage, uploadImageFromUrl } from "../services/upload.service";
import { prisma } from "../config/prisma";

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

