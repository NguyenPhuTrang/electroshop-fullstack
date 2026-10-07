import api from "@/src/lib/axios";
import { Review } from "../types/review";

export async function getReviewsByProductId(
    productId: number,
): Promise<Review[]> {
    const response = await api.get(`/${productId}/reviews`);

    return response.data.data;
}

export type AdminReviewParams = {
    page?: number,
    limit?: number,
    search?: string,
    rating?: number
};

export type AdminReviewResponse = {
    reviews: Review[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

export async function getAdminReviews(
    params?: AdminReviewParams
): Promise<AdminReviewResponse> {

    const response = await api.get("/admin/reviews", {params});

    return{
        reviews: response.data.data,
        pagination: response.data.pagination,
    }
};

export async function adminDeleteReview(
    reviewId: number
): Promise<void> {
    await api.delete(`/admin/reviews/${reviewId}`);
};

export async function createReviewReply(
    reviewId: number,
    comment: string
) {
    const response = await api.post(
        `/admin/reviews/${reviewId}/reply`,
        {
            comment,
        }
    );

    return response.data.data;
};

export async function updateReviewReply(
    reviewId: number,
    comment: string
) {
    const response = await api.patch(
        `/admin/reviews/${reviewId}/reply`,
        {
            comment,
        }
    );

    return response.data.data;
};