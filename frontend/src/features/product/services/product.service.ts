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
  page?: number;
  limit?: number;
};

export type GetProductResponse = {
  products: Product[];
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number;
  };
};

export async function getProducts(
  params?: GetProductsParams
): Promise<GetProductResponse> {
  const response = await api.get("/products", {
    params
  });

  return response.data.data;
}

export async function getProductBySlug(
  slug: string
): Promise<Product> {
  const response = await api.get(`/products/slug/${slug}`);

  return response.data.data;
}