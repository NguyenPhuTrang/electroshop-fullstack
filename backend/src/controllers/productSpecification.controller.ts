import { Request, Response, NextFunction } from "express";

import {
    createBulkProductSpecificationsSchema,
    createProductSpecificationSchema,
    replaceProductSpecificationsSchema,
    updateProductSpecificationSchema,
} from "../validations/productSpecification.validation";

import {
    createBulkProductSpecifications,
    createProductSpecification,
    deleteProductSpecification,
    getProductSpecificationById,
    getProductSpecifications,
    replaceProductSpecifications,
    updateProductSpecification,
} from "../services/productSpecification.service";

export const getProductSpecificationsController = async (
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

        const specifications =
            await getProductSpecifications(productId);

        return res.status(200).json({
            success: true,
            message: "Product specifications retrieved successfully",
            data: specifications,
        });
    } catch (error) {
        next(error);
    }
};

export const getProductSpecificationByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid specification ID",
            });
        }

        const specification =
            await getProductSpecificationById(id);

        return res.status(200).json({
            success: true,
            message: "Product specification retrieved successfully",
            data: specification,
        });
    } catch (error) {
        next(error);
    }
};

// Create a specification
export const createProductSpecificationController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const validation =
            createProductSpecificationSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid product specification data",
                error: validation.error.issues,
            });
        }

        const specification =
            await createProductSpecification(validation.data);

        return res.status(201).json({
            success: true,
            message: "Product specification created successfully",
            data: specification,
        });
    } catch (error) {
        next(error);
    }
};

export const updateProductSpecificationController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid specification ID",
            });
        }

        const validation =
            updateProductSpecificationSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid product specification data",
                error: validation.error.issues,
            });
        }

        if (Object.keys(validation.data).length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one field must be provided",
            });
        }

        const specification = await updateProductSpecification(
            id,
            validation.data
        );

        return res.status(200).json({
            success: true,
            message: "Product specification updated successfully",
            data: specification,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProductSpecificationController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid specification ID",
            });
        }

        await deleteProductSpecification(id);

        return res.status(200).json({
            success: true,
            message: "Product specification deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

// Create multiple specifications for a product
export const createBulkProductSpecificationsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Validate request body
        const validation =
            createBulkProductSpecificationsSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid product specifications data",
                error: validation.error.issues,
            });
        }

        // Create multiple specifications
        const result = await createBulkProductSpecifications(
            validation.data
        );

        return res.status(201).json({
            success: true,
            message: "Product specifications created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const replaceProductSpecificationsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // 1. Get product ID from URL
        const productId = Number(req.params.productId);

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        // 2. Validate request body
        const validation =
            replaceProductSpecificationsSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid product specifications data",
                error: validation.error.issues,
            });
        }

        const specifications = await replaceProductSpecifications(
            productId,
            validation.data.specifications
        );

        return res.status(200).json({
            success: true,
            message: "Product specifications replaced successfully",
            data: specifications,
        });
    } catch (error) {
        next(error);
    }
};