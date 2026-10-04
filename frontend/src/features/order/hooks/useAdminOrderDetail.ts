"use client";

import { useCallback, useEffect, useState } from "react";

import type { Order } from "../types/order";
import { getAdminOrderById } from "../services/order.service";

export function useAdminOrderDetail(id: number) {
    const isValidId =
        Number.isInteger(id) && id > 0;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(isValidId);
    const [error, setError] = useState("");

    // Dùng khi component bên ngoài muốn chủ động tải lại order
    const refetchOrderDetail = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminOrderById(id);

            setOrder(data);
        } catch (error) {
            console.error(
                "Failed to get admin order",
                error
            );

            setError("Failed to load order");
        } finally {
            setLoading(false);
        }
    }, [id]);

    // Tự động load order khi component mount hoặc id thay đổi
useEffect(() => {
    const isValidId =
        Number.isInteger(id) && id > 0;

    if (!isValidId) {
        return;
    }

    let cancelled = false;

    const loadOrder = async () => {
        try {
            const data = await getAdminOrderById(id);

            if (!cancelled) {
                setOrder(data);
                setError("");
            }
        } catch (error) {
            console.error(
                "Failed to get admin order",
                error
            );

            if (!cancelled) {
                setError("Failed to load order");
            }
        } finally {
            if (!cancelled) {
                setLoading(false);
            }
        }
    };

    loadOrder();

    return () => {
        cancelled = true;
    };
}, [id]);

    return {
    order,
    loading,
    error: isValidId ? error : "Invalid order ID",
    refetch: refetchOrderDetail,
    };
}