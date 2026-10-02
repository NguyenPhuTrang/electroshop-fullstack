"use client";

import { useCallback, useEffect, useState } from "react";
import { Product } from "../types/product";
import { getAdminProductById } from "../services/product.service";

export function useAdminProduct(id: number) {
    const isValidId = Number.isInteger(id) && id > 0;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(isValidId);
    const [error, setError] = useState("");

    // Dùng cho nút "tải lại" (gọi từ sự kiện, không phải từ effect)  
    const refetch = useCallback(async () => { // là dùng lại hàm khi không thay đổi Id còn nếu thay đổi id thì tạo hàm mới
        try {
            setLoading(true);
            setError("");

            const data = await getAdminProductById(id);
            setProduct(data);
        } catch (error) {
            console.error("Failed to get Product", error);
            setError("Failed to get Product");
        } finally {
            setLoading(false);
        }
    }, [id]);

    // Dùng cho lần tải đầu và khi id đổi
    useEffect(() => {
        if (!isValidId) return;

        let cancelled = false;

        const load = async () => {
            try {
                const data = await getAdminProductById(id);
                if (!cancelled) {
                    setProduct(data);
                    setError("");
                }
            } catch (error) {
                console.error("Failed to get Product", error);
                if (!cancelled) {
                    setError("Failed to get Product");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [id, isValidId]);

    return {
        product,
        loading: isValidId && loading,
        error: isValidId ? error : "Invalid product ID",
        refetch,
    };
}