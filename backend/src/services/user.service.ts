import { prisma } from "../config/prisma"
import { AppError } from "../utils/AppError";
import bcrypt from "bcryptjs";

export const getMyProfile = async (userId: number) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true
        },
    });

    if(!user){
        throw new AppError("User not found", 404);
    }

    return user;
};

export const updateMyProfile = async (
    userId: number,
    data: {
        name?: string,
        email?: string
    }
) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    if(!existingUser){
        throw new AppError("User not found", 404);
    }

    if(data.email) {
        const existingEmail = await prisma.user.findFirst({
            where: {
                email: data.email,
                id: {
                    not: userId,
                },
            },
        });

        if(existingEmail) {
            throw new AppError("Email alrealy exists", 409)
        }
    }

    return prisma.user.update({
        where: {
            id: userId, // tìm record id bằng đúng giá trị của biến userId
        },
        data: {
            ...(data.name !== undefined &&{
                name: data.name,
            }),
            ...(data.email !==undefined &&{
                email: data.email
            }),
        },
        select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        },
    });
};

export const changeMyPassword = async (
  userId: number,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      password: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!isPasswordValid) {
    throw new AppError("Current password is incorrect", 400);
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    10
  );

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: "Password changed successfully",
  };
};