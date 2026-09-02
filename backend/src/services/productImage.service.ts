import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";

export const createProductImage = async (
  productId: number,
  data: {
    url: string;
    alt?: string;
    isPrimary?: boolean;
    sortOder?: number;
  }
) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // Nếu ảnh mới là ảnh chính,
  // tắt isPrimary của ảnh chính cũ
  if (data.isPrimary === true) {
    await prisma.productImage.updateMany({
      where: {
        productId,
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    });
  }

  return prisma.productImage.create({
    data: {
      productId,
      url: data.url,
      alt: data.alt,
      isPrimary: data.isPrimary ?? false,
      sortOrder: data.sortOder ?? 0,
    },
  });
};

export const getProductImages = async (
  productId: number
) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return prisma.productImage.findMany({
    where: {
      productId,
    },
    orderBy: {
      sortOrder: "desc",
    },
  });
};

export const getProductImageById = async (
  imageId: number
) => {
  const image = await prisma.productImage.findUnique({
    where: {
      id: imageId,
    },
  });

  if (!image) {
    throw new AppError("Product image not found", 404);
  }

  return image;
};

export const updateProductImage = async (
  imageId: number,
  data: {
    url?: string;
    alt?: string;
    isPrimary?: boolean;
    sortOrder?: number;
  }
) => {
  const existingImage = await prisma.productImage.findUnique({
    where: {
      id: imageId,
    },
  });

  if (!existingImage) {
    throw new AppError("Product image not found", 404);
  }

  // Nếu muốn ảnh này trở thành ảnh chính
  if (data.isPrimary === true) {
    await prisma.productImage.updateMany({
      where: {
        productId: existingImage.productId,
        isPrimary: true,
        NOT: {
          id: imageId,
        },
      },
      data: {
        isPrimary: false,
      },
    });
  }

  return prisma.productImage.update({
    where: {
      id: imageId,
    },
    data: {
      ...(data.url !== undefined && {
        url: data.url,
      }),
      ...(data.alt !== undefined && {
        alt: data.alt,
      }),
      ...(data.isPrimary !== undefined && {
        isPrimary: data.isPrimary,
      }),
      ...(data.sortOrder !== undefined && {
        sortOrder: data.sortOrder,
      }),
    },
  });
};

export const deleteProductImage = async (
  imageId: number
) => {
  const imageExisting = await prisma.productImage.findUnique({
    where: {
      id: imageId,
    },
  });

  if (!imageExisting) {
    throw new AppError("Product image not found", 404);
  }

  return prisma.productImage.delete({
    where: {
      id: imageId,
    },
  });
};