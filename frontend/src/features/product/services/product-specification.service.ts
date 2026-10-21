import api from "@/src/lib/axios";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type ProductSpecification = {
  id: number;
  productId: number;
  groupName: string | null;
  label: string;
  value: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductSpecificationInput = {
  productId: number;
  groupName?: string | null;
  label: string;
  value: string;
  sortOrder?: number;
};

export type UpdateProductSpecificationInput = {
  groupName?: string | null;
  label?: string;
  value?: string;
  sortOrder?: number;
};


export async function getProductSpecifications(
  productId: number
): Promise<ProductSpecification[]> {
  const response = await api.get<
    ApiResponse<ProductSpecification[]>
  >(`/products/${productId}/specifications`);

  return response.data.data;
}

export async function getProductSpecificationById(
  id: number
): Promise<ProductSpecification> {
  const response = await api.get<
    ApiResponse<ProductSpecification>
  >(`/product-specifications/${id}`);

  return response.data.data;
}

export async function createProductSpecification(
  data: CreateProductSpecificationInput
): Promise<ProductSpecification> {
  const response = await api.post<
    ApiResponse<ProductSpecification>
  >("/product-specifications", data);

  return response.data.data;
}

export async function updateProductSpecification(
  id: number,
  data: UpdateProductSpecificationInput
): Promise<ProductSpecification> {
  const response = await api.patch<
    ApiResponse<ProductSpecification>
  >(`/product-specifications/${id}`, data);

  return response.data.data;
}

export async function deleteProductSpecification(
  id: number
): Promise<void> {
  await api.delete(`/product-specifications/${id}`);
}