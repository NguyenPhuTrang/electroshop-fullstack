import { Request, Response, NextFunction } from "express";

import {
    createProductImageSchema,
    updateProductImageSchema,
} from "../validations/productImage.validation";

import {
    createProductImage,
    deleteProductImage,
    getProductImageById,
    getProductImages,
    updateProductImage,
} from "../services/productImage.service";

// Create a product image
export const createProductImageController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const productId = Number(req.params.productId);

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const validation = createProductImageSchema.safeParse(
            req.body
        );

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid product image data",
                errors: validation.error.issues,
            });
        }

        const image = await createProductImage(
            productId,
            validation.data
        );

        return res.status(201).json({
            success: true,
            message: "Product image created successfully",
            data: image,
        });
    } catch (error) {
        next(error);
    }
};

// Get product images, optionally filtered by colorId
export const getProductImagesController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const productId = Number(req.params.productId);

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const colorIdQuery = req.query.colorId;

        let colorId: number | undefined;

        if (colorIdQuery !== undefined) {
            if (
                typeof colorIdQuery !== "string" ||
                !/^[1-9]\d*$/.test(colorIdQuery)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid color ID parameter",
                });
            }

            const parsedColorId = Number(colorIdQuery);

            if (!Number.isSafeInteger(parsedColorId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid color ID parameter",
                });
            }

            colorId = parsedColorId;
        }

        const images = await getProductImages(
            productId,
            colorId
        );

        return res.status(200).json({
            success: true,
            message: "Product images retrieved successfully",
            data: images,
        });
    } catch (error) {
        next(error);
    }
};

// Update a product image
export const updateProductImageController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const imageId = Number(req.params.id);

        if (!Number.isInteger(imageId) || imageId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product image ID",
            });
        }

        const validation = updateProductImageSchema.safeParse(
            req.body
        );

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid product image data",
                errors: validation.error.issues,
            });
        }

        if (Object.keys(validation.data).length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one field must be provided",
            });
        }

        const image = await updateProductImage(
            imageId,
            validation.data
        );

        return res.status(200).json({
            success: true,
            message: "Product image updated successfully",
            data: image,
        });
    } catch (error) {
        next(error);
    }
};

// Get one product image by ID
export const getProductImageByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const imageId = Number(req.params.id);

        if (!Number.isInteger(imageId) || imageId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product image ID",
            });
        }

        const image = await getProductImageById(imageId);

        return res.status(200).json({
            success: true,
            message: "Product image retrieved successfully",
            data: image,
        });
    } catch (error) {
        next(error);
    }
};

// Delete a product image
export const deleteProductImageController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const imageId = Number(req.params.id);

        if (!Number.isInteger(imageId) || imageId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product image ID",
            });
        }

        await deleteProductImage(imageId);

        return res.status(200).json({
            success: true,
            message: "Product image deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};