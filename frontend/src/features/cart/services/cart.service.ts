import api from "@/src/lib/axios";

export async function addCartItem(
    productId: number,
    quantity: number,
    variantId?: number | null
) {
    const response = await api.post("/cart/items", {
        productId,
        variantId: variantId ?? null,
        quantity,
    });

    return response.data.data;
}

export async function getCart() {
    const response = await api.get("/cart");

    return response.data.data;
}

export async function updateCartItem(
    cartItemId: number,
    quantity: number
) {
    const response = await api.patch(
        `/cart/items/${cartItemId}`,
        {
            quantity,
        }
    );

    return response.data.data;
}

export async function removeCartItem(cartItemId: number) {
    const response = await api.delete(
        `/cart/items/${cartItemId}`
    );

    return response.data;
}

export async function clearCart() {
    const response = await api.delete("/cart");

    return response.data;
}