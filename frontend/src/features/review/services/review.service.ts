import api from "@/src/lib/axios";
import { Review } from "../types/review";

export async function getReviewsByProductId(
    productId: number,
): Promise<Review[]> {
    const response = await api.get(`/${productId}/reviews`);

    return response.data.data;
}