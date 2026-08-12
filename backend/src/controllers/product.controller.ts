import { Request, Response } from "express";
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from "../services/product.service";
import {
  createProductSchema,
  updateProductSchema,
} from "../validations/product.validation";
import { Prisma } from "../generated/prisma/client";

export const getProductsController = async (
  req: Request,
  res: Response
) => {
  try {
    const products = await getProducts();

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to get products",
    });
  }
};

export const getProductByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to get product",
    });
  }
};

export const createProductController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = createProductSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid product data",
        errors: result.error.issues,
      });
    }

    const product = await createProduct(result.data);

    return res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = (error.meta?.target as string[])?.join(", ");
      return res.status(409).json({
        success: false,
        message: `Sản phẩm với ${target || "trường"} này đã tồn tại`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

export const updateProductController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

const result = updateProductSchema.safeParse(req.body);

if (!result.success) {
  return res.status(400).json({
    success: false,
    message: "Invalid product data",
    errors: result.error.issues,
  });
}

const product = await updateProduct(id, result.data);

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

export const deleteProductController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if(Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await deleteProduct(id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

