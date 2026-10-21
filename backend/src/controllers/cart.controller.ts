import { Request, Response, NextFunction } from "express";

import {
    addCartItem,
    clearCart,
    getCart,
    removeCartItem,
    updateCartItem,
} from "../services/cart.service";

import {
    addCartItemSchema,
    updateCartItemSchema,
} from "../validations/cart.validation";

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
        const validation = addCartItemSchema.safeParse(
            req.body
        );

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid cart item data",
                errors: validation.error.issues,
            });
        }

        const userId = req.user!.userId;

        const item = await addCartItem(
            userId,
            validation.data.productId,
            validation.data.variantId ?? null,
            validation.data.quantity
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
        const cartItemId = Number(req.params.cartItemId);

        if (
            !Number.isSafeInteger(cartItemId) ||
            cartItemId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid cart item ID",
            });
        }

        const validation = updateCartItemSchema.safeParse(
            req.body
        );

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid cart item data",
                errors: validation.error.issues,
            });
        }

        const userId = req.user!.userId;

        const item = await updateCartItem(
            userId,
            cartItemId,
            validation.data.quantity
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
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const cartItemId = Number(req.params.cartItemId);

        if (
            !Number.isSafeInteger(cartItemId) ||
            cartItemId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid cart item ID",
            });
        }

        const userId = req.user!.userId;

        await removeCartItem(userId, cartItemId);

        return res.status(200).json({
            success: true,
            message: "Cart item removed successfully",
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