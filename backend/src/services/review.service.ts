import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";

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
        status: {
          in: [
            "CONFIRMED",
            "PROCESSING",
            "SHIPPED",
            "DELIVERED",
          ],
        },
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
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const updateReview = async (
  userId: number,
  reviewId: number,
  rating?: number,
  comment?: string
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
      "You can only update your own review",
      403
    );
  }

  return prisma.review.update({
    where: {
      id: reviewId,
    },
    data: {
      ...(rating !== undefined && { rating }),
      ...(comment !== undefined && { comment }),
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