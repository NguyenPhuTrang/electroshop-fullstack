import api from "@/src/lib/axios";
import type {
    Product,
    ProductStatus,
    ProductWithVariantSummary,
} from "../types/product";

export type ProductSort =
    | "price_asc"
    | "price_desc"
    | "newest";

export type GetProductsParams = {
    search?: string;
    categoryId?: number;
    brandId?: number;
    minPrice?: number;
    maxPrice?: number;
    sort?: ProductSort;
    page?: number;
    limit?: number;
};

export type GetAdminProductsParams =
    GetProductsParams & {
        lowStock?: boolean;
    };

export type GetProductResponse = {
    products: ProductWithVariantSummary[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

type ApiResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
};

export type CreateProductInput = {
    name: string;
    slug: string;
    description?: string;
    categoryId: number;
    brandId: number;
};

export type UpdateProductInput = {
    name?: string;
    slug?: string;
    description?: string;
    categoryId?: number;
    brandId?: number;
    status?: ProductStatus;
};

export async function getProducts(
    params?: GetProductsParams
): Promise<GetProductResponse> {
    const response = await api.get<
        ApiResponse<GetProductResponse>
    >("/products", { params });

    return response.data.data;
}

export async function getAdminProducts(
    params?: GetAdminProductsParams
): Promise<GetProductResponse> {
    const response = await api.get<
        ApiResponse<GetProductResponse>
    >("/admin/products", { params });

    return response.data.data;
}

export async function getProductBySlug(
    slug: string
): Promise<ProductWithVariantSummary> {
    const response = await api.get<
        ApiResponse<ProductWithVariantSummary>
    >(`/products/slug/${encodeURIComponent(slug)}`);

    return response.data.data;
}

export async function getProductById(
    id: number
): Promise<ProductWithVariantSummary> {
    const response = await api.get<
        ApiResponse<ProductWithVariantSummary>
    >(`/products/${id}`);

    return response.data.data;
}

export async function createProduct(
    data: CreateProductInput
): Promise<ProductWithVariantSummary> {
    const response = await api.post<
        ApiResponse<ProductWithVariantSummary>
    >("/products", data);

    return response.data.data;
}

export async function getAdminProductById(
    id: number
): Promise<ProductWithVariantSummary> {
    const response = await api.get<
        ApiResponse<ProductWithVariantSummary>
    >(`/admin/products/${id}`);

    return response.data.data;
}

export async function updateProduct(
    id: number,
    data: UpdateProductInput
): Promise<ProductWithVariantSummary> {
    const response = await api.put<
        ApiResponse<ProductWithVariantSummary>
    >(`/products/${id}`, data);

    return response.data.data;
}

export async function deleteProduct(
    id: number
): Promise<Product> {
    const response = await api.delete<ApiResponse<Product>>(
        `/products/${id}`
    );

    return response.data.data;
}