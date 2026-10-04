import { prisma } from "../config/prisma"
import { UserRole , UserStatus } from "../generated/prisma/enums";
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
            avatarUrl: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
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

export const getAllUsers = async (
    page: number,
    limit: number,
    role?: UserRole,
    status?:UserStatus,
    search?: string
) => {
    const skip = (page - 1) * limit;

    const where = { //Conditional Object Spread
        ...(role && { //nếu có role thì tạo ra object role Sau đó ... lấy property role của object đó và đưa vào where
            role, //có role → tạo object { role }; không có role → không tạo object đó để đưa vào where.
        }),

        ...(status && { // Còn ... chỉ làm nhiệm vụ: Lấy property bên trong object và đưa nó vào object đang tạo. 
            status,
        }),

        ...(search && {
            OR: [
                {
                    name: {
                        contains: search,
                        mode: "insensitive" as const,
                    },

                },

                {
                    email: {
                        contains: search,
                        mode: "insensitive" as const,
                    },
                    },
            ],
        }),
    };

    const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
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
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.user.count({
      where,
    }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

 export const getAdminUserById = async(
        userId: number
    ) => {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true
            },
        });

        if(!user) {
            throw new AppError("User not found", 404);
        }

        return user;
    };

export const updateUserStatus = async(
    userId: number,
    status: UserStatus
) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    if(!user) {
        throw new AppError("User not found", 404);
    }

    return prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            status,
        },
        select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true
        },
    });
};
