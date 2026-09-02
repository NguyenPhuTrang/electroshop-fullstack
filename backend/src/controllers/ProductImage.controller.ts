import { NextFunction, Request, Response } from "express";
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

    const validation = createProductImageSchema.safeParse(req.body);

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

    const images = await getProductImages(productId);

    return res.status(200).json({
      success: true,
      message: "Product images retrieved successfully",
      data: images,
    });
  } catch (error) {
    next(error);
  }
};

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

    const validation = updateProductImageSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid product image data",
        errors: validation.error.issues,
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