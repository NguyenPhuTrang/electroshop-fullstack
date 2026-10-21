import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";

const cartItemInclude = {
    product: true,
    variant: {
        include: {
            colorOption: true,
        },
    },
} as const;

export const getCart = async (userId: number) => {
    const cart = await prisma.cart.findUnique({
        where: {
            userId,
        },
        include: {
            items: {
                include: cartItemInclude,
            },
        },
    });

    if (!cart) {
        return {
            id: null,
            userId,
            items: [],
        };
    }

    return cart;
};

export const addCartItem = async (
    userId: number,
    productId: number,
    variantId: number | null,
    quantity: number
) => {
    // 1. Find the product.
    const product = await prisma.product.findUnique({
        where: {
            id: productId,
        },
        select: {
            id: true,
            status: true,
        },
    });

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    if (product.status !== "ACTIVE") {
        throw new AppError("Product is not available", 400);
    }

    // 2. Every purchasable product must have a variant.
    if (variantId === null) {
        throw new AppError(
            "Please select a product variant",
            400
        );
    }

    // 3. Find the variant belonging to this product.
    const variant = await prisma.productVariant.findFirst({
        where: {
            id: variantId,
            productId,
        },
        select: {
            id: true,
            stock: true,
            status: true,
        },
    });

    if (!variant) {
        throw new AppError(
            "Product variant not found for this product",
            404
        );
    }

    if (variant.status !== "ACTIVE") {
        throw new AppError(
            "Product variant is not available",
            400
        );
    }

    // 4. Stock is managed only by ProductVariant.
    const availableStock = variant.stock;

    if (quantity > availableStock) {
        throw new AppError("Insufficient stock", 400);
    }

    // 5. Find or create the user's cart.
    let cart = await prisma.cart.findUnique({
        where: {
            userId,
        },
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: {
                userId,
            },
        });
    }

    // 6. Find the existing cart item for this variant.
    const existingItem = await prisma.cartItem.findFirst({
        where: {
            cartId: cart.id,
            productId,
            variantId: variant.id,
        },
    });

    if (existingItem) {
        const newQuantity =
            existingItem.quantity + quantity;

        if (newQuantity > availableStock) {
            throw new AppError("Insufficient stock", 400);
        }

        return prisma.cartItem.update({
            where: {
                id: existingItem.id,
            },
            data: {
                quantity: newQuantity,
            },
            include: cartItemInclude,
        });
    }

    // 7. Create a cart item linked to the selected variant.
    return prisma.cartItem.create({
        data: {
            cartId: cart.id,
            productId,
            variantId: variant.id,
            quantity,
        },
        include: cartItemInclude,
    });
};

export const updateCartItem = async (
    userId: number,
    cartItemId: number,
    quantity: number
) => {
    const cart = await prisma.cart.findUnique({
        where: {
            userId,
        },
        select: {
            id: true,
        },
    });

    if (!cart) {
        throw new AppError("Cart not found", 404);
    }

    const cartItem = await prisma.cartItem.findFirst({
        where: {
            id: cartItemId,
            cartId: cart.id,
        },
        include: cartItemInclude,
    });

    if (!cartItem) {
        throw new AppError("Cart item not found", 404);
    }

    if (cartItem.product.status !== "ACTIVE") {
        throw new AppError("Product is not available", 400);
    }

    // Every cart item must reference a product variant.
    if (
        cartItem.variantId === null ||
        !cartItem.variant ||
        cartItem.variant.status !== "ACTIVE"
    ) {
        throw new AppError(
            "Product variant is not available",
            400
        );
    }

    // Stock is managed only by ProductVariant.
    const availableStock = cartItem.variant.stock;

    if (quantity > availableStock) {
        throw new AppError("Insufficient stock", 400);
    }

    return prisma.cartItem.update({
        where: {
            id: cartItem.id,
        },
        data: {
            quantity,
        },
        include: cartItemInclude,
    });
};

export const removeCartItem = async (
    userId: number,
    cartItemId: number
) => {
    const cart = await prisma.cart.findUnique({
        where: {
            userId,
        },
        select: {
            id: true,
        },
    });

    if (!cart) {
        throw new AppError("Cart not found", 404);
    }

    const cartItem = await prisma.cartItem.findFirst({
        where: {
            id: cartItemId,
            cartId: cart.id,
        },
        select: {
            id: true,
        },
    });

    if (!cartItem) {
        throw new AppError("Cart item not found", 404);
    }

    await prisma.cartItem.delete({
        where: {
            id: cartItem.id,
        },
    });
};

export const clearCart = async (userId: number) => {
    const cart = await prisma.cart.findUnique({
        where: {
            userId,
        },
        select: {
            id: true,
        },
    });

    if (!cart) {
        throw new AppError("Cart not found", 404);
    }

    await prisma.cartItem.deleteMany({
        where: {
            cartId: cart.id,
        },
    });
};