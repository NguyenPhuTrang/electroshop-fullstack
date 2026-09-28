import { z } from "zod";

const productImageSchema = z.object({
  url: z.string().url("Invalid image URL"),
  isPrimary: z.boolean(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be greater than 0"),
  salePrice: z.number().min(0).nullable().optional(),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  categoryId: z.number().int().positive(),
  brandId: z.number().int().positive(),

  images: z.array(productImageSchema).optional(),
});

export const updateProductSchema = createProductSchema
  .omit({
    images: true,
  })
  .partial();
