
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { Prisma } from "../generated/prisma/client";

import type {
    CreateProductVariantInput,
    UpdateProductVariantInput,
} from "../validations/productVariant.validation";

const colorOptionSelect = {
    id: true,
    name: true,
    hexCode: true,
    sortOrder: true,
} as const;

type VariantStatus =
    | "ACTIVE"
    | "INACTIVE"
    | "OUT_OF_STOCK";

type ManagedVariantStatus = "ACTIVE" | "INACTIVE";

/**
 * A new variant can be managed only if its parent product exists.
 * Public requests must not expose variants belonging to inactive products.
 */
const ensureProductExists = async (
    productId: number,
    requireActive = false
) => {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
            id: true,
            status: true,
        },
    });

    if (!product || (requireActive && product.status !== "ACTIVE")) {
        throw new AppError("Product not found", 404);
    }

    return product;
};

const ensureVariantExists = async (variantId: number) => {
    const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        include: {
            colorOption: {
                select: colorOptionSelect,
            },
        },
    });

    if (!variant) {
        throw new AppError("Product variant not found", 404);
    }

    return variant;
};

/**
 * Verify that a color belongs to the same product as the variant.
 * Use the transaction client so the check and the write share a transaction.
 */
const ensureColorBelongsToProduct = async (
    tx: Prisma.TransactionClient,
    productId: number,
    colorId: number | null | undefined
) => {
    if (colorId == null) {
        return;
    }

    const color = await tx.productColor.findFirst({
        where: {
            id: colorId,
            productId,
        },
        select: {
            id: true,
        },
    });

    if (!color) {
        throw new AppError(
            "Color not found for this product",
            404
        );
    }
};

const validateSalePrice = (
    price: number,
    salePrice: number | null | undefined
) => {
    if (salePrice != null && salePrice >= price) {
        throw new AppError(
            "Sale price must be lower than regular price",
            400
        );
    }
};

/**
 * Determine the final variant status.
 *
 * - INACTIVE remains inactive unless explicitly reactivated.
 * - ACTIVE requires positive stock.
 * - Zero stock results in OUT_OF_STOCK unless the variant is
 *   explicitly kept INACTIVE.
 */
const resolveVariantStatus = (
    stock: number,
    requestedStatus?: ManagedVariantStatus,
    currentStatus?: VariantStatus
): VariantStatus => {
    if (requestedStatus === "INACTIVE") {
        return "INACTIVE";
    }

    if (
        requestedStatus === undefined &&
        currentStatus === "INACTIVE"
    ) {
        return "INACTIVE";
    }

    return stock > 0 ? "ACTIVE" : "OUT_OF_STOCK";
};

/**
 * Public API: retrieve selectable variants for an active product.
 * Out-of-stock variants remain visible so the storefront can show them
 * as unavailable options.
 */
export const getProductVariants = async (
    productId: number
) => {
    await ensureProductExists(productId, true);

    return prisma.productVariant.findMany({
        where: {
            productId,
            status: {
                in: ["ACTIVE", "OUT_OF_STOCK"],
            },
        },
        include: {
            colorOption: {
                select: colorOptionSelect,
            },
        },
        orderBy: [
            { storage: "asc" },
            { colorId: "asc" },
            { id: "asc" },
        ],
    });
};

/**
 * Admin API: retrieve all variants, including inactive variants.
 */
export const getAdminProductVariants = async (
    productId: number
) => {
    await ensureProductExists(productId);

    return prisma.productVariant.findMany({
        where: { productId },
        include: {
            colorOption: {
                select: colorOptionSelect,
            },
        },
        orderBy: [
            { createdAt: "asc" },
            { id: "asc" },
        ],
    });
};

export const getProductVariantById = async (
    variantId: number
) => {
    return ensureVariantExists(variantId);
};

/**
 * Create one variant.
 *
 * The parent product can remain INACTIVE while variants are being
 * prepared. Creating a variant does not automatically publish the product.
 */
