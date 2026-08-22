import { Request, Response } from "express";
import { createOrderSchema } from "../validations/order.validation";
import { createOrder, getAllOrders, getOrderById, getOrdersByUserId, updateOrderStatus } from "../services/order.service";
import { object, success } from "zod";
import { OrderStatus } from "../generated/prisma/enums";


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

export const getOrdersController = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user!.userId;

        const orders = await getOrdersByUserId(userId);

        return res.status(200).json({
            success: true,
            message: "Orders retrieved successfully",
            data: orders,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve orders",
        });
    }
};

export const getOrderByIdController = async (
    req: Request,
    res: Response
) => {
    try {
        const orderId = Number(req.params.id);

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        const userId = req.user!.userId;

        const order = await getOrderById(
            orderId,
            userId
        );

        return res.status(200).json({
            success: true,
            message: "Order retrieved successfully",
            data: order,
        });
    } catch (error) {
        console.error(error);

        if (
            error instanceof Error &&
            error.message === "Order not found"
        ) {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve order",
        });
    }
};

export const updateOrderStatusController = async (
    req: Request,
    res: Response
) => {
    try {
        const orderId = Number(req.params.id);

        if (!Number.isInteger(orderId) || orderId <= 0) 
        {
            return res.status(400).json({
                success: false,
                message: "Invalid order Id",
            });
        }

       const { status: newStatus } = req.body;
            if (!newStatus || !Object.values(OrderStatus).includes(newStatus)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid order status",
                });
            }

        const order = await updateOrderStatus(orderId, newStatus);

        return res.status(200).json({
            success: true,
            message: "Orders status updated successfully",
            data: order,
        });

    } catch (error){
        console.error(error);
            if (
            error instanceof Error &&
            error.message === "Invalid order status transition"
        ) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to update orders status",
        });
    }
    
};

export const getAllOrdersController = async (
    req: Request,
    res: Response
) => {
    try {
        const page = req.query.page === undefined ? 1 : Number(req.query.page);
        const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);
        const status = req.query.status === undefined ? undefined : String(req.query.status).toUpperCase();
        const search = req.query.search === undefined ? undefined : String(req.query.search).trim()

        if (
            !Number.isInteger(page) || !Number.isInteger(limit) || page <= 0 || limit <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid pagination parameters",
            });
        }

        const validStatuses = Object.values(OrderStatus).filter(
            (v) => typeof v === "string"
        ) as string[];

        if (status !== undefined && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status",
            });
        }

        const result = await getAllOrders(
            page,
            limit,
            status as OrderStatus | undefined,
            search
        );

        return res.status(200).json({
            success: true,
            message: "Orders retrieved successfully",
            data: result.orders,
            pagination: result.pagination
        });
    }
    catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve orders",
        });
    }
};