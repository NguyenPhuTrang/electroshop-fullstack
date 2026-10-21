
import { Request, Response, NextFunction } from "express";

import {
    createProductColorSchema,
    updateProductColorSchema,
} from "../validations/productColor.validation";

import {
    getProductColors,
    getProductColorById,
    createProductColor,
    updateProductColor,
    deleteProductColor,
} from "../services/productColor.service";

export const getProductColorsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const productId = Number(req.params.productId);

        if (
            !Number.isSafeInteger(productId) ||
            productId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const colors = await getProductColors(productId);

        return res.status(200).json({
            success: true,
            message: "Product colors retrieved successfully",
            data: colors,
        });
    } catch (error) {
        next(error);
    }
};

export const getProductColorByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const productId = Number(req.params.productId);
        const colorId = Number(req.params.id);

        if (
            !Number.isSafeInteger(productId) ||
            productId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        if (
            !Number.isSafeInteger(colorId) ||
            colorId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product color ID",
            });
        }

        const color = await getProductColorById(
            productId,
            colorId
        );

        return res.status(200).json({
            success: true,
            message: "Product color retrieved successfully",
            data: color,
        });
    } catch (error) {
        next(error);
    }
};

export const createProductColorController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const productId = Number(req.params.productId);

        if (
            !Number.isSafeInteger(productId) ||
            productId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const validation = createProductColorSchema.safeParse(
            req.body
        );

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid product color data",
                errors: validation.error.issues,
            });
        }

        const color = await createProductColor(
            productId,
            validation.data
        );

        return res.status(201).json({
            success: true,
            message: "Product color created successfully",
            data: color,
        });
    } catch (error) {
        next(error);
    }
};

export const updateProductColorController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const productId = Number(req.params.productId);
        const colorId = Number(req.params.id);

        if (
            !Number.isSafeInteger(productId) ||
            productId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        if (
            !Number.isSafeInteger(colorId) ||
            colorId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product color ID",
            });
        }

        const validation = updateProductColorSchema.safeParse(
            req.body
        );

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid product color data",
                errors: validation.error.issues,
            });
        }

        if (Object.keys(validation.data).length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one field must be provided",
            });
        }

        const color = await updateProductColor(
            productId,
            colorId,
            validation.data
        );

        return res.status(200).json({
            success: true,
            message: "Product color updated successfully",
            data: color,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProductColorController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const productId = Number(req.params.productId);
        const colorId = Number(req.params.id);

        if (
            !Number.isSafeInteger(productId) ||
            productId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        if (
            !Number.isSafeInteger(colorId) ||
            colorId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product color ID",
            });
        }

        await deleteProductColor(productId, colorId);

        return res.status(200).json({
            success: true,
            message: "Product color deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};
