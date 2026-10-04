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

export type AdminOrderParams = {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
};

export type AdminOrdersResponse = {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const getAdminOrders = async (
  params?: AdminOrderParams
): Promise<AdminOrdersResponse> => {
  const response = await api.get("/orders/admin", {
    params,
  });

  return {
    orders: response.data.data,
    pagination: response.data.pagination,
  };
};

export const updateAdminOrderStatus = async (
  orderId: number,
  status: Order["status"]
): Promise<Order> => {
  const response = await api.patch(
    `/orders/${orderId}/status`,
    { status }
  );

  return response.data.data;
};

export const getAdminOrderById = async (
  orderId : number,
): Promise<Order> => {
  const response = await api.get(`/orders/admin/${orderId}`);

  return response.data.data;
}

