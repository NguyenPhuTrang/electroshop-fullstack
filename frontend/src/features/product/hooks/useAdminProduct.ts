"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getAdminProductById } from "../services/product.service";

import type {
    ProductWithVariantSummary,
} from "../types/product";

export function useAdminProduct(id: number) {
    const isValidId = Number.isInteger(id) && id > 0;

    const [product, setProduct] =
        useState<ProductWithVariantSummary | null>(null);

    const [loading, setLoading] = useState(isValidId);
    const [error, setError] = useState("");

    // Dùng để nhận biết request mới nhất, tránh response cũ ghi đè dữ liệu mới.
    const requestIdRef = useRef(0);

    const fetchProduct = useCallback(async () => {
        if (!isValidId) {
            setProduct(null);
            setLoading(false);
            setError("Invalid product ID");
            return;
        }

        const requestId = ++requestIdRef.current;

        try {
            setLoading(true);
            setError("");

            const data = await getAdminProductById(id);

            if (requestId !== requestIdRef.current) {
                return;
            }

            setProduct(data);
        } catch (error) {
            if (requestId !== requestIdRef.current) {
                return;
            }

            console.error("Failed to get Product", error);
            setError("Failed to get Product");
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    }, [id, isValidId]);

    // Dùng cho nút "tải lại" (gọi từ sự kiện, không phải từ effect).
    // Hàm được dùng lại khi id không đổi; khi id đổi, fetchProduct được tạo lại.
    const refetch = useCallback(async () => {
        await fetchProduct();
    }, [fetchProduct]);

    // Dùng cho lần tải đầu và khi id đổi.
    useEffect(() => {
        if (!isValidId) {
            requestIdRef.current += 1;
            setProduct(null);
            setLoading(false);
            setError("Invalid product ID");
            return;
        }

        // Không giữ Product cũ khi chuyển sang ID khác.
        setProduct(null);

        void fetchProduct();

        return () => {
            // Hủy hiệu lực của request đang chạy khi id đổi hoặc component unmount.
            requestIdRef.current += 1;
        };
    }, [fetchProduct, isValidId]);

    return {
        product,
        loading: isValidId && loading,
        error: isValidId ? error : "Invalid product ID",
        refetch,
    };
}