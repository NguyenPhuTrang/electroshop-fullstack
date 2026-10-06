"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getAdminOrders,
  getAdminOrdersByUser,
  type AdminOrderParams,
} from "../services/order.service";

import type { Order } from "../types/order";

export function useAdminOrders(params: AdminOrderParams  & { userId?: number } ) {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    userId,
  } = params;

  const [orders, setOrders] = useState<Order[]>([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

     const data = userId ? await getAdminOrdersByUser(userId, {
      page,
      limit,
      search,
      status,
    })
  : await getAdminOrders({
      page,
      limit,
      search,
      status,
    });

      setOrders(data.orders);

      console.log("Admin orders data:", data);

      setPagination(
          data.pagination ?? {
              page,
              limit,
              total: 0,
              totalPages: 0,
          }
      );
    } catch (error) {
      console.error(
        "Failed to get admin orders",
        error
      );

      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    search,
    status,
    userId
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchOrders]);

  return {
    orders,
    pagination,
    loading,
    error,
    refetch: fetchOrders,
  };
}