export const createProductVariant = async (
    productId: number,
    data: CreateProductVariantInput
) => {
    validateSalePrice(data.price, data.salePrice);

    return prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
            where: { id: productId },
            select: { id: true },
        });

        if (!product) {
            throw new AppError("Product not found", 404);
        }

        const colorId = data.colorId ?? null;
        const storage = data.storage ?? null;

        await ensureColorBelongsToProduct(
            tx,
            productId,
            colorId
        );

        const existingSku = await tx.productVariant.findUnique({
            where: { sku: data.sku },
            select: { id: true },
        });

        if (existingSku) {
            throw new AppError(
                "Variant SKU already exists",
                409
            );
        }

        // Prevent duplicate storage/color configurations, including
        // configurations that belong to inactive variants.
        const existingVariant =
            await tx.productVariant.findFirst({
                where: {
                    productId,
                    storage,
                    colorId,
                },
                select: { id: true },
            });

        if (existingVariant) {
            throw new AppError(
                "This storage and color combination already exists",
                409
            );
        }

        const stock = data.stock ?? 0;
        const status = resolveVariantStatus(
            stock,
            data.status
        );

        return tx.productVariant.create({
            data: {
                productId,
                sku: data.sku,
                storage,
                colorId,
                price: data.price,
                salePrice: data.salePrice ?? null,
                stock,
                status,
            },
            include: {
                colorOption: {
                    select: colorOptionSelect,
                },
            },
        });
    });
};

/**
 * Update an existing variant.
 *
 * The validation of salePrice uses the final regular price and final
 * sale price, combining incoming fields with existing database values.
 */
export const updateProductVariant = async (
    variantId: number,
    data: UpdateProductVariantInput
) => {
    if (Object.keys(data).length === 0) {
        throw new AppError(
            "At least one field must be provided",
            400
        );
    }

    return prisma.$transaction(async (tx) => {
        const existingVariant =
            await tx.productVariant.findUnique({
                where: { id: variantId },
            });

        if (!existingVariant) {
            throw new AppError(
                "Product variant not found",
                404
            );
        }

        const nextPrice =
            data.price ?? Number(existingVariant.price);

        const nextSalePrice =
            data.salePrice !== undefined
                ? data.salePrice
                : existingVariant.salePrice == null
                    ? null
                    : Number(existingVariant.salePrice);

        validateSalePrice(nextPrice, nextSalePrice);

        if (data.sku !== undefined) {
            const existingSku =
                await tx.productVariant.findUnique({
                    where: { sku: data.sku },
                    select: { id: true },
                });

            if (
                existingSku &&
                existingSku.id !== variantId
            ) {
                throw new AppError(
                    "Variant SKU already exists",
                    409
                );
            }
        }

        const nextStorage =
            data.storage !== undefined
                ? data.storage
                : existingVariant.storage;

        const nextColorId =
            data.colorId !== undefined
                ? data.colorId
                : existingVariant.colorId;

        await ensureColorBelongsToProduct(
            tx,
            existingVariant.productId,
            nextColorId
        );

        if (
            data.storage !== undefined ||
            data.colorId !== undefined
        ) {
            const duplicateVariant =
                await tx.productVariant.findFirst({
                    where: {
                        productId: existingVariant.productId,
                        storage: nextStorage,
                        colorId: nextColorId,
                        id: {
                            not: variantId,
                        },
                    },
                    select: {
                        id: true,
                    },
                });

            if (duplicateVariant) {
                throw new AppError(
                    "This storage and color combination already exists",
                    409
                );
            }
        }

        const nextStock =
            data.stock ?? existingVariant.stock;

        const nextStatus = resolveVariantStatus(
            nextStock,
            data.status,
            existingVariant.status
        );

        return tx.productVariant.update({
            where: { id: variantId },
            data: {
                ...(data.sku !== undefined && {
                    sku: data.sku,
                }),
                ...(data.storage !== undefined && {
                    storage: data.storage,
                }),
                ...(data.colorId !== undefined && {
                    colorId: data.colorId,
                }),
                ...(data.price !== undefined && {
                    price: data.price,
                }),
                ...(data.salePrice !== undefined && {
                    salePrice: data.salePrice,
                }),
                ...(data.stock !== undefined && {
                    stock: data.stock,
                }),
                status: nextStatus,
            },
            include: {
                colorOption: {
                    select: colorOptionSelect,
                },
            },
        });
    });
};

