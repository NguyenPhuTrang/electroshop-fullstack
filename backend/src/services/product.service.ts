import z from "zod";
import { prisma } from "../config/prisma";
import { createProductSchema } from "../validations/product.validation";
import { AppError } from "../utils/AppError";

export const getProducts = async () => {
  return prisma.product.findMany({
    include: {
      brand: true,
      category: true,
      images: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getProductById = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
      brand: true,
      images: true,
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

export const createProduct = async (
  data: z.infer<typeof createProductSchema>
) => {
  const existingProduct = await prisma.product.findFirst({
    where: {
      OR: [
        { slug: data.slug },
        { sku: data.sku },
      ],
    },
  });

  if (existingProduct) {
    if (existingProduct.slug === data.slug) {
      throw new AppError("Product slug already exists", 409);
    }

    if (existingProduct.sku === data.sku) {
      throw new AppError("Product SKU already exists", 409);
    }
  }

  return prisma.product.create({
    data,
    include: {
      category: true,
      brand: true,
      images: true,
    },
  });
};

export const updateProduct = async (
  id: number,
  data: {
    name?: string;
    slug?: string;
    sku?: string;
    description?: string;
    price?: number;
    stock?: number;
    categoryId?: number;
    brandId?: number;
  }
) => {
  const existingProduct = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  if (data.slug || data.sku) {
    const duplicateProduct = await prisma.product.findFirst({
      where: {
          OR: [
            ...(data.slug ? [{ slug: data.slug }] : []),
            ...(data.sku ? [{ sku: data.sku }] : []),
          ],
              NOT: {
          id,
        },
      },
    });

    if (duplicateProduct) {
      if (data.slug && duplicateProduct.slug === data.slug) {
        throw new AppError("Product slug already exists", 409);
      }

      if (data.sku && duplicateProduct.sku === data.sku) {
        throw new AppError("Product SKU already exists", 409);
      }
    }
  }

  return prisma.product.update({
    where: {
      id,
    },
    data: {
      ...data,
    },
    include: {
      category: true,
      brand: true,
      images: true,
    },
  });
};

export const deleteProduct = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return prisma.product.delete({
    where: {
      id,
    },
  });
};