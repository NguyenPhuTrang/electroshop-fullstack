import { prisma } from "../config/prisma";
import {
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
} from "../generated/prisma/enums";
import { AppError } from "../utils/AppError";

interface CreateOrderData {
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    shippingCity: string;
    shippingDistrict: string;
    note?: string;
    paymentMethod: PaymentMethod;
}

export const createOrder = async (
    userId: number,
    data: CreateOrderData
) => {
    return prisma.$transaction(async (tx) => {
        const cart = await tx.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: {
                            include: {
                                colorOption: true,
                            },
                        },
                    },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            throw new AppError("Cart is empty", 400);
        }

        const orderItems: {
            productId: number;
            variantId: number;
            productName: string;
            productSku: string;
            price: number;
            quantity: number;
            subtotal: number;
        }[] = [];

        let subtotalCents = 0;

        for (const item of cart.items) {
            const product = item.product;
            const variant = item.variant;

            if (product.status !== "ACTIVE") {
                throw new AppError(
                    `Product is not available: ${product.name}`,
                    400
                );
            }

            if (
                item.variantId === null ||
                !variant ||
                variant.productId !== product.id
            ) {
                throw new AppError(
                    `A valid product variant is required for ${product.name}`,
                    400
                );
            }

            if (variant.status !== "ACTIVE") {
                throw new AppError(
                    `Product variant is not available: ${product.name}`,
                    400
                );
            }

            const unitPrice = Number(
                variant.salePrice ?? variant.price
            );

            const unitPriceCents = Math.round(
                unitPrice * 100
            );

            const lineSubtotalCents =
                unitPriceCents * item.quantity;

            subtotalCents += lineSubtotalCents;

            const variantDescription = [
                variant.storage,
                variant.colorOption?.name,
            ]
                .filter(Boolean)
                .join(" / ");

            const productName = variantDescription
                ? `${product.name} (${variantDescription})`
                : product.name;

            orderItems.push({
                productId: product.id,
                variantId: variant.id,
                productName,
                productSku: variant.sku,
                price: unitPriceCents / 100,
                quantity: item.quantity,
                subtotal: lineSubtotalCents / 100,
            });
        }

        for (const item of orderItems) {
            const updateResult =
                await tx.productVariant.updateMany({
                    where: {
                        id: item.variantId,
                        productId: item.productId,
                        status: "ACTIVE",
                        stock: {
                            gte: item.quantity,
                        },
                    },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });

            if (updateResult.count !== 1) {
                throw new AppError(
                    `Insufficient stock for variant: ${item.productSku}`,
                    400
                );
            }
        }

        const shippingFeeCents = 0;
        const discountCents = 0;

        const totalCents =
            subtotalCents +
            shippingFeeCents -
            discountCents;

        const orderNumber =
            `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const order = await tx.order.create({
            data: {
                userId,
                orderNumber,
                shippingName: data.shippingName,
                shippingPhone: data.shippingPhone,
                shippingAddress: data.shippingAddress,
                shippingCity: data.shippingCity,
                shippingDistrict: data.shippingDistrict,
                note: data.note,
                subtotal: subtotalCents / 100,
                shippingFee: shippingFeeCents / 100,
                discount: discountCents / 100,
                total: totalCents / 100,
                items: {
                    create: orderItems.map((item) => ({
                        productId: item.productId,
                        variantId: item.variantId,
                        productName: item.productName,
                        productSku: item.productSku,
                        price: item.price,
                        quantity: item.quantity,
                        subtotal: item.subtotal,
                    })),
                },
            },
            include: {
                items: true,
            },
        });

        const payment = await tx.payment.create({
            data: {
                orderId: order.id,
                amount: totalCents / 100,
                method: data.paymentMethod,
                status: PaymentStatus.PENDING,
            },
        });

        await tx.cartItem.deleteMany({
            where: {
                cartId: cart.id,
            },
        });

        return { order, payment };
    });
};

export const getOrdersByUserId = async (
    userId: number
) => {
    return prisma.order.findMany({
        where: {
            userId,
        },
        include: {
            items: true,
            payment: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

export const getOrderById = async (
    orderId: number,
    userId: number
) => {
    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            userId,
        },
        include: {
            items: true,
            payment: true,
        },
    });

    if (!order) {
        throw new AppError("Order not found", 404);
    }

    return order;
};

export const getAdminOrderById = async (
    orderId: number
) => {
    const order = await prisma.order.findUnique({
        where: {
            id: orderId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            items: true,
            payment: true,
        },
    });

    if (!order) {
        throw new AppError("Order not found", 404);
    }

    return order;
};

export const updateOrderStatus = async (
    orderId: number,
    status: OrderStatus
) => {
    return prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
            where: {
                id: orderId,
            },
            include: {
                items: true,
                payment: true,
            },
        });

        if (!order) {
            throw new AppError("Order not found", 404);
        }

        const allowedTransitions: Record<
            OrderStatus,
            OrderStatus[]
        > = {
            PENDING: ["CONFIRMED", "CANCELLED"],
            CONFIRMED: ["PROCESSING", "CANCELLED"],
            PROCESSING: ["SHIPPED"],
            SHIPPED: ["DELIVERED"],
            DELIVERED: [],
            CANCELLED: [],
        };

        if (
            !allowedTransitions[order.status].includes(status)
        ) {
            throw new AppError(
                "Invalid order status transition",
                400
            );
        }

        if (
            status === "CANCELLED" &&
            order.items.some((item) => item.variantId === null)
        ) {
            throw new AppError(
                "This order contains an item without a variant. Manual inventory review is required before cancellation.",
                409
            );
        }

        const transitionResult = await tx.order.updateMany({
            where: {
                id: orderId,
                status: order.status,
            },
            data: {
                status,
            },
        });

        if (transitionResult.count !== 1) {
            throw new AppError(
                "Order status has changed. Please refresh and try again.",
                409
            );
        }

        if (status === "CANCELLED") {
            for (const item of order.items) {
                if (item.variantId === null) {
                    throw new AppError(
                        `Cannot restore stock for legacy order item: ${item.productSku}`,
                        409
                    );
                }

                const result =
                    await tx.productVariant.updateMany({
                        where: {
                            id: item.variantId,
                            productId: item.productId,
                        },
                        data: {
                            stock: {
                                increment: item.quantity,
                            },
                        },
                    });

                if (result.count !== 1) {
                    throw new AppError(
                        `Product variant not found: ${item.productSku}`,
                        404
                    );
                }
            }

            if (
                order.payment &&
                (
                    order.payment.status === PaymentStatus.PENDING ||
                    order.payment.status === PaymentStatus.PROCESSING
                )
            ) {
                await tx.payment.update({
                    where: {
                        id: order.payment.id,
                    },
                    data: {
                        status: PaymentStatus.CANCELLED,
                    },
                });
            }
        }

        const updatedOrder = await tx.order.findUnique({
            where: {
                id: orderId,
            },
            include: {
                items: true,
                payment: true,
            },
        });

        if (!updatedOrder) {
            throw new AppError("Order not found", 404);
        }

        return updatedOrder;
    });
};

export const getAllOrders = async (
    page: number,
    limit: number,
    status?: OrderStatus,
    search?: string
) => {
    const skip = (page - 1) * limit;

    const where = {
        ...(status && {
            status,
        }),
        ...(search && {
            orderNumber: {
                contains: search,
                mode: "insensitive" as const,
            },
        }),
    };

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            skip,
            take: limit,
            include: {
                items: true,
                payment: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        }),

        prisma.order.count({
            where,
        }),
    ]);

    return {
        orders,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const cancelOrder = async (
    orderId: number,
    userId: number
) => {
    return prisma.$transaction(async (tx) => {
        const order = await tx.order.findFirst({
            where: {
                id: orderId,
                userId,
            },
            include: {
                items: true,
                payment: true,
            },
        });

        if (!order) {
            throw new AppError("Order not found", 404);
        }

        if (order.status !== "PENDING") {
            throw new AppError(
                "Only pending orders can be cancelled",
                400
            );
        }

        if (
            order.items.some((item) => item.variantId === null)
        ) {
            throw new AppError(
                "This order contains an item without a variant. Manual inventory review is required before cancellation.",
                409
            );
        }

        const cancellationResult = await tx.order.updateMany({
            where: {
                id: orderId,
                userId,
                status: "PENDING",
            },
            data: {
                status: "CANCELLED",
            },
        });

        if (cancellationResult.count !== 1) {
            throw new AppError(
                "Order status has changed. Please refresh and try again.",
                409
            );
        }

        for (const item of order.items) {
            if (item.variantId === null) {
                throw new AppError(
                    `Cannot restore stock for legacy order item: ${item.productSku}`,
                    409
                );
            }

            const result =
                await tx.productVariant.updateMany({
                    where: {
                        id: item.variantId,
                        productId: item.productId,
                    },
                    data: {
                        stock: {
                            increment: item.quantity,
                        },
                    },
                });

            if (result.count !== 1) {
                throw new AppError(
                    `Product variant not found: ${item.productSku}`,
                    404
                );
            }
        }

        if (
            order.payment &&
            (
                order.payment.status === PaymentStatus.PENDING ||
                order.payment.status === PaymentStatus.PROCESSING
            )
        ) {
            await tx.payment.update({
                where: {
                    id: order.payment.id,
                },
                data: {
                    status: PaymentStatus.CANCELLED,
                },
            });
        }

        const cancelledOrder = await tx.order.findUnique({
            where: {
                id: orderId,
            },
            include: {
                items: true,
                payment: true,
            },
        });

        if (!cancelledOrder) {
            throw new AppError("Order not found", 404);
        }

        return cancelledOrder;
    });
};

export const getAdminOrdersByUserId = async (
    userId: number,
    page: number,
    limit: number,
    status?: OrderStatus,
    search?: string
) => {
    const skip = (page - 1) * limit;

    const where = {
        userId,
        ...(status && {
            status,
        }),
        ...(search && {
            orderNumber: {
                contains: search,
                mode: "insensitive" as const,
            },
        }),
    };

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            skip,
            take: limit,
            include: {
                items: true,
                payment: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        }),

        prisma.order.count({
            where,
        }),
    ]);

    return {
        orders,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};