import {Request, Response} from "express";
import { loginSchema, registerSchema } from "../validations/auth.validation";
import { loginUser, registerUser } from "../services/auth.service";
import { generateRefreshToken, generateToken, verifyRefreshToken, } from "../utils/token";


export const registerController = async (req: Request, res: Response) => {

   try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid register data",
            errors: result.error.issues,
        });
    }
    const user = await registerUser(result.data);
 
    return res.status(201).json({
     success: true,
     message: "User registered successfully",
     data: user,
    });

   }catch (error) {
        console.error(error);

        if(error instanceof Error && error.message === "User with this email already exists") {
            return res.status(409).json({
                success: false,
                message: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to register user",
        });
   }
};

export const loginController = async (req: Request, res: Response) => {
    try {
        const result = loginSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false, 
                message: "Invalid login data",
                errors: result.error.issues,
            });
        }

        const user = await loginUser(result.data);

        const accessToken = generateToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id, user.role);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: {
                user,
                accessToken,
            },
        });
    } catch (error) {
        console.error(error);
        if(error instanceof Error && error.message === "Invalid email or password") {
            return res.status(401).json({
                success: false,
                message: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to login user",
        });
    }
};

export const refreshTokenController = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token not found",
            });
        }

        const decoded = verifyRefreshToken(refreshToken);
        
        if (!decoded || typeof decoded === "string") {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token",
            });
        }

        const accessToken = generateToken(decoded.userId as number, decoded.role as string);
        return res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
            data: {
                accessToken,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(401).json({
            success: false,
            message: "Invalid refresh token",
        });
    }
};   