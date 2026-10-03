"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getAdminOrders,
  type AdminOrderParams,
} from "../services/order.service";

import type { Order } from "../types/order";

export function useAdminOrders(params: AdminOrderParams) {
  const {
    page = 1,
    limit = 10,
    search,
    status,
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

      const data = await getAdminOrders({
        page,
        limit,
        search,
        status,
      });

      setOrders(data.orders);
      setPagination(data.pagination);
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