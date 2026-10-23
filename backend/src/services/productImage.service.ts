import { prisma } from "../config/prisma";
import { Prisma } from "../generated/prisma/client";
import { AppError } from "../utils/AppError";
import { uploadImageFromUrl } from "./upload.service";

import type {
    CreateProductImageInput,
    UpdateProductImageInput,
} from "../validations/productImage.validation";

const colorOptionSelect = {
    id: true,
    name: true,
    hexCode: true,
    sortOrder: true,
} as const;

const productImageInclude = {
    colorOption: {
        select: colorOptionSelect,
    },
} as const;

const ensureProductExists = async (productId: number) => {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true },
    });

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    return product;
};

const ensureColorBelongsToProduct = async (
    productId: number,
    colorId: number | null | undefined
) => {
    if (colorId == null) {
        return;
    }

    const color = await prisma.productColor.findFirst({
        where: {
            id: colorId,
            productId,
        },
        select: { id: true },
    });

    if (!color) {
        throw new AppError(
            "Color not found for this product",
            404
        );
    }
};

const ensureProductExistsInTransaction = async (
    tx: Prisma.TransactionClient,
    productId: number
) => {
    const product = await tx.product.findUnique({
        where: { id: productId },
        select: { id: true },
    });

    if (!product) {
        throw new AppError("Product not found", 404);
    }
};

const ensureColorBelongsToProductInTransaction = async (
    tx: Prisma.TransactionClient,
    productId: number,
    colorId: number | null
) => {
    if (colorId === null) {
        return;
    }

    const color = await tx.productColor.findFirst({
        where: {
            id: colorId,
            productId,
        },
        select: { id: true },
    });

    if (!color) {
        throw new AppError(
            "Color not found for this product",
            404
        );
    }
};

const clearOtherPrimaryImages = async (
    tx: Prisma.TransactionClient,
    productId: number,
    excludedImageId?: number
) => {
    await tx.productImage.updateMany({
        where: {
            productId,
            isPrimary: true,
            ...(excludedImageId !== undefined && {
                id: {
                    not: excludedImageId,
                },
            }),
        },
        data: {
            isPrimary: false,
        },
    });
};

export const getProductImageById = async (
    imageId: number
) => {
    const image = await prisma.productImage.findUnique({
        where: { id: imageId },
        include: productImageInclude,
    });

    if (!image) {
        throw new AppError("Product image not found", 404);
    }

    return image;
};

export const createProductImage = async (
    productId: number,
    data: CreateProductImageInput
) => {
    const colorId = data.colorId ?? null;

    await ensureProductExists(productId);
    await ensureColorBelongsToProduct(productId, colorId);

    const uploadedImage = await uploadImageFromUrl(
        data.url,
        "electroshop/products"
    );

    return prisma.$transaction(async (tx) => {
        await ensureProductExistsInTransaction(
            tx,
            productId
        );

        await ensureColorBelongsToProductInTransaction(
            tx,
            productId,
            colorId
        );
        const isPrimary = data.isPrimary === true;

        if (isPrimary) {
            await clearOtherPrimaryImages(
                tx,
                productId
            );
        }

        const image = await tx.productImage.create({
            data: {
                productId,
                url: uploadedImage.secure_url,
                ...(data.alt !== undefined && {
                    alt: data.alt,
                }),
                colorId,
                isPrimary,
                sortOrder: data.sortOrder ?? 0,
            },
            include: productImageInclude,
        });

        return image;
    });
};

export const getProductImages = async (
    productId: number,
    colorId?: number | null
) => {
    await ensureProductExists(productId);

    if (colorId == null) {
        return prisma.productImage.findMany({
            where: { productId },
            include: productImageInclude,
            orderBy: [
                { sortOrder: "asc" },
                { id: "asc" },
            ],
        });
    }

    await ensureColorBelongsToProduct(
        productId,
        colorId
    );

    return prisma.productImage.findMany({
        where: {
            productId,
            OR: [
                { colorId },
                { colorId: null },
            ],
        },
        include: productImageInclude,
        orderBy: [
            { sortOrder: "asc" },
            { id: "asc" },
        ],
    });
};

export const updateProductImage = async (
    imageId: number,
    data: UpdateProductImageInput
) => {
    if (Object.keys(data).length === 0) {
        throw new AppError(
            "At least one field must be provided",
            400
        );
    }

    const existingImage = await prisma.productImage.findUnique({
        where: { id: imageId },
    });

    if (!existingImage) {
        throw new AppError("Product image not found", 404);
    }

    let uploadedUrl: string | undefined;

    if (data.url !== undefined) {
        const result = await uploadImageFromUrl(
            data.url,
            "electroshop/products"
        );

        uploadedUrl = result.secure_url;
    }

    return prisma.$transaction(async (tx) => {
        const currentImage = await tx.productImage.findUnique({
            where: { id: imageId },
        });

        if (!currentImage) {
            throw new AppError(
                "Product image not found",
                404
            );
        }

        const nextColorId =
            data.colorId !== undefined
                ? data.colorId
                : currentImage.colorId;

        await ensureColorBelongsToProductInTransaction(
            tx,
            currentImage.productId,
            nextColorId
        );

        const nextIsPrimary =
            data.isPrimary !== undefined
                ? data.isPrimary
                : currentImage.isPrimary;

        if (nextIsPrimary || (data.isPrimary === false && currentImage.isPrimary)) {
            await clearOtherPrimaryImages(
                tx,
                currentImage.productId,
                imageId
            );
        }

        const updatedImage = await tx.productImage.update({
            where: { id: imageId },
            data: {
                ...(uploadedUrl !== undefined && {
                    url: uploadedUrl,
                }),
                ...(data.alt !== undefined && {
                    alt: data.alt,
                }),
                ...(data.colorId !== undefined && {
                    colorId: data.colorId,
                }),
                isPrimary: nextIsPrimary,
                ...(data.sortOrder !== undefined && {
                    sortOrder: data.sortOrder,
                }),
            },
            include: productImageInclude,
        });

        return updatedImage;
    });
};

export const deleteProductImage = async (
    imageId: number
) => {
    return prisma.$transaction(async (tx) => {
        const existingImage = await tx.productImage.findUnique({
            where: { id: imageId },
        });

        if (!existingImage) {
            throw new AppError(
                "Product image not found",
                404
            );
        }

        return tx.productImage.delete({
            where: { id: imageId },
            include: productImageInclude,
        });
    });
};