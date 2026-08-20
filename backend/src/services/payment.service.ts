import { prisma } from "../config/prisma";
import { PaymentStatus } from "../generated/prisma/enums";

export const getPaymentById = async (
    paymentId: number,
    userId: number
) => {
    const payment = await prisma.payment.findFirst({
        where: {
            id: paymentId,
            order: {
                userId,
            },
        },
        include: {
            order: true,
        },
    });
    
    if(!payment)
    {
        throw new Error("Payment not found");
    }

    return payment;
};

export const updatePaymentStatus = async (
    paymentId: number,
    status: PaymentStatus
) => {
    const payment = await prisma.payment.findUnique({
        where: {
            id:paymentId,
        },
    });

    if(!payment) {
        throw new Error ("Payment not found");
    }

    const updatePayment = await prisma.payment.update({
        where: {
            id: paymentId,
        },
        data: {
            status,
            paidAt: status === PaymentStatus.PAID
            ? new Date()
            : payment.paidAt,
        },
    });

    return updatePayment;

}