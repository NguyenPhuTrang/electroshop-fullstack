import z from "zod";
import { PaymentStatus } from "../generated/prisma/enums";

export const updatePaymentStatusSchema = z.object({
    status : z.enum(PaymentStatus),
})