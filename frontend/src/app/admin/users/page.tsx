"use client";

import { useAdminUsers } from "@/src/hooks/useAdminUser";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

const USER_ROLES = [
    "USER",
    "ADMIN",
];

const USER_STATUSES = [
    "ACTIVE",
    "INACTIVE",
    "BANNED",
];

export default function AdminUsersPage() {
    const router = useRouter();

    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);

    const limit = 10;

    const {
        users,
        pagination,
        loading,
        error,
    } = useAdminUsers({
        page,
        limit,
        role: role || undefined,
        status: status || undefined,
        search: search || undefined,
    });

    const handleSearchChange = (
        value: string
    ) => {
        setSearch(value);
        setPage(1);
    };

    const handleRoleChange = (
        value: string
    ) => {
        setRole(value);
        setPage(1);
    };

    const handleStatusChange = (
        value: string
    ) => {
        setStatus(value);
        setPage(1);
    };

    const formatDate = (value: string) => {
        return new Date(value).toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );
    };

    const getRoleClassName = (
        userRole: string
    ) => {
        switch (userRole) {
            case "ADMIN":
                return "border border-purple-300 text-purple-700";

            case "USER":
                return "border border-blue-300 text-blue-700";

            default:
                return "border border-gray-300 text-gray-700";
        }
    };

    const getStatusClassName = (
        userStatus: string
    ) => {
        switch (userStatus) {
            case "ACTIVE":
                return "border border-green-300 text-green-700";

            case "INACTIVE":
                return "border border-gray-300 text-gray-600";

            case "BANNED":
                return "border border-red-300 text-red-700";

            default:
                return "border border-gray-300 text-gray-700";
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    User Management
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Manage registered user accounts
                </p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 lg:flex-row">
                {/* Search */}
                <div className="flex-1">
                    <label
                        htmlFor="user-search"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Search
                    </label>

                    <input
                        id="user-search"
                        type="text"
                        value={search}
                        onChange={(event) =>
                            handleSearchChange(
                                event.target.value
                            )
                        }
                        placeholder="Search by name or email..."
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
                    />
                </div>

                {/* Role */}
                <div className="w-full lg:w-48">
                    <label
                        htmlFor="user-role"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Role
                    </label>

                    <select
                        id="user-role"
                        value={role}
                        onChange={(event) =>
                            handleRoleChange(
                                event.target.value
                            )
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
                    >
                        <option value="">
                            All Roles
                        </option>

                        {USER_ROLES.map(
                            (userRole) => (
                                <option
                                    key={userRole}
                                    value={userRole}
                                >
                                    {userRole}
                                </option>
                            )
                        )}
                    </select>
                </div>

                {/* Status */}
                <div className="w-full lg:w-48">
                    <label
                        htmlFor="user-status"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Status
                    </label>

                    <select
                        id="user-status"
                        value={status}
                        onChange={(event) =>
                            handleStatusChange(
                                event.target.value
                            )
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
                    >
                        <option value="">
                            All Statuses
                        </option>

                        {USER_STATUSES.map(
                            (userStatus) => (
                                <option
                                    key={userStatus}
                                    value={userStatus}
                                >
                                    {userStatus}
                                </option>
                            )
                        )}
                    </select>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    User
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Email
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Role
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Status
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Created
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-10 text-center text-sm text-gray-500"
                                    >
                                        Loading users...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-10 text-center text-sm text-gray-500"
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="transition hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.avatarUrl ? (
                                                    <Image
                                                        src={
                                                            user.avatarUrl
                                                        }
                                                        alt={
                                                            user.name
                                                        }
                                                        width={40}
                                                        height={40}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                                                        {user.name
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}
                                                    </div>
                                                )}

                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {
                                                            user.name
                                                        }
                                                    </div>

                                                    <div className="mt-1 text-xs text-gray-500">
                                                        ID:{" "}
                                                        {user.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {user.email}
                                        </td>

                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex min-w-24 items-center justify-center rounded-xl px-3 py-1.5 text-xs font-semibold ${getRoleClassName(
                                                    user.role
                                                )}`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex min-w-24 items-center justify-center rounded-xl px-3 py-1.5 text-xs font-semibold ${getStatusClassName(
                                                    user.status
                                                )}`}
                                            >
                                                {user.status}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {formatDate(
                                                user.createdAt
                                            )}
                                        </td>

                                        <td className="px-4 py-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.push(
                                                        `/admin/users/${user.id}`
                                                    )
                                                }
                                                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {!loading &&
                pagination.totalPages > 0 && (
                    <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <p className="text-sm text-gray-500">
                            Page {pagination.page} of{" "}
                            {pagination.totalPages}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() =>
                                    setPage(
                                        (current) =>
                                            current - 1
                                    )
                                }
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Previous
                            </button>

                            <button
                                type="button"
                                disabled={
                                    page >=
                                    pagination.totalPages
                                }
                                onClick={() =>
                                    setPage(
                                        (current) =>
                                            current + 1
                                    )
                                }
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
        </div>
    );
}