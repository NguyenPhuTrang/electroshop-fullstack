"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminUserParams, AdminUsersResponse, User } from "../features/user/types/user";
import { getAdminUsers } from "../features/user/services/user.service";

export function useAdminUsers(params: AdminUserParams) {
    const {
        page = 1,
        limit = 10,
        role,
        status,
        search,
    } = params;

    const [users, setUsers] = useState<User[]>([]);

    const [pagination, setPagination] = useState(
        {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
        }
    );

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchUsers = useCallback(async () => {
        try{
            setLoading(true);
            setError("");


            const data : AdminUsersResponse =  // AdminUsersResponse = kiểu dữ liệu của data
            await getAdminUsers({
                page,
                limit,
                role,
                status,
                search,
            });

            setUsers(data.users);
            setPagination(data.pagination);
        }catch(error){
            console.error("Failed to get admin users", error);
            setError("Failed to load users");
        }finally {
            setLoading(false)
        }
    },[
        page,
        limit,
        role,
        status,
        search
    ]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 500)

        return () => {
            clearTimeout(timer);
        }
    },[fetchUsers]);

    return{
        users,
        pagination,
        loading,
        error,
        refetch: fetchUsers, // refetch → tên mà hook trả ra , fetchUsers → function thực sự được gọi
    };
};