
import { z } from "zod";

const productFieldsSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Product name is required"),

    slug: z
        .string()
        .trim()
        .min(1, "Slug is required"),

    description: z
        .string()
        .optional(),

    categoryId: z
        .number()
        .int()
        .positive("Invalid category ID"),

    brandId: z
        .number()
        .int()
        .positive("Invalid brand ID"),
});

export const createProductSchema = productFieldsSchema;

export const updateProductSchema =
    productFieldsSchema
        .partial()
        .extend({
            status: z
                .enum(["ACTIVE", "INACTIVE"])
                .optional(),
        });

export type CreateProductInput = z.infer<typeof createProductSchema>;

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
