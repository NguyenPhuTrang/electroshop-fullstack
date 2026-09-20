import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { uploadImageFromUrl } from "./upload.service";

export const createProductImage = async (
  productId: number,
  data: {
    url: string;
    alt?: string;
    isPrimary?: boolean;
    sortOrder?: number;
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

  const result = await uploadImageFromUrl (
    data.url,
    "electroshop/products"
  );

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
      url: result.secure_url,
      alt: data.alt,
      isPrimary: data.isPrimary ?? false,
      sortOrder: data.sortOrder ?? 0,
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

   let cloudinaryUrl: string | undefined;

  // Nếu có URL mới thì upload lên Cloudinary
  if (data.url !== undefined) {
    const result = await uploadImageFromUrl(
      data.url,
      "electroshop/products"
    );

    cloudinaryUrl = result.secure_url;
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
      ...(cloudinaryUrl !== undefined && {
        url: cloudinaryUrl,
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