import { z } from "zod";

export const createBrandSchema = z.object({
    name: z
    .string()
    .trim()
    .min(1, "Brand name is required"),

    slug: z
    .string()
    .trim()
    .min(1, "Brand slug is required"),

    description: z
    .string()
    .trim()
    .optional(),

    logo: z
    .string()
    .trim()
    .optional(),
});

export const updateBrandSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Brand name is required")
        .optional(),

    slug: z
        .string()
        .trim()
        .min(1, "Brand slug is required")
        .optional(),

    description: z
        .string()
        .trim()
        .optional(),

    logo: z
        .string()
        .trim()
        .optional(),
});

