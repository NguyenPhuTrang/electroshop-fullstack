import api from "@/src/lib/axios";

import type {
    ProductVariant,
    ProductVariantStatus,
} from "../types/product";

type ApiResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
};

export type EditableProductVariantStatus = Exclude<
    ProductVariantStatus,
    "OUT_OF_STOCK"
>;

export type CreateProductVariantInput = {
    storage?: string | null;
    colorId?: number | null;
    price: number;
    salePrice?: number | null;
    stock?: number;
    status?: EditableProductVariantStatus;
};

export type UpdateProductVariantInput = {
    storage?: string | null;
    colorId?: number | null;
    price?: number;
    salePrice?: number | null;
    stock?: number;
    status?: EditableProductVariantStatus;
};

export async function getProductVariants(
    productId: number
): Promise<ProductVariant[]> {
    const response = await api.get<ApiResponse<ProductVariant[]>>(
        `/products/${productId}/variants`
    );

    return response.data.data;
}

export async function getAdminProductVariants(
    productId: number
): Promise<ProductVariant[]> {
    const response = await api.get<ApiResponse<ProductVariant[]>>(
        `/products/${productId}/variants/admin`
    );

    return response.data.data;
}

export async function getProductVariantById(
    id: number
): Promise<ProductVariant> {
    const response = await api.get<ApiResponse<ProductVariant>>(
        `/product-variants/${id}`
    );

    return response.data.data;
}

export async function createProductVariant(
    productId: number,
    data: CreateProductVariantInput
): Promise<ProductVariant> {
    const response = await api.post<ApiResponse<ProductVariant>>(
        `/products/${productId}/variants`,
        data
    );

    return response.data.data;
}

export async function createProductVariants(
    productId: number,
    variants: CreateProductVariantInput[]
): Promise<ProductVariant[]> {
    const response = await api.post<ApiResponse<ProductVariant[]>>(
        `/products/${productId}/variants/bulk`,
        { variants }
    );
    return response.data.data;
}

export async function updateProductVariant(
    id: number,
    data: UpdateProductVariantInput
): Promise<ProductVariant> {
    const response = await api.patch<ApiResponse<ProductVariant>>(
        `/product-variants/${id}`,
        data
    );

    return response.data.data;
}

export async function deactivateProductVariant(
    id: number
): Promise<ProductVariant> {
    const response = await api.patch<ApiResponse<ProductVariant>>(
        `/product-variants/${id}/deactivate`
    );

    return response.data.data;
}