import { Request, Response, NextFunction } from "express";
import { success } from "zod";
import { AppError } from "../utils/AppError";

export const errorMiddleware = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log(error);

    if(error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message
        });
    }
    
    return res.status(500).json({
        success: false,
        message: error.message || "Internal server error"
    });
};