"use client";

import { useCallback, useEffect, useState } from "react";
import {
    getAdminDashboard,
    type AdminDashboardResponse,
    type DashboardRange,
} from "../services/dashboard.service";

export function useAdminDashboard(
    range: DashboardRange = 7
) {
    const [data, setData] = useState<AdminDashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Tự tải lần đầu và mỗi khi range đổi
    useEffect(() => {
        let cancelled = false;

        getAdminDashboard(range)
            .then((result) => {
                if (cancelled) return;
                setData(result);
                setError("");
            })
            .catch((error) => {
                if (cancelled) return;
                console.error("Failed to load admin dashboard", error);
                setError("Failed to load dashboard data");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [range]);

    // Nút "tải lại": gọi từ sự kiện bấm nút, không phải từ effect
    const refetch = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const result = await getAdminDashboard(range);
            setData(result);
        } catch (error) {
            console.error("Failed to load admin dashboard", error);
            setError("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, [range]);

    return { data, loading, error, refetch };
}