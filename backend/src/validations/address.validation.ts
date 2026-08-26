import z, { boolean } from "zod";

export const createAddressSChema = z.object({
    fullName: z
    .string()
    .trim()
    .min(1, "Full name is required"),

    phone: z
    .string()
    .trim()
    .min(1, "Phone is required"),

    address: z
    .string()
    .trim()
    .min(1,"Address is required"),

    city: z
    .string()
    .trim()
    .min(1,"City is required"),

    district: z
    .string()
    .trim()
    .min(1,"district is required"),

    postalCode: z
    .string()
    .trim()
    .optional(),

    isDefault: z
    .boolean()
    .optional()
    .default(false)

});

export const updateAddressSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(1)
        .optional(),

    phone: z
        .string()
        .trim()
        .min(1)
        .optional(),

    address: z
        .string()
        .trim()
        .min(1)
        .optional(),

    city: z
        .string()
        .trim()
        .min(1)
        .optional(),

    district: z
        .string()
        .trim()
        .min(1)
        .optional(),

    postalCode: z
        .string()
        .trim()
        .optional(),

    isDefault: z
        .boolean()
        .optional(),
});