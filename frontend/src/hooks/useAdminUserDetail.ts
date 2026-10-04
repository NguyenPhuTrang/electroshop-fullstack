"use client";

import { useCallback, useEffect, useState } from "react";

import { User } from "../features/user/types/user";
import {
    getAdminUserById,
    updateAdminUserStatus,
} from "../features/user/services/user.service";

export function useAdminUserDetail(id: number) {
    const isValidId = Number.isInteger(id) && id > 0;

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(isValidId);
    const [error, setError] = useState("");

    // Dùng cho nút "tải lại" (được gọi từ sự kiện, không phải từ effect)
    const refetchUserDetail = useCallback(async () => {
        if (!isValidId) return;

        try {
            setLoading(true);
            setError("");

            const data = await getAdminUserById(id);
            setUser(data);
        } catch (error) {
            console.error("Failed to get admin user", error);
            setError("Failed to load user");
        } finally {
            setLoading(false);
        }
    }, [id, isValidId]);

    const updateUserStatus = useCallback(
        async (status: string) => {
            try {
                setError("");

                const data = await updateAdminUserStatus(id, status);
                setUser(data);
            } catch (error) {
                console.error("Failed to update user status", error);
                setError("Failed to update user status");
                throw error;
            }
        },
        [id]
    );

    // Tải dữ liệu lần đầu: chỉ gọi setState SAU khi await xong
    useEffect(() => {
        if (!isValidId) return;

        let cancelled = false;

        async function load() {
            try {
                const data = await getAdminUserById(id);

                if (!cancelled) {
                    setUser(data);
                    setError("");
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Failed to get admin user", error);
                    setError("Failed to load user");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [id, isValidId]);

    return {
        user,
        loading,
        error: isValidId ? error : "Invalid user ID",
        refetch:refetchUserDetail,
        updateUserStatus,
    };
}