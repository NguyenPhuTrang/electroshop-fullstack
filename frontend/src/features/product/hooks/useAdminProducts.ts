"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
    getAdminProducts,
} from "../services/product.service";

import type {
    GetAdminProductsParams,
} from "../services/product.service";

import type {
    ProductWithVariantSummary,
} from "../types/product";

export function useAdminProducts(
    params: GetAdminProductsParams = {}
) {
    const {
        search,
        sort,
        categoryId,
        brandId,
        minPrice,
        maxPrice,
        page,
        limit,
        lowStock,
    } = params;

    const [products, setProducts] = useState<
        ProductWithVariantSummary[]
    >([]);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const requestIdRef = useRef(0);

    const fetchProducts = useCallback(async () => {
        const requestId = ++requestIdRef.current;

        try {
            setLoading(true);
            setError("");

            const data = await getAdminProducts({
                search,
                sort,
                categoryId,
                brandId,
                minPrice,
                maxPrice,
                page,
                limit,
                lowStock,
            });

            // Ignore responses from outdated requests.
            if (requestId !== requestIdRef.current) {
                return;
            }

            setProducts(data.products);
            setPagination(data.pagination);
        } catch (error) {
            if (requestId !== requestIdRef.current) {
                return;
            }

            console.error(
                "Failed to get admin products:",
                error
            );

            setError("Failed to load products");
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    }, [
        search,
        sort,
        categoryId,
        brandId,
        minPrice,
        maxPrice,
        page,
        limit,
        lowStock,
    ]);

    useEffect(() => {
        const timer = setTimeout(() => {
            void fetchProducts();
        }, 500);

        return () => {
            clearTimeout(timer);
            requestIdRef.current += 1;
        };
    }, [fetchProducts]);

    return {
        products,
        pagination,
        loading,
        error,
        refetch: fetchProducts,
    };
}