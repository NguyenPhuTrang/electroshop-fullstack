import { z } from "zod";

export const createProductColorSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Color name is required")
        .max(50, "Color name cannot exceed 50 characters"),

    hexCode: z
        .string()
        .trim()
        .regex(
            /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
            "Invalid hex color code"
        )
        .nullable()
        .optional(),

    sortOrder: z
        .number()
        .int()
        .min(0, "Sort order cannot be negative")
        .optional(),
});

export const updateProductColorSchema =
    createProductColorSchema.partial();

export type CreateProductColorInput = z.infer<
    typeof createProductColorSchema
>;

export type UpdateProductColorInput = z.infer<
    typeof updateProductColorSchema
>;