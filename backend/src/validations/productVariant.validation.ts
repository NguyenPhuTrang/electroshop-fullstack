
import { z } from "zod";

/**
 * OUT_OF_STOCK is derived from stock by the service.
 * Admin can explicitly activate or deactivate a variant.
 */
const variantStatusSchema = z.enum([
    "ACTIVE",
    "INACTIVE",
]);

const skuSchema = z
    .string()
    .trim()
    .min(1, "SKU is required");

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

/**
 * Validate salePrice when price and salePrice are both present.
 * For partial updates, the service also validates the new value
 * against the existing value stored in the database.
 */
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

/**
 * Create one product variant.
 */
export const createProductVariantSchema = z
    .object({
        sku: skuSchema,
        storage: storageSchema,
        colorId: colorIdSchema,
        price: priceSchema,
        salePrice: salePriceSchema,
        stock: stockSchema.optional(),
        status: variantStatusSchema.optional(),
    })
    .superRefine(validateSalePrice);

/**
 * Update a variant partially.
 *
 * Fields that are not provided remain unchanged.
 * The service validates price relationships using both the incoming
 * data and the existing database values.
 */
export const updateProductVariantSchema = z
    .object({
        sku: skuSchema.optional(),
        storage: storageSchema,
        colorId: colorIdSchema,
        price: priceSchema.optional(),
        salePrice: salePriceSchema,
        stock: stockSchema.optional(),
        status: variantStatusSchema.optional(),
    })
    .superRefine(validateSalePrice);

/**
 * Create multiple variants in one request.
 * The service performs duplicate checks and creates them in a transaction.
 */
export const createBulkProductVariantsSchema = z.object({
    variants: z
        .array(createProductVariantSchema)
        .min(1, "At least one variant is required")
        .max(
            100,
            "A maximum of 100 variants can be created at once"
        ),
});

export type CreateProductVariantInput = z.infer<typeof createProductVariantSchema>;//z.infer giúp chúng ta tái sử dụng cấu trúc Validation để tạo type TypeScript, tránh phải khai báo kiểu dữ liệu thủ công lần thứ hai.

export type UpdateProductVariantInput = z.infer<typeof updateProductVariantSchema>;
