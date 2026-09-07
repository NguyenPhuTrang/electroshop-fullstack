import api from "@/src/lib/axios";
import type { Product } from "../types/product";

export async function getProducts(): Promise<Product[]> {
  const response = await api.get("/products");

  return response.data.data.products;
}

export async function getProductBySlug(
  slug: string
): Promise<Product> {
  const response = await api.get(`/products/slug/${slug}`);

  return response.data.data;
}