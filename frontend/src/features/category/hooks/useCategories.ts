"use client";

import { useCallback, useEffect, useState } from "react";
import { Category } from "../types/category";
import { getCategories } from "../services/category.service";

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error("Failed to get categories:", error);
            setError("Failed to load categories");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchCategories();
    }, [fetchCategories]);

    return {
        categories,
        loading,
        error,
        refetch: fetchCategories,
    };
}