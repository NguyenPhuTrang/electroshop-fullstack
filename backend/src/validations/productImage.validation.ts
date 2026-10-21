import { z } from "zod";

const imageUrlSchema = z
    .string()
    .trim()
    .url("Image URL must be a valid URL")
    .refine(
        (value) => {
            try {
                const protocol = new URL(value).protocol;

                return (
                    protocol === "http:" ||
                    protocol === "https:"
                );
            } catch {
                return false;
            }
        },
        "Image URL must use HTTP or HTTPS"
    );

const productImageFieldsSchema = z.object({
    url: imageUrlSchema,

    alt: z
        .string()
        .trim()
        .optional(),

    colorId: z
        .number()
        .int("Color ID must be an integer")
        .positive("Color ID must be a positive integer")
        .nullable()
        .optional(),

    isPrimary: z
        .boolean()
        .optional(),

    sortOrder: z
        .number()
        .int("Sort order must be an integer")
        .min(0, "Sort order cannot be negative")
        .optional(),
});

export const createProductImageSchema =
    productImageFieldsSchema;

export const updateProductImageSchema =
    productImageFieldsSchema.partial();

export type CreateProductImageInput = z.infer<typeof createProductImageSchema>;

export type UpdateProductImageInput = z.infer<typeof updateProductImageSchema>;