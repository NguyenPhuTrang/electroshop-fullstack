import { z } from "zod";

export const createProductImageSchema = z.object({
    url: z
        .string()
        .trim()
        .min(1, "Image URL is required"),

    alt: z
        .string()
        .trim()
        .optional(),

    isPrimary: z
        .boolean()
        .optional(),

    sortOrder: z
        .number()
        .int()
        .min(0)
        .optional(),
});

export const updateProductImageSchema = z.object({
    url: z
        .string()
        .trim()
        .min(1, "Image URL is required")
        .optional(),

    alt: z
        .string()
        .trim()
        .optional(),

    isPrimary: z
        .boolean()
        .optional(),

    sortOrder: z
        .number()
        .int()
        .min(0)
        .optional(),
});