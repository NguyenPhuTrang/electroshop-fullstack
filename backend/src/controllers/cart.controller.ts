import { Request, Response, NextFunction } from "express";
import { addCartItem, clearCart, getCart, removeCartItem, updateCartItem } from "../services/cart.service";
import { addCartItemSchema, updateCartItemSchema } from "../validations/cart.validation";
import { OrderStatus } from "../generated/prisma/enums";
import { getAllOrders } from "../services/order.service";

export const getCartController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.userId;

        const cart = await getCart(userId);

        return res.status(200).json({
            success: true,
            message: "Cart retrieved successfully",
            data: cart,
        });
    } catch (error) {
        next(error);
    }
};

export const addCartItemController = async (
    req: Request,
    res: Response,
    next: NextFunction      
) => {
    try {
        const result = addCartItemSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid cart item data",
                errors: result.error.issues,
            });
        }

        const userId = req.user!.userId;

        const item = await addCartItem(
            userId,
            result.data.productId,
            result.data.quantity
        );

        return res.status(201).json({
            success: true,
            message: "Product added to cart successfully",
            data: item,
        });
    } catch (error) {
        next(error);
    }
};


export const updateCartItemController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = updateCartItemSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid cart item data",
                errors: result.error.issues,
            });
        }

        const userId = req.user!.userId;
        const productId = Number(req.params.productId);

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const item = await updateCartItem(
            userId,
            productId,
            result.data.quantity
        );

        return res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            data: item,
        });
    } catch (error) {
        next(error);
    }
};

export const removeCartItemController = async (
    req : Request,
    res : Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.userId;
        const productId = Number(req.params.productId);

        if(!Number.isInteger(productId) || productId <= 0)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID ",
            });
        }

        await removeCartItem(userId, productId);

        return res.status(200).json({
            success:true,
            message: "Cart item removed successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const clearCartController = async (
    req: Request,
    res: Response,
    next: NextFunction

) => {
    try {
        const userId = req.user!.userId;

        await clearCart(userId);

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
        });
    } catch (error) {
        next(error);
    }
};





