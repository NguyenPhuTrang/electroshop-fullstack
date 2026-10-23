import { z } from "zod";

const variantStatusSchema = z.enum([
    "ACTIVE",
    "INACTIVE",
]);

const storageSchema = z
    .string()
    .trim()
    .min(1, "Storage cannot be empty")
    .nullable()
    .optional();

const colorIdSchema = z
    .number()
    .int()
    .positive("Color ID must be a positive integer")
    .nullable()
    .optional();

const priceSchema = z
    .number()
    .finite("Price must be a valid number")
    .positive("Price must be greater than 0");

const salePriceSchema = z
    .number()
    .finite("Sale price must be a valid number")
    .positive("Sale price must be greater than 0")
    .nullable()
    .optional();

const stockSchema = z
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative");

const validateSalePrice = (
    data: {
        price?: number;
        salePrice?: number | null;
    },
    context: z.RefinementCtx
) => {
    if (
        data.price !== undefined &&
        data.salePrice != null &&
        data.salePrice >= data.price
    ) {
        context.addIssue({
            code: "custom",
            path: ["salePrice"],
            message: "Sale price must be lower than regular price",
        });
    }
};

export const createProductVariantSchema = z
    .object({
        storage: storageSchema,
        colorId: colorIdSchema,
        price: priceSchema,
        salePrice: salePriceSchema,
        stock: stockSchema.optional(),
        status: variantStatusSchema.optional(),
    })
    .superRefine(validateSalePrice);

export const updateProductVariantSchema = z
    .object({
        storage: storageSchema,
        colorId: colorIdSchema,
        price: priceSchema.optional(),
        salePrice: salePriceSchema,
        stock: stockSchema.optional(),
        status: variantStatusSchema.optional(),
    })
    .superRefine(validateSalePrice);

export const createBulkProductVariantsSchema = z.object({
    variants: z
        .array(createProductVariantSchema)
        .min(1, "At least one variant is required")
        .max(
            100,
            "A maximum of 100 variants can be created at once"
        ),
});

export type CreateProductVariantInput = z.infer<typeof createProductVariantSchema>;

export type UpdateProductVariantInput = z.infer<typeof updateProductVariantSchema>;