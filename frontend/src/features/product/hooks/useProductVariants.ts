"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ProductVariant } from "../types/product";
import {
    getProductVariants,
    getAdminProductVariants,
} from "../services/product-variant.service";

type UseProductVariantsOptions = {
    admin?: boolean;
};

export const useProductVariants = (
    productId: number,
    options: UseProductVariantsOptions = {}
) => {
    const admin = options.admin ?? false;

    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [loading, setLoading] = useState(
        Number.isInteger(productId) && productId > 0
    );
    const [error, setError] = useState<string | null>(null);

    const requestIdRef = useRef(0);

    const fetchVariants = useCallback(async () => {
        const requestId = ++requestIdRef.current;

        if (!Number.isInteger(productId) || productId <= 0) {
            setVariants([]);
            setLoading(false);
            setError("Invalid product ID");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = admin
                ? await getAdminProductVariants(productId)
                : await getProductVariants(productId);

            if (requestId !== requestIdRef.current) {
                return;
            }

            setVariants(data);
        } catch (err) {
            if (requestId !== requestIdRef.current) {
                return;
            }

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load product variants"
            );
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    }, [productId, admin]);

    useEffect(() => {
        if (!Number.isInteger(productId) || productId <= 0) {
            requestIdRef.current += 1;
            setVariants([]);
            setLoading(false);
            setError("Invalid product ID");
            return;
        }

        setVariants([]);

        void fetchVariants();

        return () => {
            requestIdRef.current += 1;
        };
    }, [productId, fetchVariants]);

    return {
        variants,
        loading,
        error,
        refetch: fetchVariants,
    };
};