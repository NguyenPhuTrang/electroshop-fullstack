import { z } from "zod";
import { loginSchema, registerSchema } from "../validations/auth.validation";
import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";

export const registerUser = async (
    data: z.infer<typeof registerSchema>
) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });

    if (existingUser) {
        throw new Error("User with this email already exists");
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
        },
    });
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

export const loginUser = async ( 
    data: z.infer<typeof loginSchema>
) => {
    const user = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

