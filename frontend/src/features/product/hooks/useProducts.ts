"use client"

import { useEffect, useState } from "react";
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

    useEffect(() => {
        const timer = setTimeout(async () => { // debounce đang áp dụng cho tất cả các param nằm trong dependency của useEffect
            try{
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
            }catch(error){
                console.error("Failed to get products", error);
                setError("Faile to load products");
            }finally{
                setLoading(false)
            }
        }, 500);

        return () => {
            clearTimeout(timer);
        };

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

   return {
    products,
    pagination,
    loading,
    error,
  };
}