import api from "@/src/lib/axios";

import type { ProductImage } from "../types/product";

type ApiResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
};

export type CreateProductImageInput = {
    url: string;
    alt?: string;
    colorId?: number | null;
    isPrimary?: boolean;
    sortOrder?: number;
};

export type UpdateProductImageInput = {
    url?: string;
    alt?: string;
    colorId?: number | null;
    isPrimary?: boolean;
    sortOrder?: number;
};

export async function getProductImages(
    productId: number,
    colorId?: number
): Promise<ProductImage[]> {
    const response = await api.get<ApiResponse<ProductImage[]>>(
        `/products/${productId}/images`,
        {
            params:
                colorId !== undefined
                    ? { colorId }
                    : undefined,
        }
    );

    return response.data.data;
}

export async function createProductImage(
    productId: number,
    data: CreateProductImageInput
): Promise<ProductImage> {
    const response = await api.post<ApiResponse<ProductImage>>(
        `/products/${productId}/images`,
        data
    );

    return response.data.data;
}

export async function getProductImageById(
    id: number
): Promise<ProductImage> {
    const response = await api.get<ApiResponse<ProductImage>>(
        `/products/images/${id}`
    );

    return response.data.data;
}

export async function updateProductImage(
    id: number,
    data: UpdateProductImageInput
): Promise<ProductImage> {
    const response = await api.patch<ApiResponse<ProductImage>>(
        `/products/images/${id}`,
        data
    );

    return response.data.data;
}

export async function deleteProductImage(
    id: number
): Promise<ProductImage> {
    const response = await api.delete<ApiResponse<ProductImage>>(
        `/products/images/${id}`
    );

    return response.data.data;
}