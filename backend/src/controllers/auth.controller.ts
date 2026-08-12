import {Request, Response} from "express";
import { loginSchema, registerSchema } from "../validations/auth.validation";
import { loginUser, registerUser } from "../services/auth.service";
import jwt from "jsonwebtoken";


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

export const loginController = async (
    req: Request,
    res: Response
) => {
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

        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET as string, {
            expiresIn: "15m",
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, 
        });

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: user,
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
        
