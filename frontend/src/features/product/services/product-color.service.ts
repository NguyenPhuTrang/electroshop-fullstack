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