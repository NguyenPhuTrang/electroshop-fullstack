"use client";

import { useAdminUserDetail } from "@/src/hooks/useAdminUserDetail";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { useAdminUserAddresses } from "@/src/features/address/hooks/useAdminUserAddresses";
import { useAdminOrders } from "@/src/features/order/hooks/useAdminOrders";

export default function AdminUserDetailPage() {
    const params = useParams();
    const router = useRouter();

    const id = Number(params.id);

    const [status, setStatus] = useState("");
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [ordersPage, setOrdersPage] = useState(1);

    const {
        user,
        loading,
        error,
        updateUserStatus
    } = useAdminUserDetail(id);

    const {
        orders,
        pagination: ordersPagination,
        loading: ordersLoading,
        error: ordersError,
    } = useAdminOrders({
        userId: id,
        page: ordersPage,
        limit: 10,
    });

    const {
        addresses,
        loading: addressesLoading,
        error: addressesError,
    } = useAdminUserAddresses(id);

    const formatDateTime = (value: string) => {
        return new Date(value).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getRoleClassName = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "border border-purple-300 text-purple-700";

            case "USER":
                return "border border-blue-300 text-blue-700";

            default:
                return "border border-gray-300 text-gray-700";
        }
    };

     const getStatusClassName = (status: string) => {
        switch (status) {
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

     if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-5xl">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Loading user...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-5xl">
                    <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
                        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error || "User not found."}
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                router.push("/admin/users")
                            }
                            className="mt-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                        >
                            Back to Users
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">

                {/* Header */}
                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <button
                        type="button"
                        onClick={() =>
                            router.push("/admin/users")
                        }
                        className="mb-4 inline-flex items-center text-sm font-medium text-gray-500 transition hover:text-gray-900"
                    >
                        ← Back to Users
                    </button>

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            {user.avatarUrl ? (
                               <Image
                                    src={user.avatarUrl}
                                    alt={user.name}
                                    width={64}
                                    height={64}
                                    className="h-16 w-16 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-xl font-semibold text-gray-600">
                                    {user.name
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                            )}

                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                                    {user.name}
                                </h1>

                                <p className="mt-1 text-sm text-gray-500">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <span
                                className={`inline-flex min-w-24 items-center justify-center rounded-xl px-4 py-2 text-sm font-bold tracking-wide ${getRoleClassName(
                                    user.role
                                )}`}
                            >
                                {user.role}
                            </span>

                            <span
                                className={`inline-flex min-w-24 items-center justify-center rounded-xl px-4 py-2 text-sm font-bold tracking-wide ${getStatusClassName(
                                    user.status
                                )}`}
                            >
                                {user.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* User Information */}
                <div className="grid gap-6 lg:grid-cols-2">

                    {/* Account Information */}
                    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Account Information
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Basic account information
                            </p>
                        </div>

                        <div className="grid gap-5 p-6">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    User ID
                                </p>

                                <p className="mt-2 font-medium text-gray-900">
                                    #{user.id}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Name
                                </p>

                                <p className="mt-2 font-medium text-gray-900">
                                    {user.name}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Email
                                </p>

                                <p className="mt-2 break-all font-medium text-gray-900">
                                    {user.email}
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 sm:flex-row">
                                <div className="flex-1">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Role
                                    </p>

                                    <span
                                        className={`mt-2 inline-flex min-w-24 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold ${getRoleClassName(
                                            user.role
                                        )}`}
                                    >
                                        {user.role}
                                    </span>
                                </div>

                               <div className="flex-1">
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Status
                                        </p>

                                        <div className="mt-2 flex gap-2">
                                            <select
                                                value={status || user.status}
                                                onChange={(event) =>
                                                    setStatus(event.target.value)
                                                }
                                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
                                            >
                                                <option value="ACTIVE">
                                                    ACTIVE
                                                </option>

                                                <option value="INACTIVE">
                                                    INACTIVE
                                                </option>

                                                <option value="BANNED">
                                                    BANNED
                                                </option>
                                            </select>

                                            <button
                                                type="button"
                                                disabled={
                                                    updatingStatus ||
                                                    (status || user.status) === user.status
                                                }
                                                onClick={async () => {
                                                    try {
                                                        setUpdatingStatus(true);

                                                        await updateUserStatus(
                                                            status || user.status
                                                        );

                                                        setStatus("");
                                                    } finally {
                                                        setUpdatingStatus(false);
                                                    }
                                                }}
                                                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {updatingStatus
                                                    ? "Saving..."
                                                    : "Save"}
                                            </button>
                                        </div>
                                    </div>
                            </div>
                        </div>
                    </section>

                    {/* Account Dates */}
                    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Account Details
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Account timestamps
                            </p>
                        </div>

                        <div className="grid gap-5 p-6">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Created At
                                </p>

                                <p className="mt-2 font-medium text-gray-900">
                                    {formatDateTime(
                                        user.createdAt
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Updated At
                                </p>

                                <p className="mt-2 font-medium text-gray-900">
                                    {formatDateTime(
                                        user.updatedAt
                                    )}
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
                <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Addresses
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Saved addresses for this user
                        </p>
                    </div>

                    <div className="p-6">
                        {addressesLoading ? (
                            <p className="text-sm text-gray-500">
                                Loading addresses...
                            </p>
                        ) : addressesError ? (
                            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                                {addressesError}
                            </div>
                        ) : addresses.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                No addresses found.
                            </p>
                        ) : (
                            <div className="grid gap-4 lg:grid-cols-2">
                                {addresses.map((address) => (
                                    <div
                                        key={address.id}
                                        className="rounded-xl border border-gray-200 p-5"
                                    >
                                        <div className="mb-4 flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {address.fullName}
                                                </p>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {address.phone}
                                                </p>
                                            </div>

                                            {address.isDefault && (
                                                <span className="rounded-full border border-green-300 px-3 py-1 text-xs font-semibold text-green-700">
                                                    Default
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-1.5 text-sm text-gray-600">
                                            <p>{address.address}</p>

                                            <p>
                                                {address.district}, {address.city}
                                            </p>

                                            {address.postalCode && (
                                                <p>
                                                    Postal Code: {address.postalCode}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
                
                <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Orders
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Orders placed by this user
                        </p>
                    </div>

                    <div className="p-6">
                        {ordersLoading ? (
                            <p className="text-sm text-gray-500">
                                Loading orders...
                            </p>
                        ) : ordersError ? (
                            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                                {ordersError}
                            </div>
                        ) : orders.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                No orders found.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Order
                                            </th>

                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Total
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
                                        {orders.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="transition hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-4">
                                                    <p className="font-medium text-gray-900">
                                                        {order.orderNumber}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        ID: {order.id}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                                    {Number(order.total).toLocaleString(
                                                        "en-US",
                                                        {
                                                            style: "currency",
                                                            currency: "USD",
                                                        }
                                                    )}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-flex min-w-28 items-center justify-center rounded-xl px-3 py-2 text-xs font-bold ${getStatusClassName(
                                                            order.status
                                                        )}`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4 text-sm text-gray-600">
                                                    {formatDateTime(order.createdAt)}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                          router.push(`/admin/orders/${order.id}?userId=${user.id}`)
                                                        }
                                                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                       {!ordersLoading && ordersPagination.totalPages > 1 && (
                            <div className="mt-5 flex flex-col items-center justify-between gap-4 sm:flex-row">
                                <p className="text-sm text-gray-500">
                                    Page {ordersPagination.page} of{" "}
                                    {ordersPagination.totalPages}
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={ordersPage <= 1}
                                        onClick={() =>
                                            setOrdersPage((current) => current - 1)
                                        }
                                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Previous
                                    </button>

                                    <button
                                        type="button"
                                        disabled={
                                            ordersPage >= ordersPagination.totalPages
                                        }
                                        onClick={() =>
                                            setOrdersPage((current) => current + 1)
                                        }
                                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                        
                    </div>
                </section>
            </div>
        </div>
    );
}