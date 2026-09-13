import { createServerApi } from "@/src/lib/axios.server";
import axios from "axios";
import type { Order } from "../types/order";

export const getOrderById = async (orderId: number): Promise<Order> => {
  const api = await createServerApi();

  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error.response?.data); 
    }
    throw error;
  }
};