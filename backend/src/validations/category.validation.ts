import {z} from "zod";

export const createCategorySchema = z.object({
    name: z
    .string()
    .trim()
    .min(1, "Category name is required"),

    slug: z
    .string()
    .trim()
    .min(1, "Category slug is required "),

    description: z
    .string()
    .trim()
    .min(1,"Category description is required")
});

export const updateCategorySchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Category name is required")
        .optional(), // có thể có hoặc không có dữ liệu gửi lên

    slug: z
        .string()
        .trim()
        .min(1, "Category slug is required")
        .optional(),

    description: z
        .string()
        .trim()
        .optional(),
});
