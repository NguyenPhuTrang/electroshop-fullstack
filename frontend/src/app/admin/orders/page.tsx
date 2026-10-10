"use client";

import { useAdminOrders } from "@/src/features/order/hooks/useAdminOrders";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const ORDER_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
];

 function AdminOrderContent() { // Chứa logic lọc và giao diện đơn hàng
    const router = useRouter();
    const searchParams = useSearchParams(); // // useSearchParams() là hook của Next.js, dùng để đọc các query parameters trên URL.

    // Next.js có thể cần một Suspense boundary khi xử lý useSearchParams() trong quá trình render trang. Vì vậy, chúng ta bọc component con như bên dưới

    const [search, setSearch] = useState("");
    const status = searchParams.get("status") ?? ""; // lấy trạng PENDING thái đơn hàng từ URL sau mỗi lần render và lưu vào state nếu không lấy được thì trả về " ";
    const [page, setPage] = useState(1);

    const limit = 10;

    const {
        orders,
        pagination,
        loading,
        error,
    } = useAdminOrders({ // Lấy dữ liệu đơn hàng từ API và quản lý trạng thái tải dữ liệu
        search,
        status: status || undefined,
        page,
        limit,
    });

    const handleSearchChange = (
        value: string
    ) => {
        setSearch(value);
        setPage(1);
    };

const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(
        searchParams.toString()
    );

    if (value) {
        params.set("status", value);
    } else {
        params.delete("status");
    }

    const query = params.toString();

    router.replace(
        query
            ? `/admin/orders?${query}`
            : "/admin/orders"
    );

    setPage(1);
};

    const formatPrice = (value: string) => {
        return Number(value).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
        });
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

    const getStatusClassName = (status: string) => {
    switch (status) {
        case "PENDING":
            return "border border-yellow-300 text-yellow-700";

        case "CONFIRMED":
            return "border border-blue-300 text-blue-700";

        case "PROCESSING":
            return "border border-purple-300 text-purple-700";

        case "SHIPPED":
            return "border border-indigo-300 text-indigo-700";

        case "DELIVERED":
            return "border border-green-300 text-green-700";

        case "CANCELLED":
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
                    Order Management
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Manage customer orders
                </p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 md:flex-row">
                <div className="flex-1">
                    <label
                        htmlFor="order-search"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Search
                    </label>

                    <input
                        id="order-search"
                        type="text"
                        value={search}
                        onChange={(event) =>
                            handleSearchChange(
                                event.target.value
                            )
                        }
                        placeholder="Search by order number..."
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-500"
                    />
                </div>

                <div className="w-full md:w-56">
                    <label
                        htmlFor="order-status"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Status
                    </label>

                    <select
                        id="order-status"
                        value={status}
                        onChange={(event) =>
                            handleStatusChange(
                                event.target.value
                            )
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-500"
                    >
                        <option value="">
                            All Statuses
                        </option>

                        {ORDER_STATUSES.map(
                            (orderStatus) => (
                                <option
                                    key={orderStatus}
                                    value={orderStatus}
                                >
                                    {orderStatus}
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
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Order
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Customer
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Total
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Payment
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
                                        colSpan={7}
                                        className="px-4 py-10 text-center text-sm text-gray-500"
                                    >
                                        Loading orders...
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-10 text-center text-sm text-gray-500"
                                    >
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="transition hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-4">
                                            <div className="font-medium text-gray-900">
                                                {order.orderNumber}
                                            </div>

                                            <div className="mt-1 text-xs text-gray-500">
                                                ID: {order.id}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="font-medium text-gray-900">
                                                {order.shippingName}
                                            </div>

                                            <div className="mt-1 text-xs text-gray-500">
                                                {order.shippingPhone}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                            {formatPrice(
                                                order.total
                                            )}
                                        </td>

                                        <td className="px-4 py-4">
                                            {order.payment ? (
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {
                                                            order
                                                                .payment
                                                                .method
                                                        }
                                                    </div>

                                                    <div className="mt-1 text-xs text-gray-500">
                                                        {
                                                            order
                                                                .payment
                                                                .status
                                                        }
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">
                                                    -
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex min-w-32 items-center justify-center rounded-xl px-4 py-2 text-sm font-bold tracking-wide ${getStatusClassName(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {formatDate(
                                                order.createdAt
                                            )}
                                        </td>

                                        <td className="px-4 py-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.push(
                                                        `/admin/orders/${order.id}`
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
                                    setPage((current) =>
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
                                    setPage((current) =>
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

export default function AdminOrderPage() { // Component chính của trang
    return (
        <Suspense //Xử lý trạng thái chờ của component con
            fallback={ // Giao diện tạm thời khi component con đang chờ
                <div className="flex min-h-40 items-center justify-center text-sm text-gray-500">
                    Loading orders...
                </div>
            }
        >
            <AdminOrderContent />  
        </Suspense> 
    );
}