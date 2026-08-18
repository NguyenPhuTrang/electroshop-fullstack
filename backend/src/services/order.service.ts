import { prisma } from "../config/prisma";
import { PaymentMethod, PaymentStatus } from "../generated/prisma/enums";

interface CreateOrderData {
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    shippingCity: string;
    shippingDistrict: string;
    note?: string;
    paymentMethod: PaymentMethod;// "VNPAY" | "STRIPE" | "COD" ...
}

export const createOrder = async (
    userId: number,
    data: CreateOrderData
) => {
    return prisma.$transaction(async (tx) => {
        // 1. Lấy Cart của user
        const cart = await tx.cart.findUnique({
            where: {
                userId,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        // 2. Kiểm tra Cart
        if (!cart || cart.items.length === 0) {
            throw new Error("Cart is empty");
        }

        // 3. Tính subtotal
        const subtotal = cart.items.reduce((sum, item) => {
            return (
                sum +
                Number(item.product.salePrice ?? item.product.price) *
                    item.quantity
            );
        }, 0);

        // 4. Phí ship và discount
        const shippingFee = 0;
        const discount = 0;

        // 5. Tổng tiền
        const total = subtotal + shippingFee - discount;

        // 6. Tạo Order Number (thêm suffix random để tránh trùng)
        const orderNumber = `ORD-${Date.now()}-${Math.floor(
            Math.random() * 1000
        )}`;

        // 7. Tạo Order
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
                subtotal,
                shippingFee,
                discount,
                total,
                items: {
                    create: cart.items.map((item) => ({
                        productId: item.productId,
                        productName: item.product.name,
                        productSku: item.product.sku,
                        price: item.product.salePrice ?? item.product.price,
                        quantity: item.quantity,
                        subtotal:
                            Number(
                                item.product.salePrice ?? item.product.price
                            ) * item.quantity,
                    })),
                },
            },
            include: {
                items: true,
            },
        });

        // 8. Trừ stock (atomic - tự kiểm tra đủ hàng ngay trong update)
        for (const item of cart.items) {
            const updateResult = await tx.product.updateMany({
                where: {
                    id: item.productId,
                    stock: { gte: item.quantity }, // chỉ trừ nếu đủ hàng
                },
                data: {
                    stock: { decrement: item.quantity },
                },
            });

            // Nếu không có dòng nào được update -> không đủ hàng
            // -> throw Error -> Prisma tự rollback toàn bộ transaction (order, v.v...)
           if (!cart || cart.items.length === 0) {
                throw new Error("Cart is empty");
            }

            // 3. Kiểm tra stock
            for (const item of cart.items) {
                if (item.product.stock < item.quantity) {
                    throw new Error(
                        `Insufficient stock for product: ${item.product.name}`
                    );
                }
            }

            // 4. Tính subtotal
            const subtotal = cart.items.reduce((sum, item) => {
                return (
                    sum +
                    Number(item.product.salePrice ?? item.product.price) *
                        item.quantity
                );
            }, 0);
        }

        // 9. Tạo Payment record (trạng thái pending, chưa gọi API bên ngoài)
        const payment = await tx.payment.create({
            data: {
                orderId: order.id,
                amount: total,
                method: data.paymentMethod,
                status: PaymentStatus.PENDING,
            },
        });

        // 10. Xóa CartItem
        await tx.cartItem.deleteMany({
            where: {
                cartId: cart.id,
            },
        });

        // 11. Trả Order + Payment
        return { order, payment };
    });
};