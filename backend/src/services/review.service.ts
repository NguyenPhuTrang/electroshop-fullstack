import { prisma } from "../config/prisma";

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
    if(!product) {
        throw new Error("Product not found");
    }
    const purchased = await prisma.orderItem.findFirst({
        where: {
            productId,
            order: {
                userId,
                status:{
                    in:[
                        "CONFIRMED",
                        "PROCESSING",
                        "SHIPPED",
                        "DELIVERED",
                    ],
                },
            },
        },
    });

    if(!purchased) {
        throw new Error(
            "You can only review products you have purchased"
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

    if(existingReview) {
        throw new Error(
            "You have alrealy reviewed this product"
        )
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
            id: productId
        },
    });
    if(!product) {
        throw new Error("Product not found");
    }

    return prisma.review.findMany({
        where: {
            productId
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

    if(!review)
    {
        throw new Error("Review not found")
    }
    if(review.userId !== userId)
    {
        throw new Error("You can only update your own review");
    }

    return prisma.review.update({
        where: {
            id: reviewId,
        },
            data: {
                ...(rating !== undefined && {rating}),
                ...(comment !== undefined && {comment}),
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

    if(!review) {
        throw new Error("Review not found");
    }

    if(review.userId !== userId)
    {
        throw new Error("You can only delete your own review");
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
            id: reviewId
        }
    });

    if(!review)
    {
        throw new Error("Review not found");
    }

    return prisma.review.delete({
        where: {
            id: reviewId,
        },
    });
};