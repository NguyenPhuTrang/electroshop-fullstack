import api from "@/src/lib/axios";
import type { Product } from "../types/product";

export type ProductSort =
  | "price_asc"
  | "price_desc"
  | "newest";

export type GetProductsParams = {
  search?: string,
  categoryId?: number,
  brandId?: number,
  minPrice?: number,
  maxPrice?: number,
  sort?: ProductSort,
  page?: number,
  limit?: number,
  lowStock?: boolean
};

export type GetProductResponse = {
  products: Product[];
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  };
};

export async function getProducts(
  params?: GetProductsParams
): Promise<GetProductResponse> {
  const response = await api.get("/products", {
    params
  });

  return response.data.data;
};

export async function getAdminProducts(
  params: GetProductsParams
) {
  const response = await api.get("/admin/products", {
    params,
  });

  return response.data.data;
};

export async function getProductBySlug(
  slug: string
): Promise<Product> {
  const response = await api.get(`/products/slug/${slug}`);

  return response.data.data;
};

export type CreateProductInput = {
  name: string;
  slug: string;
  description?: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  categoryId: number;
  brandId: number;
  images: {
    url: string;
    isPrimary: boolean;
  }[];
};

export async function createProduct(
  data: CreateProductInput
): Promise<Product> {
  const response = await api.post("/products", data);

  return response.data.data;
}

export async function getAdminProductById(
  id: number
): Promise<Product> {
  const response = await api.get(`/admin/products/${id}`);
  
  return response.data.data;
}

export type UpdateProductInput = {
  name: string,
  slug: string,
  description?: string,
  price: number,
  salePrice?: number | null;
  stock: number;
  categoryId: number;
  brandId: number;
  images: {
    url: string,
    isPrimary: boolean;
  }[];
}

export async function updateProduct(
  id: number,
  data: UpdateProductInput
): Promise<Product> {
  const response = await api.put(`/products/${id}`, data);
  
  return response.data.data
}

export async function deleteProduct(
  id: number
): Promise<Product> {
  const response = await api.delete(`/products/${id}`);

  return response.data.data;
};