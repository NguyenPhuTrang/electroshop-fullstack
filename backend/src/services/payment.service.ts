import { prisma } from "../config/prisma";
import { PaymentStatus } from "../generated/prisma/enums";
import { AppError } from "../utils/AppError";

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
        throw new AppError("Payment not found", 404);
    }

    return payment;
};

export const updatePaymentStatus = async (
    paymentId: number,
    status: PaymentStatus
) => {
    const payment = await prisma.payment.findUnique({
        where: {
            id: paymentId,
        },
    });

    if (!payment) {
        throw new AppError("Payment not found", 404);
    }

    const allowedTransitions: Record<
        PaymentStatus,
        PaymentStatus[]
    > = {
        PENDING: [
            PaymentStatus.PROCESSING,
            PaymentStatus.PAID,
            PaymentStatus.FAILED,
            PaymentStatus.CANCELLED,
        ],
        PROCESSING: [
            PaymentStatus.PAID,
            PaymentStatus.FAILED,
        ],
        PAID: [
            PaymentStatus.REFUNDED,
        ],
        FAILED: [],
        CANCELLED: [],
        REFUNDED: [],
    };

    const allowedStatuses = allowedTransitions[payment.status];

    if (!allowedStatuses.includes(status)) {
        throw new AppError(
            "Invalid payment status transition",
            400
        );
    }

    return prisma.payment.update({
        where: {
            id: paymentId,
        },
        data: {
            status,
            paidAt:
                status === PaymentStatus.PAID
                    ? new Date()
                    : payment.paidAt,
        },
    });
};