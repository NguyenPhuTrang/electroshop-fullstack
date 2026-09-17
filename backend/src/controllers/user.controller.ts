import { Request, Response, NextFunction } from "express";
import { changeMyPassword, getMyProfile, updateMyProfile } from "../services/user.service";
import { changePasswordSchema, updateProfileSchema } from "../validations/user.validation";
import { success } from "zod";

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

export const UpdateMyProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const userId = req.user!.userId; 
  
    const validation = updateProfileSchema.safeParse(req.body);
  
    if(!validation.success)
    {
      return res.status(400).json({
        success: false,
        message:"Invalid profile data",
        errors: validation.error.issues
      });
    }
  
    const user = await updateMyProfile(
      userId,
      validation.data
    );
  
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user
    })
  }catch(error){
    next(error);
  }
};

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