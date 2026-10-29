
import api from "@/src/lib/axios";
import type { ProductColor } from "@/src/features/product/types/product";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type CreateProductColorInput = {
  name: string;
  hexCode: string;
  sortOrder?: number;
};

export type UpdateProductColorInput = {
  name?: string;
  hexCode?: string;
  sortOrder?: number;
};

export async function getProductColors(
  productId: number
): Promise<ProductColor[]> {
  const response = await api.get<ApiResponse<ProductColor[]>>(
    `/products/${productId}/colors`
  );

  return response.data.data;
}

export async function createProductColor(
  productId: number,
  data: CreateProductColorInput
): Promise<ProductColor> {
  const response = await api.post<ApiResponse<ProductColor>>(
    `/products/${productId}/colors`,
    data
  );

  return response.data.data;
}

export async function updateProductColor(
  productId: number,
  colorId: number,
  data: UpdateProductColorInput
): Promise<ProductColor> {
  const response = await api.patch<ApiResponse<ProductColor>>(
    `/products/${productId}/colors/${colorId}`,
    data
  );

  return response.data.data;
}

export async function deleteProductColor(
  productId: number,
  colorId: number
): Promise<void> {
  await api.delete(`/products/${productId}/colors/${colorId}`);
}
