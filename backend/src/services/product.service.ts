import z from "zod";
import { prisma } from "../config/prisma";
import { createProductSchema } from "../validations/product.validation";
export const getProducts = async () => {
  return prisma.product.findMany({
    include: {
      brand : true,
      category : true,
      images : true,
    },
    orderBy : {
      createdAt : "desc"
    }
  });
};

export const getProductById = async (id: number) => {
  return prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
      brand: true,
      images: true,
    },
  });
};

export const createProduct = async (
  data: z.infer<typeof createProductSchema>
) => {
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
  return prisma.product.delete({
    where: {
        id,
    },
    })
};