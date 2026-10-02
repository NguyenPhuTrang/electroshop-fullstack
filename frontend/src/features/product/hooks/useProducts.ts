"use client"

import { useCallback, useEffect, useState } from "react";
import { getProducts, GetProductsParams } from "../services/product.service";
import { Product } from "../types/product";

export function useProducts(params: GetProductsParams) {

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

    const [products, setProducts] = useState<Product[]>([]);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    const fetchProducts = useCallback(async () => {
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

            setProducts(data.products);
            setPagination(data.pagination);
        } catch (error) {
            console.error("Failed to get products", error);
            setError("Failed to load products");
        } finally {
            setLoading(false);
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
    fetchProducts();
  }, 500);

  return () => {
    clearTimeout(timer);
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