import { z } from "zod";

export const createProductSpecificationSchema = z.object({
    productId: z
        .number()
        .int("Product ID must be an integer")
        .positive("Product ID must be greater than 0"),

    groupName: z
        .string()
        .trim()
        .min(1, "Group name cannot be empty")
        .nullable()
        .optional(),

    label: z
        .string()
        .trim()
        .min(1, "Specification label is required"),

    value: z
        .string()
        .trim()
        .min(1, "Specification value is required"),

    sortOrder: z
        .number()
        .int("Sort order must be an integer")
        .min(0, "Sort order cannot be negative")
        .optional(),
});

export const updateProductSpecificationSchema = z.object({
    groupName: z
        .string()
        .trim()
        .min(1, "Group name cannot be empty")
        .nullable()
        .optional(),

    label: z
        .string()
        .trim()
        .min(1, "Specification label is required")
        .optional(),

    value: z
        .string()
        .trim()
        .min(1, "Specification value is required")
        .optional(),

    sortOrder: z
        .number()
        .int("Sort order must be an integer")
        .min(0, "Sort order cannot be negative")
        .optional(),
});

export const createBulkProductSpecificationsSchema = z.object({
    productId: z
        .number()
        .int("Product ID must be an integer")
        .positive("Product ID must be greater than 0"),

    specifications: z
        .array(
            z.object({
                groupName: z
                    .string()
                    .trim()
                    .min(1, "Group name cannot be empty")
                    .nullable()
                    .optional(),

                label: z
                    .string()
                    .trim()
                    .min(1, "Specification label is required"),

                value: z
                    .string()
                    .trim()
                    .min(1, "Specification value is required"),

                sortOrder: z
                    .number()
                    .int("Sort order must be an integer")
                    .min(0, "Sort order cannot be negative")
                    .optional(),
            })
        )
        .min(1, "At least one specification is required"),
});

export const replaceProductSpecificationsSchema = z.object({
    specifications: z
        .array(
            z.object({
                groupName: z
                    .string()
                    .trim()
                    .min(1, "Group name cannot be empty")
                    .nullable()
                    .optional(),

                label: z
                    .string()
                    .trim()
                    .min(1, "Specification label is required"),

                value: z
                    .string()
                    .trim()
                    .min(1, "Specification value is required"),

                sortOrder: z
                    .number()
                    .int("Sort order must be an integer")
                    .min(0, "Sort order cannot be negative")
                    .optional(),
            })
        )
        .min(1, "At least one specification is required"),
});