import api from "@/src/lib/axios";
import type { CreateOrderData, Order } from "../types/order";

export const createOrder = async (data: CreateOrderData) => {
    const response = await api.post("/orders", data);

    return response.data.data;
};

export const getOrders = async (): Promise<Order[]> => {
    const response = await api.get("/orders");

    return response.data.data;
}

export const cancelOrder = async (orderId: number) => {
    const response = await api.patch(`/orders/${orderId}/cancel`);

    return response.data.data;
}