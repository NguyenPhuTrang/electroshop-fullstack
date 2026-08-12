import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be greater than 0"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  categoryId: z.number().int().positive(),
  brandId: z.number().int().positive(),
});

export const updateProductSchema = createProductSchema.partial();