"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
    getProducts,
} from "../services/product.service";

import type {
    GetProductsParams,
} from "../services/product.service";

import type {
    ProductWithVariantSummary,
} from "../types/product";

export function useProducts(
    params: GetProductsParams = {}
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

            const data = await getProducts({
                search,
                sort,
                categoryId,
                brandId,
                minPrice,
                maxPrice,
                page,
                limit,
            });

            if (requestId !== requestIdRef.current) {
                return;
            }

            setProducts(data.products);
            setPagination(data.pagination);
        } catch (error) {

            if (requestId !== requestIdRef.current) {
                return;
            }

            console.error("Failed to get products:", error);

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
    ]);

    useEffect(() => {

        const timer = setTimeout(() => { // debounce đang áp dụng cho tất cả các param nằm trong dependency của useEffect
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