import api from "@/src/lib/axios";

export async function addCartItem(
    productId: number,
    quantity: number
) {
    const response = await api.post("/cart/items",{
        productId,
        quantity
    });

    return response.data.data;
};

export async function getCart(){
    const response = await api.get("/cart");
     
    return response.data.data;
};

export async function updateCartItem(
    productId: number,
    quantity: number
) {
    const respone = await api.patch(
        `/cart/item/${productId}`,
        {
            quantity,
        }
    );

    return respone.data.data;
};

export async function removeCartItem(productId: number) {
    const response = await api.delete(
        `/cart/items/${productId}`
    );
    return response.data.data;
}

export async function clearCart() {
    const response = await api.delete("cart");

    return response.data;
}