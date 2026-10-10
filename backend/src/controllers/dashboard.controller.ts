import { NextFunction, Request, Response } from "express";
import {
  DashboardRange,
  getAdminDashboard,
} from "../services/dashboard.service";

export const getAdminDashboardController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const range = req.query.range ? Number(req.query.range) : 7;

    if (
      range !== 7 &&
      range !== 30 &&
      range !== 90
    ) {
      return res.status(400).json({
        success: false,
        message: "Range must be 7, 30, or 90",
      });
    }

    const result = await getAdminDashboard(
      range as DashboardRange
    );

    return res.status(200).json({
      success: true,
      message: "Admin dashboard retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};