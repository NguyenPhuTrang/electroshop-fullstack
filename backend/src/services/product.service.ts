
import { z } from "zod";
import crypto from "crypto";

import { prisma } from "../config/prisma";
import {
    createProductSchema,
    updateProductSchema,
} from "../validations/product.validation";
import { AppError } from "../utils/AppError";
import { Prisma } from "../generated/prisma/client";


const buildEffectivePriceCondition = (
    minPrice?: number,
    maxPrice?: number
): Prisma.ProductVariantWhereInput | undefined => {
    if (minPrice === undefined && maxPrice === undefined) {
        return undefined;
    }

    const priceRange = {
        ...(minPrice !== undefined ? { gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
    };

    return {
        OR: [
            {
                salePrice: {
                    not: null,
                    ...priceRange,
                },
            },
            {
                salePrice: null,
                price: priceRange,
            },
        ],
    };
};

type VariantForSummary = {
    price: unknown;
    salePrice: unknown | null;
    stock: number;
    status: string;
};

type ProductSummaryOptions = {
    includeUnavailablePrice?: boolean;
};

const summarizeProductFromVariants = <
    TVariant extends VariantForSummary,
    TProduct extends { variants: TVariant[] }
>(
    product: TProduct,
    options: ProductSummaryOptions = {}
) => {
    const activeVariants = product.variants.filter(
        (variant) => variant.status === "ACTIVE"
    );

    const pricingVariants =
        activeVariants.length > 0
            ? activeVariants
            : options.includeUnavailablePrice
                ? product.variants
                : [];

    const lowestPriceVariant = pricingVariants.reduce<
        TVariant | null
    >((lowest, variant) => {
        if (!lowest) {
            return variant;
        }

        const currentPrice = Number(
            variant.salePrice ?? variant.price
        );

        const lowestPrice = Number(
            lowest.salePrice ?? lowest.price
        );

        return currentPrice < lowestPrice
            ? variant
            : lowest;
    }, null);

    return {
        ...product,

        // Both values refer to the same lowest-effective-price variant.
        price: lowestPriceVariant?.price ?? null,
        salePrice: lowestPriceVariant?.salePrice ?? null,

        // Only active variants contribute to available stock.
        stock: activeVariants.reduce(
            (total, variant) => total + variant.stock,
            0
        ),
    };
};

const getEffectivePrice = (product: {
    price: unknown;
    salePrice: unknown;
}) => {
    if (product.price === null || product.price === undefined) {
        return null;
    }

    return Number(product.salePrice ?? product.price);
};

const sortProductsByEffectivePrice = <
    TProduct extends {
        id: number;
        price: unknown;
        salePrice: unknown;
    }
>(
    products: TProduct[],
    direction: "asc" | "desc"
) => {
    return [...products].sort((a, b) => {
        const priceA = getEffectivePrice(a);
        const priceB = getEffectivePrice(b);

        if (priceA === null && priceB === null) {
            return a.id - b.id;
        }

        if (priceA === null) {
            return 1;
        }

        if (priceB === null) {
            return -1;
        }

        const difference =
            direction === "asc"
                ? priceA - priceB
                : priceB - priceA;

        return difference || a.id - b.id;
    });
};

const productRelations = {
    brand: true,
    category: true,

    images: {
        include: {
            colorOption: true,
        },
        orderBy: [
            { sortOrder: "asc" as const },
            { id: "asc" as const },
        ],
    },

    variants: {
        include: {
            colorOption: true,
        },
        orderBy: [
            { storage: "asc" as const },
            { colorId: "asc" as const },
            { id: "asc" as const },
        ],
    },
};

export const getProducts = async (
    search?: string,
    categoryId?: number,
    brandId?: number,
    minPrice?: number,
    maxPrice?: number,
    sort?: string,
    page: number = 1,
    limit: number = 10
) => {
    const skip = (page - 1) * limit;

    const priceCondition = buildEffectivePriceCondition(
        minPrice,
        maxPrice
    );

    const where: Prisma.ProductWhereInput = {
        status: "ACTIVE",

        ...(search && {
            OR: [
                {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    description: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ],
        }),

        ...(categoryId !== undefined && { categoryId }),
        ...(brandId !== undefined && { brandId }),

        variants: {
            some: {
                status: "ACTIVE",
                ...(priceCondition
                    ? { AND: [priceCondition] }
                    : {}),
            },
        },
    };

    const sortByPrice =
        sort === "price_asc" ||
        sort === "price_desc";

    const rawProducts = await prisma.product.findMany({
        where,

        include: {
            ...productRelations,

            // Public responses expose only selectable variants.
            variants: {
                where: {
                    status: {
                        in: ["ACTIVE", "OUT_OF_STOCK"],
                    },
                },
                include: {
                    colorOption: true,
                },
                orderBy: [
                    { storage: "asc" },
                    { colorId: "asc" },
                    { id: "asc" },
                ],
            },
        },

        ...(!sortByPrice
            ? {
                  orderBy: {
                      createdAt: "desc" as const,
                  },
                  skip,
                  take: limit,
              }
            : {}),
    });

    let products = rawProducts.map((product) =>
        summarizeProductFromVariants(product)
    );

    if (sort === "price_asc") {
        products = sortProductsByEffectivePrice(
            products,
            "asc"
        );
    } else if (sort === "price_desc") {
        products = sortProductsByEffectivePrice(
            products,
            "desc"
        );
    }

    // Effective-price sorting must happen before pagination.
    if (sortByPrice) {
        products = products.slice(skip, skip + limit);
    }

    const total = await prisma.product.count({ where });

    return {
        products,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getAdminProducts = async (
    search?: string,
    categoryId?: number,
    brandId?: number,
    minPrice?: number,
    maxPrice?: number,
    sort?: string,
    page: number = 1,
    limit: number = 10,
    lowStock: boolean = false
) => {
    const skip = (page - 1) * limit;

    const priceCondition = buildEffectivePriceCondition(
        minPrice,
        maxPrice
    );

    // Find products whose total stock across ACTIVE variants is <= 10.
    const lowStockProductIds = lowStock
        ? (
              await prisma.productVariant.groupBy({
                  by: ["productId"],
                  where: {
                      status: "ACTIVE",
                  },
                  _sum: {
                      stock: true,
                  },
                  having: {
                      stock: {
                          _sum: {
                              lte: 10,
                          },
                      },
                  },
              })
          ).map((variant) => variant.productId)
        : undefined;

    const where: Prisma.ProductWhereInput = {
        ...(lowStock && {
            status: "ACTIVE" as const,
            id: {
                in: lowStockProductIds ?? [],
            },
        }),

        ...(search && {
            OR: [
                {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    description: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ],
        }),

        ...(categoryId !== undefined && { categoryId }),
        ...(brandId !== undefined && { brandId }),

        ...(priceCondition && {
            variants: {
                some: {
                    status: "ACTIVE",
                    AND: [priceCondition],
                },
            },
        }),
    };

    const sortByPrice =
        sort === "price_asc" ||
        sort === "price_desc";

    const rawProducts = await prisma.product.findMany({
        where,
        include: productRelations,

        ...(!sortByPrice
            ? {
                  orderBy: {
                      createdAt: "desc" as const,
                  },
                  skip,
                  take: limit,
              }
            : {}),
    });

    let products = rawProducts.map((product) =>
        summarizeProductFromVariants(product, {
            includeUnavailablePrice: true,
        })
    );

    if (sort === "price_asc") {
        products = sortProductsByEffectivePrice(
            products,
            "asc"
        );
    } else if (sort === "price_desc") {
        products = sortProductsByEffectivePrice(
            products,
            "desc"
        );
    }

    // Sort by price before applying pagination.
    if (sortByPrice) {
        products = products.slice(skip, skip + limit);
    }

    // Count using exactly the same filters as the product query.
    const total = await prisma.product.count({ where });

    return {
        products,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getProductById = async (
    id: number,
    includeInactive: boolean = false
) => {
    const product = await prisma.product.findFirst({
        where: {
            id,

            ...(!includeInactive && {
                status: "ACTIVE",
                variants: {
                    some: {
                        status: "ACTIVE",
                        stock: {
                            gt: 0,
                        },
                    },
                },
            }),
        },

        include: {
            ...productRelations,

            variants: {
                where: includeInactive
                    ? {}
                    : {
                          status: {
                              in: ["ACTIVE", "OUT_OF_STOCK"],
                          },
                      },
                include: {
                    colorOption: true,
                },
                orderBy: [
                    { storage: "asc" },
                    { colorId: "asc" },
                    { id: "asc" },
                ],
            },
        },
    });

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    return summarizeProductFromVariants(product, {
        includeUnavailablePrice: includeInactive,
    });
};

export const getProductBySlug = async (
    slug: string,
    isAdmin: boolean = false
) => {
    const product = await prisma.product.findFirst({
        where: {
            slug,

            ...(!isAdmin && {
                status: "ACTIVE",
                variants: {
                    some: {
                        status: "ACTIVE",
                        stock: {
                            gt: 0,
                        },
                    },
                },
            }),
        },

        include: {
            ...productRelations,

            variants: {
                where: isAdmin
                    ? {}
                    : {
                          status: {
                              in: ["ACTIVE", "OUT_OF_STOCK"],
                          },
                      },
                include: {
                    colorOption: true,
                },
                orderBy: [
                    { storage: "asc" },
                    { colorId: "asc" },
                    { id: "asc" },
                ],
            },
        },
    });

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    return summarizeProductFromVariants(product, {
        includeUnavailablePrice: isAdmin,
    });
};


export const createProduct = async (
    data: z.infer<typeof createProductSchema>
) => {
    const existingProduct = await prisma.product.findUnique({
        where: {
            slug: data.slug,
        },
        select: {
            id: true,
        },
    });

    if (existingProduct) {
        throw new AppError(
            "Product slug already exists",
            409
        );
    }

    let sku = generateSku(data.name);

    while (
        await prisma.product.findUnique({
            where: {
                sku,
            },
            select: {
                id: true,
            },
        })
    ) {
        sku = generateSku(data.name);
    }

    const product = await prisma.product.create({
        data: {
            name: data.name,
            slug: data.slug,
            categoryId: data.categoryId,
            brandId: data.brandId,
            description: data.description,
            sku,
            status: "INACTIVE",
        },
        include: productRelations,
    });

    return summarizeProductFromVariants(product, {
        includeUnavailablePrice: true,
    });
};

export const updateProduct = async (
    id: number,
    data: z.infer<typeof updateProductSchema>
) => {
    if (Object.keys(data).length === 0) {
        throw new AppError(
            "At least one field must be provided",
            400
        );
    }

    return prisma.$transaction(async (tx) => {
        const existingProduct = await tx.product.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
            },
        });

        if (!existingProduct) {
            throw new AppError("Product not found", 404);
        }

        if (data.slug !== undefined) {
            const duplicateProduct =
                await tx.product.findFirst({
                    where: {
                        slug: data.slug,
                        NOT: {
                            id,
                        },
                    },
                    select: {
                        id: true,
                    },
                });

            if (duplicateProduct) {
                throw new AppError(
                    "Product slug already exists",
                    409
                );
            }
        }

        // Product may only be activated when it has a sellable variant.
        if (data.status === "ACTIVE") {
            const activeVariant =
                await tx.productVariant.findFirst({
                    where: {
                        productId: id,
                        status: "ACTIVE",
                        stock: {
                            gt: 0,
                        },
                    },
                    select: {
                        id: true,
                    },
                });

            if (!activeVariant) {
                throw new AppError(
                    "Cannot activate a product without at least one active variant with available stock",
                    409
                );
            }
        }

        await tx.product.update({
            where: {
                id,
            },
            data: {
                ...(data.name !== undefined && {
                    name: data.name,
                }),
                ...(data.slug !== undefined && {
                    slug: data.slug,
                }),
                ...(data.description !== undefined && {
                    description: data.description,
                }),
                ...(data.categoryId !== undefined && {
                    categoryId: data.categoryId,
                }),
                ...(data.brandId !== undefined && {
                    brandId: data.brandId,
                }),
                ...(data.status !== undefined && {
                    status: data.status,
                }),
            },
        });

        const updatedProduct = await tx.product.findUnique({
            where: {
                id,
            },
            include: productRelations,
        });

        if (!updatedProduct) {
            throw new AppError("Product not found", 404);
        }

        return summarizeProductFromVariants(updatedProduct, {
            includeUnavailablePrice: true,
        });
    });
};

export const deleteProduct = async (id: number) => {
    const product = await prisma.product.findUnique({
        where: {
            id,
        },
        include: {
            _count: {
                select: {
                    orderItems: true,
                    reviews: true,
                },
            },
        },
    });

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    const hasRelatedData =
        product._count.orderItems > 0 ||
        product._count.reviews > 0;

    if (!hasRelatedData) {
        return prisma.product.delete({
            where: {
                id,
            },
        });
    }

    return prisma.$transaction(async (tx) => {
        await tx.product.update({
            where: {
                id,
            },
            data: {
                status: "INACTIVE",
            },
        });

        await tx.productVariant.updateMany({
            where: {
                productId: id,
            },
            data: {
                status: "INACTIVE",
            },
        });

        const updatedProduct = await tx.product.findUnique({
            where: {
                id,
            },
            include: productRelations,
        });

        if (!updatedProduct) {
            throw new AppError("Product not found", 404);
        }

        return summarizeProductFromVariants(updatedProduct, {
            includeUnavailablePrice: true,
        });
    });
};

const generateSku = (name: string) => {
    const prefix =
        name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 12) || "PRODUCT";

    const random = crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase();

    return `${prefix}-${random}`;
};
