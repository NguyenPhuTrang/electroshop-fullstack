"use client";

import { useEffect, useState } from "react";

import type { ProductImage } from "../types/product";
import { getProductImages } from "../services/product-image.service";

export const useProductImages = (
    productId: number,
    _colorId?: number | null
) => {
    const [images, setImages] = useState<ProductImage[]>([]);
    const [loading, setLoading] = useState(
        Number.isInteger(productId) && productId > 0
    );
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const fetchImages = async () => {
            if (!Number.isInteger(productId) || productId <= 0) {
                setImages([]);
                setLoading(false);
                setError("Invalid product ID");
                return;
            }

            setImages([]);
            setLoading(true);
            setError(null);

            try {
            
                const data = await getProductImages(productId);

                if (active) {
                    setImages(data);
                }
            } catch (err) {
                if (active) {
                    setImages([]);
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load product images"
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void fetchImages();

        return () => {
            active = false;
        };
    }, [productId]);

    return {
        images,
        loading,
        error,
    };
};