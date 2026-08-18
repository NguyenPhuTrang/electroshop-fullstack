import { z } from "zod";
import { PaymentMethod } from "../generated/prisma/enums";

export const createOrderSchema = z.object({
    shippingName: z
        .string()
        .min(2, "Shipping name is required"),

    shippingPhone: z
        .string()
        .min(8, "Invalid shipping phone"),

    shippingAddress: z
        .string()
        .min(5, "Shipping address is required"),

    shippingCity: z
        .string()
        .min(2, "Shipping city is required"),

    shippingDistrict: z
        .string()
        .min(2, "Shipping district is required"),

    note: z
        .string()
        .optional(),

    paymentMethod: z.enum(PaymentMethod),
});