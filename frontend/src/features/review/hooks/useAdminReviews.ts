"use client";

import { useCallback, useEffect, useState } from "react";

import {
    getAdminReviews,
    type AdminReviewParams,
} from "../services/review.service";

import type { Review } from "../types/review";

export function useAdminReviews(params: AdminReviewParams) {
    const {
        page = 1,
        limit = 10,
        search,
        rating,
        unanswered,
    } = params;

    const [reviews, setReviews] = useState<Review[]>([]);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminReviews({
                page,
                limit,
                search,
                rating,
                unanswered,
            });

            setReviews(data.reviews);
            setPagination(data.pagination);
        } catch (error) {
            console.error(
                "Failed to get admin reviews",
                error
            );

            setError("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    }, [
        page,
        limit,
        search,
        rating,
        unanswered,
    ]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchReviews();
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [fetchReviews]);

    return {
        reviews,
        pagination,
        loading,
        error,
        refetch: fetchReviews,
    };
}