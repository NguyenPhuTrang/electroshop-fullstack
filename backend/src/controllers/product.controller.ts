import { NextFunction, Request, Response } from "express";
import { createProduct, deleteProduct, getAdminProducts, getProductById, getProductBySlug, getProducts, updateProduct } from "../services/product.service";
import {
  createProductSchema,
  updateProductSchema,
} from "../validations/product.validation";

export const getProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const search = req.query.search as string | undefined;

    const categoryId = req.query.categoryId
      ? Number(req.query.categoryId)
      : undefined;

    const brandId = req.query.brandId
      ? Number(req.query.brandId)
      : undefined;

    const minPrice = req.query.minPrice
      ? Number(req.query.minPrice)
      : undefined;

    const maxPrice = req.query.maxPrice
      ? Number(req.query.maxPrice)
      : undefined;

    const sort = req.query.sort
      ? String(req.query.sort)
      : undefined;

    const page = req.query.page
      ? Number(req.query.page)
      : 1;

    const limit = req.query.limit
      ? Number(req.query.limit)
      : 10;

    if (!Number.isInteger(page) || page <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid page",
      });
    }

    if (!Number.isInteger(limit) || limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid limit",
      });
    }

    if (
      categoryId !== undefined &&
      (!Number.isInteger(categoryId) || categoryId <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    if (
      brandId !== undefined &&
      (!Number.isInteger(brandId) || brandId <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid brand ID",
      });
    }

    if (
      maxPrice !== undefined &&
      (Number.isNaN(maxPrice) || maxPrice < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid maximum price",
      });
    }

    if (
      minPrice !== undefined &&
      (Number.isNaN(minPrice) || minPrice < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid minimum price",
      });
    }

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum price cannot be greater than maximum price",
      });
    }

    if (
      sort !== undefined &&
      !["price_asc", "price_desc", "newest"].includes(sort)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid sort option",
      });
    }

    const result = await getProducts(
      search,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      sort,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const search = req.query.search as string | undefined;

    const categoryId = req.query.categoryId
      ? Number(req.query.categoryId)
      : undefined;

    const brandId = req.query.brandId
      ? Number(req.query.brandId)
      : undefined;

    const minPrice = req.query.minPrice
      ? Number(req.query.minPrice)
      : undefined;

    const maxPrice = req.query.maxPrice
      ? Number(req.query.maxPrice)
      : undefined;

    const sort = req.query.sort
      ? String(req.query.sort)
      : undefined;

    const page = req.query.page
      ? Number(req.query.page)
      : 1;

    const limit = req.query.limit
      ? Number(req.query.limit)
      : 10;

    if (!Number.isInteger(page) || page <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid page",
      });
    }

    if (!Number.isInteger(limit) || limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid limit",
      });
    }

    if (
      categoryId !== undefined &&
      (!Number.isInteger(categoryId) || categoryId <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    if (
      brandId !== undefined &&
      (!Number.isInteger(brandId) || brandId <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid brand ID",
      });
    }

    if (
      maxPrice !== undefined &&
      (Number.isNaN(maxPrice) || maxPrice < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid maximum price",
      });
    }

    if (
      minPrice !== undefined &&
      (Number.isNaN(minPrice) || minPrice < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid minimum price",
      });
    }

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      return res.status(400).json({
        success: false,
        message: "Minimum price cannot be greater than maximum price",
      });
    }

    if (
      sort !== undefined &&
      !["price_asc", "price_desc", "newest"].includes(sort)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid sort option",
      });
    }

    const result = await getAdminProducts(
      search,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      sort,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const isAdmin = req.user?.role === "ADMIN";

    const product = await getProductById(id, isAdmin);

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProductByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await getProductById(id, true);

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlugController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    if (typeof slug !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid product slug",
      });
    }

    const isAdmin = req.user?.role === "ADMIN";

    const product = await getProductBySlug(slug, isAdmin);

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const createProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
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
    next(error);
  }
};

export const updateProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

const result = updateProductSchema.safeParse(req.body); // kiểm tra dữ liệu client có đúng với định dạng định nghĩa bên updateProductSchema không

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
      next(error);
    }
};

export const deleteProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
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
    next(error);
  }
};


   

