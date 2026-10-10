import z from "zod";
import crypto from "crypto";

import { prisma } from "../config/prisma";
import { createProductSchema } from "../validations/product.validation";
import { AppError } from "../utils/AppError";
import { Prisma } from "../generated/prisma/client";
import cloudinary from "../config/cloudinary";
import { error } from "console";

export const getProducts = async (
  search?: string,
  categoryId?: number,
  brandId?: number,
  minPrice?: number,
  maxPrice?: number,
  sort?: string,
  page: number = 1,
  limit: number = 10,
) => {
  let orderBy;

  switch (sort) {
    case "price_asc":
      orderBy = {
        price: "asc" as const,
      };
      break;

    case "price_desc":
      orderBy = {
        price: "desc" as const,
      };
      break;

    case "newest":
    default:
      orderBy = {
        createdAt: "desc" as const,
      };
      break;
  }

  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    }),

    ...(categoryId !== undefined && {
      categoryId,
    }),

    ...(brandId !== undefined && {
      brandId,
    }),

    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          price: {
            ...(minPrice !== undefined && {
              gte: minPrice,
            }),
            ...(maxPrice !== undefined && {
              lte: maxPrice,
            }),
          },
        }
      : {}),
  };

  const products = await prisma.product.findMany({
    where,
    include: {
      brand: true,
      category: true,
      images: true,
    },
    orderBy,
    skip,
    take: limit,
  });

  const total = await prisma.product.count({
    where,
  });

  const totalPages = Math.ceil(total / limit);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

export const getAdminProducts = async (
  search?: string,
  categoryId?: number,
  brandId?: number,
  minPrice?: number,
  maxPrice?: number,
  sort?: string,
  page: number = 1,
  limit: number = 10,
  lowStock: boolean = false
) => {
  let orderBy;

  switch (sort) {
    case "price_asc":
      orderBy = {
        price: "asc" as const,
      };
      break;

    case "price_desc":
      orderBy = {
        price: "desc" as const,
      };
      break;

    case "newest":
    default:
      orderBy = {
        createdAt: "desc" as const,
      };
      break;
  }

  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    ...(lowStock // ... lấy các thuộc tính của object được trả về và đưa chúng vào where.
  ? {
      status: "ACTIVE" as const, // lowStock = true → chỉ hiển thị sản phẩm ACTIVE có stock ≤ 10
      stock: {
        lte: 10,
      },
    }
  : {}), // lowStock = false → chỉ hiển thị sản phẩm ACTIVE có stock ≤ 10 
    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    }),

    ...(categoryId !== undefined && {
      categoryId,
    }),

    ...(brandId !== undefined && {
      brandId,
    }),

    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          price: {
            ...(minPrice !== undefined && {
              gte: minPrice,
            }),
            ...(maxPrice !== undefined && {
              lte: maxPrice,
            }),
          },
        }
      : {}),
  };

  const products = await prisma.product.findMany({
    where,
    include: {
      brand: true,
      category: true,
      images: true,
    },
    orderBy,
    skip,
    take: limit,
  });

  const total = await prisma.product.count({
    where,
  });

  const totalPages = Math.ceil(total / limit);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

export const getProductById = async (
  id: number,
  includeInactive: boolean = false
) => {
  const product = await prisma.product.findFirst({
    where: {
      id,
      ...(!includeInactive && {
        status: "ACTIVE",
      }),
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

export const getProductBySlug = async (
  slug: string,
  isAdmin: boolean = false
) => {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      ...(!isAdmin && {
        status: "ACTIVE",
      }),
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
  // Check duplicate slug
  const existingProduct = await prisma.product.findUnique({
    where: {
      slug: data.slug,
    },
  });

  if (existingProduct) {
    throw new AppError(
      "Product slug already exists",
      409
    );
  }

  // Generate unique SKU
  let sku = generateSku(data.name);

  while (
    await prisma.product.findUnique({
      where: {
        sku,
      },
    })
  ) {
    sku = generateSku(data.name);
  }

  // Upload image URLs to Cloudinary
  const uploadedImages = data.images
    ? await Promise.all(
        data.images.map(async (image) => {
          const result = await cloudinary.uploader.upload(
            image.url,
            {
              folder: "electroshop/products",
              resource_type: "image",
            }
          );

          return {
            url: result.secure_url,
            isPrimary: image.isPrimary,
          };
        })
      )
    : [];

  // Remove images before creating Product
  const { images, ...productData } = data;

  return prisma.product.create({
    data: {
      ...productData,
      sku,

      images:
        uploadedImages.length > 0
          ? {
              create: uploadedImages,
            }
          : undefined,
    },

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
    salePrice?: number | null;
    stock?: number;
    categoryId?: number;
    brandId?: number;
    images?: {
      url:string,
      isPrimary: boolean;
    }[];
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
      if (
        data.slug &&
        duplicateProduct.slug === data.slug
      ) {
        throw new AppError(
          "Product slug already exists",
          409
        );
      }

      if (
        data.sku &&
        duplicateProduct.sku === data.sku
      ) {
        throw new AppError(
          "Product SKU already exists",
          409
        );
      }
    }
  }

  const { images, ...productData } = data; //Lấy images ra để xử lý riêng, còn toàn bộ dữ liệu sản phẩm còn lại cho vào productData , productData là phần nhận tất cả những property còn lại: product lấy ra qua id mà frontend truyền lên

  await prisma.product.update({
    where: {
      id,
    },
    data: productData,
  });

  if (images !== undefined) {
    const uploadedImages = await Promise.all(
      images.map(async (image) => {
        const result = await cloudinary.uploader.upload(
          image.url,
          {
            folder: "electroshop/products",
            resource_type: "image",
          }
        );

        return {
          url: result.secure_url,
          isPrimary: image.isPrimary,
        };
      })
    );

    await prisma.productImage.deleteMany({
      where: {
        productId: id,
      },
    });

    if (uploadedImages.length > 0) {
      await prisma.productImage.createMany({
        data: uploadedImages.map((image) => ({
          productId: id,
          url: image.url,
          isPrimary: image.isPrimary,
        })),
      });
    }
  }
};

export const deleteProduct = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      _count: { // trong Prisma dùng để đếm số bản ghi liên quan
        select: {
          orderItems: true,
          reviews: true,
        },
      },
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const hasRelatedData =
    product._count.orderItems > 0 ||
    product._count.reviews > 0;

  // Keep product in database if it has order history or reviews
  if (hasRelatedData) {
    return prisma.product.update({
      where: {
        id,
      },
      data: {
        status: "INACTIVE",
      },
      include: {
        category: true,
        brand: true,
        images: true,
      },
    });
  }

  // Hard delete if product has no order history or reviews
  return prisma.product.delete({
    where: {
      id,
    },
  });
};


const generateSku = (name: string) => {
  const prefix =
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 12) || "PRODUCT";

  const random = crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase();

  return `${prefix}-${random}`;
};
