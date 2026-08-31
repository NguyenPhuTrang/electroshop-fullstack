import { prisma } from "../config/prisma";

export const getCart = async (userId: number) => {
    const cart = await prisma.cart.findUnique({
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
    quantity: number
) => {
    const product = await prisma.product.findUnique({
        where: {
            id: productId,
        },
    });

    if (!product) {
        throw new Error("Product not found");
    }

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

    const existingItem = await prisma.cartItem.findUnique({
        where: {
            cartId_productId: {
                cartId: cart.id,
                productId,
            },
        },
    });

    // Product đã có trong Cart
    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > product.stock) {
            throw new Error("Insufficient stock");
        }

        return prisma.cartItem.update({
            where: {
                id: existingItem.id,
            },
            data: {
                quantity: newQuantity,
            },
            include: {
                product: true,
            },
        });
    }

    // Product chưa có trong Cart
    if (quantity > product.stock) {
        throw new Error("Insufficient stock");
    }

    return prisma.cartItem.create({
        data: {
            cartId: cart.id,
            productId,
            quantity,
        },
        include: {
            product: true,
        },
    });
};

export const updateCartItem = async (
    userId: number,
    productId: number,
    quantity: number
) => {
    const cart = await prisma.cart.findUnique({
        where: {
            userId,
        },
    });

    if (!cart) {
        throw new Error("Cart not found");
    }

    const cartItem = await prisma.cartItem.findUnique({
        where: {
            cartId_productId: {
                cartId: cart.id,
                productId,
            },
        },
    });

    if (!cartItem) {
        throw new Error("Cart item not found");
    }

    const product = await prisma.product.findUnique({
        where: {
            id: productId,
        },
    });

    if (!product) {
        throw new Error("Product not found");
    }

    if (quantity > product.stock) {
        throw new Error("Insufficient stock");
    }

    return prisma.cartItem.update({
        where: {
            id: cartItem.id,
        },
        data: {
            quantity,
        },
        include: {
            product: true,
        },
    });
};

export const removeCartItem = async(
    userId: number,
    productId: number
) =>{
    const cart = await prisma.cart.findUnique({
        where:{
            userId,
        },
    });

    if(!cart) {
        throw new Error("Cart not found");
    }

    const cartItem = await prisma.cartItem.findUnique({
        where:{
            cartId_productId:{
                cartId: cart.id,
                productId,
            },
        },
    });

    if(!cartItem){
        throw new Error("Cart item not found");
    }

    await prisma.cartItem.delete({
        where:{
            id: cartItem.id,
        },
    });
}

export const clearCart = async (userId: number) => {
    const cart = await prisma.cart.findUnique({
        where: {
            userId,
        },

    });
    
    if(!cart){
        throw new Error ("Cart not found");
    }

    await prisma.cartItem.deleteMany({
        where: {
            cartId: cart.id,
        },
    });
};