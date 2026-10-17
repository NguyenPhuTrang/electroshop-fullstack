import api from "@/src/lib/axios";
import { Category } from "../types/category";

export type CategoryPayload = {
    name: string;
    slug: string;
    description?: string;
};

// Get all categories
export async function getCategories(): Promise<Category[]> {
    const response = await api.get("/categories");

    return response.data.data;
}

// Get a category by ID
export async function getCategoryById(
    id: number
): Promise<Category> {
    const response = await api.get(`/categories/${id}`);

    return response.data.data;
}

// Create a category
export async function createCategory(
    data: CategoryPayload
): Promise<Category> {
    const response = await api.post("/categories", data);

    return response.data.data;
}

// Update a category
export async function updateCategory(
    id: number,
    data: Partial<CategoryPayload>
): Promise<Category> {
    const response = await api.patch(`/categories/${id}`, data);

    return response.data.data;
}

// Delete a category
export async function deleteCategory(
    id: number
): Promise<void> {
    await api.delete(`/categories/${id}`);
}