import { Request, Response } from "express";
import { createOrderSchema } from "../validations/order.validation";
import { createOrder } from "../services/order.service";


export const createOrderController = async (
    req: Request,
    res: Response
) => {
    try {
        // 1. Validate request body
        const result = createOrderSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid order data",
                errors: result.error.issues,
            });
        }

        // 2. Lấy userId từ access token
        const userId = req.user!.userId;

        // 3. Tạo Order
        const resultOrder = await createOrder(
            userId,
            result.data
        );

        // 4. Response
        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: resultOrder,
        });
    } catch (error) {
        console.error(error);

        // Cart không tồn tại hoặc Cart không có sản phẩm
        if (
            error instanceof Error &&
            error.message === "Cart is empty"
        ) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        // Stock không đủ
        if (
            error instanceof Error &&
            error.message.startsWith("Insufficient stock")
        ) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create order",
        });
    }
};