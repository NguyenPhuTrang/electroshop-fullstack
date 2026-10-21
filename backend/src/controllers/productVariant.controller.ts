import { Request, Response, NextFunction } from "express";

import {
    getProductVariants,
    getAdminProductVariants,
    getProductVariantById,
    createProductVariant,
    updateProductVariant,
    deactivateProductVariant,
    createProductVariants,
} from "../services/productVariant.service";

import {
    createBulkProductVariantsSchema,
    createProductVariantSchema,
    updateProductVariantSchema,
} from "../validations/productVariant.validation";

export const getProductVariantsController = async (
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

        const variants = await getProductVariants(productId);

        return res.status(200).json({
            success: true,
            message: "Product variants retrieved successfully",
            data: variants,
        });
    } catch (error) {
        next(error);
    }
};

export const getAdminProductVariantsController = async (
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

        const variants = await getAdminProductVariants(productId);

        return res.status(200).json({
            success: true,
            message: "Product variants retrieved successfully",
            data: variants,
        });
    } catch (error) {
        next(error);
    }
};

export const getProductVariantByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const variantId = Number(req.params.id);

        if (!Number.isInteger(variantId) || variantId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product variant ID",
            });
        }

        const variant = await getProductVariantById(variantId);

        return res.status(200).json({
            success: true,
            message: "Product variant retrieved successfully",
            data: variant,
        });
    } catch (error) {
        next(error);
    }
};

export const createProductVariantController = async (
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

        const validation = createProductVariantSchema.safeParse(
            req.body
        );

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid product variant data",
                error: validation.error.issues,
            });
        }

        const variant = await createProductVariant(
            productId,
            validation.data
        );

        return res.status(201).json({
            success: true,
            message: "Product variant created successfully",
            data: variant,
        });
    } catch (error) {
        next(error);
    }
};

export const updateProductVariantController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const variantId = Number(req.params.id);

        if (!Number.isInteger(variantId) || variantId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product variant ID",
            });
        }

        const validation = updateProductVariantSchema.safeParse(
            req.body
        );

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid product variant data",
                error: validation.error.issues,
            });
        }

        if (Object.keys(validation.data).length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one field must be provided",
            });
        }

        const variant = await updateProductVariant(
            variantId,
            validation.data
        );

        return res.status(200).json({
            success: true,
            message: "Product variant updated successfully",
            data: variant,
        });
    } catch (error) {
        next(error);
    }
};

export const deactivateProductVariantController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const variantId = Number(req.params.id);

        if (!Number.isInteger(variantId) || variantId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product variant ID",
            });
        }

        const variant = await deactivateProductVariant(variantId);

        return res.status(200).json({
            success: true,
            message: "Product variant deactivated successfully",
            data: variant,
        });
    } catch (error) {
        next(error);
    }
};

export const createProductVariantsController = async (
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

        const validation = createBulkProductVariantsSchema.safeParse(
            req.body
        );

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid product variants data",
                error: validation.error.issues,
            });
        }

        const variants = await createProductVariants(
            productId,
            validation.data.variants
        );

        return res.status(201).json({
            success: true,
            message: "Product variants created successfully",
            data: variants,
        });
    } catch (error) {
        next(error);
    }
};