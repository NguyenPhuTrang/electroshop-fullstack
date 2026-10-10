import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { Prisma } from "../generated/prisma/client";

export const createReview = async (
  userId: number,
  productId: number,
  rating: number,
  comment?: string
) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId,
        order: {
        userId,
        status: "DELIVERED",
      },
    },
  });

  if (!purchased) {
    throw new AppError(
      "You can only review products you have purchased",
      403
    );
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existingReview) {
    throw new AppError(
      "You have already reviewed this product",
      409
    );
  }

  return prisma.review.create({
    data: {
      userId,
      productId,
      rating,
      comment,
    },
  });
};

export const getReviewsByProductId = async (
  productId: number
) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return prisma.review.findMany({
    where: {
      productId,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      reply: {
      select: {
        id: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
        admin: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const deleteReview = async (
  userId: number,
  reviewId: number
) => {
  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  if (review.userId !== userId) {
    throw new AppError(
      "You can only delete your own review",
      403
    );
  }

  return prisma.review.delete({
    where: {
      id: reviewId,
    },
  });
};

export const adminDeleteReview = async (
  reviewId: number
) => {
  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  return prisma.review.delete({
    where: {
      id: reviewId,
    },
  });
};

export type AdminReviewParams = {
  page?: number;
  limit?: number;
  search?: string;
  rating?: number;
  unanswered?: boolean;
};

export const getAdminReviews = async (
  params: AdminReviewParams = {} // object để dưới dạng rỗng nếu không truyền giá trị vào thì sẽ lấy giá trị mặc định bên dưới
) => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const search = params.search?.trim();
  const rating = params.rating;
  const unanswered = params.unanswered ?? false;

  const skip = (page - 1) * limit;

  const where: Prisma.ReviewWhereInput = {
    ...(unanswered
    ? {
        reply: {
          is: null,
        },
      }
    : {}),
    ...(rating // Nếu có rating thì thêm điều kiện rating vào object where; nếu không có thì không thêm gì.
      ? {
          rating,
        }
      : {}),

    ...(search
      ? {
          OR: [
            {
              comment: {
                contains: search, // contains nghĩa là “có chứa”, Giá trị của field đó có chứa chuỗi search hay không. 
                mode: "insensitive", // không phân biệt chữ hoa và chữ thường khi tìm kiếm.
              },
            },
            {
              user: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
            {
              user: {
                email: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
            {
              product: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : {}),
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limit,

      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        updatedAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        reply: {
          select: {
            id: true,
            comment: true,
            createdAt: true,
            updatedAt: true,
            admin: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.review.count({
      where,
    }),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const createReviewReply = async (
  adminId : number,
  reviewId : number,
  comment: string
) => {
  const review = await prisma.review.findUnique({  //tìm đúng 1 giá trị theo điều kiện unique ("độc nhất")
      where:{
        id: reviewId, // Bảng review: tìm theo cột id (khóa chính)
      },
  });

  if(!review) {
    throw new AppError("Review not found", 404);
  }

  const existingReply = await prisma.reviewReply.findUnique({
    where: {
      reviewId // Bảng reviewReply: tìm theo cột reviewId (khóa ngoại, đặt @unique)
    }
  })

  if(existingReply){
    throw new AppError("This review has alrealy been replied to", 409) //Review đã có reply 
  }

  return prisma.reviewReply.create({
    data:{
      reviewId,
      adminId,
      comment,
    },
    select: {
      id: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
      admin: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  })
};

export const updateReviewReply = async (
  adminId: number,
  reviewId: number,
  comment: string
) => {
  const reply = await prisma.reviewReply.findUnique({
    where: {
      reviewId,
    },
  });

  if (!reply) {
    throw new AppError("Review reply not found", 404);
  }

  return prisma.reviewReply.update({
    where: {
      reviewId,
    },
    data: {
      comment,
      adminId,
    },
    select: {
      id: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
      admin: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};