/**
 * Deactivate a variant without physically deleting it.
 * This preserves references from historical orders.
 */
export const deactivateProductVariant = async (
    variantId: number
) => {
    return prisma.$transaction(async (tx) => {
        const existingVariant =
            await tx.productVariant.findUnique({
                where: { id: variantId },
                select: { id: true },
            });

        if (!existingVariant) {
            throw new AppError(
                "Product variant not found",
                404
            );
        }

        return tx.productVariant.update({
            where: { id: variantId },
            data: {
                status: "INACTIVE",
            },
            include: {
                colorOption: {
                    select: colorOptionSelect,
                },
            },
        });
    });
};

/**
 * Create multiple variants atomically.
 *
 * Any validation or database error aborts the transaction so the request
 * does not leave behind a partially created batch.
 */
export const createProductVariants = async (
    productId: number,
    variants: CreateProductVariantInput[]
) => {
    if (variants.length === 0) {
        throw new AppError(
            "At least one variant is required",
            400
        );
    }

    for (const variant of variants) {
        validateSalePrice(
            variant.price,
            variant.salePrice
        );
    }

    const skus = variants.map((variant) => variant.sku);

    if (new Set(skus).size !== skus.length) {
        throw new AppError(
            "Duplicate SKUs in the request",
            409
        );
    }

    const configurationKeys = variants.map((variant) =>
        JSON.stringify([
            variant.storage ?? null,
            variant.colorId ?? null,
        ])
    );

    if (
        new Set(configurationKeys).size !==
        configurationKeys.length
    ) {
        throw new AppError(
            "Duplicate storage and color combinations in the request",
            409
        );
    }

    return prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
            where: { id: productId },
            select: { id: true },
        });

        if (!product) {
            throw new AppError("Product not found", 404);
        }

        const colorIds = [
            ...new Set(
                variants
                    .map((variant) => variant.colorId)
                    .filter(
                        (id): id is number => id != null
                    )
            ),
        ];

        if (colorIds.length > 0) {
            const existingColors =
                await tx.productColor.findMany({
                    where: {
                        productId,
                        id: {
                            in: colorIds,
                        },
                    },
                    select: {
                        id: true,
                    },
                });

            if (
                existingColors.length !== colorIds.length
            ) {
                throw new AppError(
                    "One or more colors do not belong to this product",
                    400
                );
            }
        }

        const existingSkus =
            await tx.productVariant.findMany({
                where: {
                    sku: {
                        in: skus,
                    },
                },
                select: {
                    sku: true,
                },
            });

        if (existingSkus.length > 0) {
            throw new AppError(
                `SKU already exists: ${existingSkus
                    .map((item) => item.sku)
                    .join(", ")}`,
                409
            );
        }

        const existingVariants =
            await tx.productVariant.findMany({
                where: {
                    productId,
                },
                select: {
                    storage: true,
                    colorId: true,
                },
            });

        const existingConfigurations = new Set(
            existingVariants.map((variant) =>
                JSON.stringify([
                    variant.storage,
                    variant.colorId,
                ])
            )
        );

        for (const variant of variants) {
            const key = JSON.stringify([
                variant.storage ?? null,
                variant.colorId ?? null,
            ]);

            if (existingConfigurations.has(key)) {
                throw new AppError(
                    `Variant configuration already exists: ${
                        variant.storage ?? "No storage"
                    } / Color ID ${
                        variant.colorId ?? "None"
                    }`,
                    409
                );
            }
        }

        await tx.productVariant.createMany({
            data: variants.map((variant) => {
                const stock = variant.stock ?? 0;

                return {
                    productId,
                    sku: variant.sku,
                    storage: variant.storage ?? null,
                    colorId: variant.colorId ?? null,
                    price: variant.price,
                    salePrice: variant.salePrice ?? null,
                    stock,
                    status: resolveVariantStatus(
                        stock,
                        variant.status
                    ),
                };
            }),
        });

        return tx.productVariant.findMany({
            where: {
                productId,
                sku: {
                    in: skus,
                },
            },
            include: {
                colorOption: {
                    select: colorOptionSelect,
                },
            },
            orderBy: {
                id: "asc",
            },
        });
    });
};
