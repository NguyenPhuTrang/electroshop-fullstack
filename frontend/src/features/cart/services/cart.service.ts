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
}