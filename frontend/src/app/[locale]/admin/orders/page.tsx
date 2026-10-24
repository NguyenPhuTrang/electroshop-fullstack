"use client";

import { useAdminOrders } from "@/src/features/order/hooks/useAdminOrders";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/src/i18n/navigation";
import { Suspense, useState } from "react";
import { motion } from "motion/react";

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
                return "border-amber-200 bg-amber-50 text-amber-700";

            case "CONFIRMED":
                return "border-blue-200 bg-blue-50 text-blue-700";

            case "PROCESSING":
                return "border-cyan-200 bg-cyan-50 text-cyan-700";

            case "SHIPPED":
                return "border-indigo-200 bg-indigo-50 text-indigo-700";

            case "OUT_FOR_DELIVERY":
                return "border-sky-200 bg-sky-50 text-sky-700";

            case "DELIVERED":
                return "border-emerald-200 bg-emerald-50 text-emerald-700";

            case "CANCELLED":
            case "CANCELED":
                return "border-rose-200 bg-rose-50 text-rose-700";

            default:
                return "border-slate-200 bg-slate-50 text-slate-600";
        }
    };

    return (
        <motion.main
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="min-h-full bg-[#f7f8fa] p-4 sm:p-6 lg:p-8"
        >
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6"
                >
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <span className="size-2 rounded-full bg-cyan-500" />

                            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                                Electroshop Administration
                            </p>
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                            Order Management
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Manage customer orders, payment details, and fulfillment status.
                        </p>
                    </div>

                    <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.7}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-4 text-blue-600"
                            aria-hidden="true"
                        >
                            <rect x="3" y="4" width="18" height="17" rx="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>

                        <span className="text-sm font-medium text-slate-600">
                            {status
                                ? status.replaceAll("_", " ")
                                : "All Orders"}
                        </span>
                    </div>
                </motion.header>

                {/* Filters */}
                <motion.section
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
                >
                    <div className="mb-4 flex items-center gap-2">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-5 text-blue-600"
                            aria-hidden="true"
                        >
                            <path d="M4 7h16M7 12h10m-7 5h4" />
                            <circle cx="7" cy="7" r="1.5" fill="white" />
                            <circle cx="17" cy="12" r="1.5" fill="white" />
                            <circle cx="10" cy="17" r="1.5" fill="white" />
                        </svg>

                        <h2 className="text-sm font-semibold text-slate-800">
                            Search and Filters
                        </h2>
                    </div>

                    <div className="flex flex-col gap-4 md:flex-row">
                        <div className="flex-1">
                            <label
                                htmlFor="order-search"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Search Orders
                            </label>

                            <div className="relative">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                    strokeLinecap="round"
                                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                                    aria-hidden="true"
                                >
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m16 16 4 4" />
                                </svg>

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
                                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-64">
                            <label
                                htmlFor="order-status"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Order Status
                            </label>

                            <select
                                id="order-status"
                                value={status}
                                onChange={(event) =>
                                    handleStatusChange(
                                        event.target.value
                                    )
                                }
                                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                                            {orderStatus.replaceAll("_", " ")}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>
                    </div>
                </motion.section>

                {/* Error */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        role="alert"
                        className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mt-0.5 size-4 shrink-0"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v4m0 4h.01" />
                        </svg>

                        <p>{error}</p>
                    </motion.div>
                )}

                {/* Table */}
                <motion.section
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.15 }}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                    <div className="flex flex-col justify-between gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">
                                Orders
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Review orders and open their details.
                            </p>
                        </div>

                        {!loading && !error && (
                            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                                <span className="size-1.5 rounded-full bg-cyan-500" />

                                {orders.length}{" "}
                                {orders.length === 1 ? "order" : "orders"} on this page
                            </span>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-[1050px] w-full">
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Order
                                    </th>

                                    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Customer
                                    </th>

                                    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Total
                                    </th>

                                    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Payment
                                    </th>

                                    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Status
                                    </th>

                                    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Created
                                    </th>

                                    <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    Array.from(
                                        { length: 5 },
                                        (_, index) => (
                                            <tr key={index}>
                                                <td
                                                    colSpan={7}
                                                    className="px-5 py-4 sm:px-6"
                                                >
                                                    <motion.div
                                                        initial={{
                                                            opacity: 0,
                                                            y: 6,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        transition={{
                                                            duration: 0.25,
                                                            delay: index * 0.05,
                                                        }}
                                                        className="grid grid-cols-2 items-center gap-4 md:grid-cols-4"
                                                    >
                                                        <motion.div
                                                            animate={{
                                                                opacity: [
                                                                    0.4,
                                                                    0.8,
                                                                    0.4,
                                                                ],
                                                            }}
                                                            transition={{
                                                                duration: 1.4,
                                                                repeat: Infinity,
                                                                ease: "easeInOut",
                                                            }}
                                                            className="h-4 w-32 max-w-full rounded bg-slate-200"
                                                        />

                                                        <motion.div
                                                            animate={{
                                                                opacity: [
                                                                    0.4,
                                                                    0.8,
                                                                    0.4,
                                                                ],
                                                            }}
                                                            transition={{
                                                                duration: 1.4,
                                                                repeat: Infinity,
                                                                ease: "easeInOut",
                                                                delay: 0.1,
                                                            }}
                                                            className="h-4 w-40 max-w-full rounded bg-slate-100"
                                                        />

                                                        <div className="hidden h-4 w-24 rounded bg-slate-100 md:block" />

                                                        <div className="hidden h-6 w-28 rounded-full bg-slate-100 md:block" />
                                                    </motion.div>
                                                </td>
                                            </tr>
                                        )
                                    )
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-5 py-14 text-center sm:px-6"
                                        >
                                            <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth={1.6}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="size-6"
                                                    aria-hidden="true"
                                                >
                                                    <rect
                                                        x="3"
                                                        y="4"
                                                        width="18"
                                                        height="17"
                                                        rx="2"
                                                    />
                                                    <path d="M16 2v4M8 2v4M3 10h18" />
                                                </svg>
                                            </div>

                                            <p className="mt-4 text-sm font-semibold text-slate-900">
                                                No orders found
                                            </p>

                                            <p className="mt-1 text-sm text-slate-500">
                                                Try changing your search or status filter.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order, index) => (
                                        <motion.tr
                                            key={order.id}
                                            initial={{
                                                opacity: 0,
                                                y: 6,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            transition={{
                                                duration: 0.25,
                                                delay: Math.min(
                                                    index * 0.035,
                                                    0.2
                                                ),
                                                ease: "easeOut",
                                            }}
                                            className="transition-colors hover:bg-slate-50"
                                        >
                                            <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                <div className="font-semibold text-slate-900">
                                                    #{order.orderNumber}
                                                </div>

                                                <div className="mt-1 text-xs text-slate-400">
                                                    ID: {order.id}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 sm:px-6">
                                                <div className="font-medium text-slate-800">
                                                    {order.shippingName}
                                                </div>

                                                <div className="mt-1 text-xs text-slate-500">
                                                    {order.shippingPhone}
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 font-semibold text-blue-700 sm:px-6">
                                                {formatPrice(order.total)}
                                            </td>

                                            <td className="px-5 py-4 sm:px-6">
                                                {order.payment ? (
                                                    <div>
                                                        <div className="text-sm font-medium text-slate-700">
                                                            {order.payment.method}
                                                        </div>

                                                        <div className="mt-1 text-xs text-slate-500">
                                                            {order.payment.status}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-slate-400">
                                                        —
                                                    </span>
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClassName(
                                                        order.status
                                                    )}`}
                                                >
                                                    <span className="size-1.5 rounded-full bg-current" />

                                                    {order.status.replaceAll(
                                                        "_",
                                                        " "
                                                    )}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500 sm:px-6">
                                                {formatDate(order.createdAt)}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-right sm:px-6">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.push(
                                                            `/admin/orders/${order.id}`
                                                        )
                                                    }
                                                    className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                                                >
                                                    View

                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth={1.8}
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="size-3.5"
                                                        aria-hidden="true"
                                                    >
                                                        <path d="M7 17 17 7M7 7h10v10" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.section>

                {/* Pagination */}
                {!loading &&
                    pagination.totalPages > 0 && (
                        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 sm:flex-row">
                            <p className="text-sm text-slate-500">
                                Page{" "}
                                <span className="font-semibold text-slate-900">
                                    {pagination.page}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-slate-900">
                                    {pagination.totalPages}
                                </span>
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
                                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={1.8}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="size-4"
                                        aria-hidden="true"
                                    >
                                        <path d="m15 18-6-6 6-6" />
                                    </svg>

                                    Previous
                                </button>

                                <button
                                    type="button"
                                    disabled={
                                        page >= pagination.totalPages
                                    }
                                    onClick={() =>
                                        setPage((current) =>
                                            current + 1
                                        )
                                    }
                                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next

                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={1.8}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="size-4"
                                        aria-hidden="true"
                                    >
                                        <path d="m9 18 6-6-6-6" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                <div className="h-2" />
            </div>
        </motion.main>
    );
}

export default function AdminOrderPage() { // Component chính của trang
    return (
        <Suspense //Xử lý trạng thái chờ của component con
            fallback={ // Giao diện tạm thời khi component con đang chờ
                <div
                    className="flex min-h-40 items-center justify-center gap-3 text-sm text-slate-500"
                    aria-busy="true"
                >
                    <span className="size-4 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600" />
                    Loading orders...
                </div>
            }
        >
            <AdminOrderContent />
        </Suspense>
    );
}
// Xử lý khi component chưa thể render, chẳng hạn do useSearchParams()