"use client";

import { useState } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { useAdminDashboard } from "@/src/features/dashboard/hooks/useAdminDashboard";
import type { DashboardRange } from "@/src/features/dashboard/services/dashboard.service";
import Link from "next/link";

const DASHBOARD_RANGES: {
    label: string;
    value: DashboardRange;
}[] = [
    { label: "7 Days", value: 7 },
    { label: "30 Days", value: 30 },
    { label: "90 Days", value: 90 },
];

const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-US").format(value);

const formatCurrency = (value: number) =>
    `${new Intl.NumberFormat("vi-VN", {
        maximumFractionDigits: 0,
    }).format(value)} ₫`;

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

const STATUS_STYLES: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700",
    CONFIRMED: "bg-blue-50 text-blue-700",
    PROCESSING: "bg-violet-50 text-violet-700",
    SHIPPED: "bg-indigo-50 text-indigo-700",
    DELIVERED: "bg-emerald-50 text-emerald-700",
    CANCELLED: "bg-red-50 text-red-700",
};

export default function AdminPage() {
    const [range, setRange] = useState<DashboardRange>(7);

    const {
        data,
        loading,
        error,
        refetch,
    } = useAdminDashboard(range);

    const summary = data?.summary;

    const stats = [
        {
            label: "Total Users",
            value: summary
                ? formatNumber(summary.totalUsers)
                : "—",
            description: "Registered customers",
            initials: "US",
            iconStyle: "bg-blue-50 text-blue-700",
        },
        {
            label: "Total Products",
            value: summary
                ? formatNumber(summary.totalProducts)
                : "—",
            description: "Products in catalog",
            initials: "PR",
            iconStyle: "bg-violet-50 text-violet-700",
        },
        {
            label: "Total Orders",
            value: summary
                ? formatNumber(summary.totalOrders)
                : "—",
            description: "All orders",
            initials: "OR",
            iconStyle: "bg-indigo-50 text-indigo-700",
        },
        {
            label: "Total Revenue",
            value: summary
                ? formatCurrency(summary.totalRevenue)
                : "—",
            description: "From delivered orders",
            initials: "RE",
            iconStyle: "bg-emerald-50 text-emerald-700",
        },
        {
            label: "Pending Orders",
            value: summary
                ? formatNumber(summary.pendingOrders)
                : "—",
            description: "Awaiting confirmation",
            initials: "PE",
            iconStyle: "bg-amber-50 text-amber-700",
        },
        {
            label: "Low Stock Products",
            value: summary
                ? formatNumber(summary.lowStockProducts)
                : "—",
            description: "10 units or fewer",
            initials: "LS",
            iconStyle: "bg-orange-50 text-orange-700",
        },
        {
            label: "Total Reviews",
            value: summary
                ? formatNumber(summary.totalReviews)
                : "—",
            description: "Customer feedback",
            initials: "RV",
            iconStyle: "bg-pink-50 text-pink-700",
        },
        {
            label: "Average Rating",
            value: summary
                ? `${summary.averageRating.toFixed(1)} / 5`
                : "—",
            description: "Across all reviews",
            initials: "AR",
            iconStyle: "bg-yellow-50 text-yellow-700",
        },
        {
            label: "Unanswered Reviews",
            value: summary
                ? formatNumber(summary.unansweredReviews)
                : "—",
            description: "Reviews without a reply",
            initials: "UR",
            iconStyle: "bg-rose-50 text-rose-700",
        },
    ];

    // Đảm bảo tất cả trạng thái đều xuất hiện trên biểu đồ.
    const orderStatusChartData = [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
    ].map((status) => ({
        status,
        count:
            data?.ordersByStatus.find(
                (item) => item.status === status
            )?.count ?? 0,
    }));

    return (
        <div className="min-h-full bg-gray-50 p-5 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                {/* Page Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                            Dashboard
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Welcome to the Electroshop Admin Panel.
                        </p>
                    </div>

                   <button
                      type="button"
                      onClick={() => void refetch()}
                      disabled={loading}
                      className="group inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-sm"
                  >
                      <svg
                          className={`h-4 w-4 transition-transform duration-300 ${
                              loading
                                  ? "animate-spin"
                                  : "group-hover:rotate-180"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                          aria-hidden="true"
                      >
                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4 4v5h5M20 20v-5h-5"
                          />
                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5.5 9A7 7 0 0 1 18 6l2 3M4 15l2 3a7 7 0 0 0 12.5-3"
                          />
                      </svg>

                      <span>{loading ? "Refreshing..." : "Refresh Data"}</span>
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div
                        role="alert"
                        className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {error}
                    </div>
                )}

                {/* KPI Section */}
                <div className="mt-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Store Overview
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Key metrics for your store.
                        </p>
                    </div>

                    <div
                        className="inline-flex w-fit rounded-lg border border-gray-200 bg-white p-1"
                        aria-label="Sales chart date range"
                    >
                        {DASHBOARD_RANGES.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setRange(item.value)}
                                aria-pressed={range === item.value}
                                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                                    range === item.value
                                        ? "bg-gray-900 text-white shadow-sm"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-500">
                                        {stat.label}
                                    </p>

                                    <p className="mt-3 break-words text-2xl font-bold tracking-tight text-gray-900">
                                        {loading && !data
                                            ? "Loading..."
                                            : stat.value}
                                    </p>
                                </div>

                                <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${stat.iconStyle}`}
                                    aria-hidden="true"
                                >
                                    {stat.initials}
                                </div>
                            </div>

                            <p className="mt-4 text-xs text-gray-500">
                                {stat.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Charts */}
                <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
                    {/* Revenue Chart */}
                    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
                        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Revenue Overview
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Revenue from delivered orders by day
                                </p>
                            </div>

                            <span className="text-sm text-gray-500">
                                Last {range} days
                            </span>
                        </div>

                        <div className="mt-6 h-72 w-full">
                            {loading && !data ? (
                                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                    Loading chart...
                                </div>
                            ) : (
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <AreaChart
                                        data={data?.salesOverview ?? []}
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: 10,
                                            bottom: 0,
                                        }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="revenueGradient"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor="#4f46e5"
                                                    stopOpacity={0.25}
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor="#4f46e5"
                                                    stopOpacity={0.02}
                                                />
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid
                                            stroke="#e5e7eb"
                                            strokeDasharray="3 3"
                                            vertical={false}
                                        />

                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(
                                                value: string
                                            ) => {
                                                const [, month, day] =
                                                    value.split("-");

                                                return month && day
                                                    ? `${month}/${day}`
                                                    : value;
                                            }}
                                            tick={{
                                                fontSize: 12,
                                                fill: "#6b7280",
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                            minTickGap={20}
                                        />

                                        <YAxis
                                            tickFormatter={(
                                                value: number
                                            ) =>
                                                value >= 1000
                                                    ? `${(
                                                          value / 1000
                                                      ).toFixed(0)}k`
                                                    : String(value)
                                            }
                                            tick={{
                                                fontSize: 12,
                                                fill: "#6b7280",
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                            width={48}
                                        />

                                        <Tooltip
                                            formatter={(value) => [
                                                formatCurrency(
                                                    Number(value ?? 0)
                                                ),
                                                "Revenue",
                                            ]}
                                            labelFormatter={(label) =>
                                                `Date: ${String(label)}`
                                            }
                                            contentStyle={{
                                                borderRadius: 12,
                                                border: "1px solid #e5e7eb",
                                                fontSize: 12,
                                            }}
                                        />

                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            name="Revenue"
                                            stroke="#4f46e5"
                                            strokeWidth={2.5}
                                            fill="url(#revenueGradient)"
                                            activeDot={{ r: 5 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </section>

                    {/* Orders by Status */}
                    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Orders by Status
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Current order distribution
                        </p>

                        <div className="mt-6 h-72 w-full">
                            {loading && !data ? (
                                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                    Loading chart...
                                </div>
                            ) : (
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <BarChart
                                        data={orderStatusChartData}
                                        layout="vertical"
                                        margin={{
                                            top: 5,
                                            right: 12,
                                            left: 0,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid
                                            stroke="#e5e7eb"
                                            strokeDasharray="3 3"
                                            horizontal={false}
                                        />

                                        <XAxis
                                            type="number"
                                            allowDecimals={false}
                                            tick={{
                                                fontSize: 12,
                                                fill: "#6b7280",
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />

                                        <YAxis
                                            type="category"
                                            dataKey="status"
                                            width={88}
                                            tick={{
                                                fontSize: 10,
                                                fill: "#6b7280",
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />

                                        <Tooltip
                                            formatter={(value) => [
                                                Number(value ?? 0),
                                                "Orders",
                                            ]}
                                            contentStyle={{
                                                borderRadius: 12,
                                                border: "1px solid #e5e7eb",
                                                fontSize: 12,
                                            }}
                                        />

                                        <Bar
                                            dataKey="count"
                                            name="Orders"
                                            fill="#4f46e5"
                                            radius={[0, 5, 5, 0]}
                                            maxBarSize={24}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </section>
                </div>

                {/* Things Need Attention */}
                <section className="mt-8">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Things Need Attention
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Important tasks that may require your attention.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {/* Pending Orders */}
                        <Link
                            href="/admin/orders?status=PENDING"
                            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:bg-amber-100">
                                <svg
                                    className="h-6 w-6"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                >
                                    <circle cx="12" cy="12" r="9" />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 7v5l3 2"
                                    />
                                </svg>
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900">
                                    Pending Orders
                                </p>

                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    Orders awaiting confirmation
                                </p>
                            </div>

                            <div className="shrink-0 text-right">
                                <p className="text-2xl font-bold text-gray-900">
                                    {summary
                                        ? formatNumber(summary.pendingOrders)
                                        : "—"}
                                </p>

                                <p className="mt-1 text-xs font-medium text-amber-700">
                                    View orders
                                </p>
                            </div>
                        </Link>

                        {/* Low Stock Products */}
                       <Link
                            href="/admin/products?lowStock=true"
                            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition group-hover:bg-orange-100">
                                <svg
                                    className="h-6 w-6"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m12 3 9 5v8l-9 5-9-5V8l9-5Z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m3.5 8.2 8.5 4.8 8.5-4.8M12 13v8M12 3v5"
                                    />
                                </svg>
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900">
                                    Low Stock Products
                                </p>

                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    Products with 10 units or fewer
                                </p>
                            </div>

                            <div className="shrink-0 text-right">
                                <p className="text-2xl font-bold text-gray-900">
                                    {summary
                                        ? formatNumber(summary.lowStockProducts)
                                        : "—"}
                                </p>

                                <p className="mt-1 text-xs font-medium text-orange-700">
                                    View products
                                </p>
                            </div>
                        </Link>

                        {/* Unanswered Reviews */}
                        <Link
                            href="/admin/reviews?unanswered=true"
                            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition group-hover:bg-rose-100">
                                <svg
                                    className="h-6 w-6"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"
                                    />
                                </svg>
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900">
                                    Unanswered Reviews
                                </p>

                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    Reviews without an Admin reply
                                </p>
                            </div>

                            <div className="shrink-0 text-right">
                                <p className="text-2xl font-bold text-gray-900">
                                    {summary
                                        ? formatNumber(summary.unansweredReviews)
                                        : "—"}
                                </p>

                                <p className="mt-1 text-xs font-medium text-rose-700">
                                    View reviews
                                </p>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* Recent Orders */}
                <section className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-2 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Recent Orders
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                The latest orders placed in your store
                            </p>
                        </div>

                        <span className="text-sm text-gray-500">
                            Latest 5 orders
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Order
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Customer
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Total
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Date
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {loading && !data ? (
                                    <tr>
                                        <td
                                            colSpan={6} // colSpan là thuộc tính của thẻ HTML <td>, có nghĩa là một ô trong bảng sẽ chiếm chiều rộng của theo số cột.
                                            className="px-5 py-8 text-center text-sm text-gray-500"
                                        >
                                            Loading orders...
                                        </td>
                                    </tr>
                                ) : (data?.recentOrders.length ?? 0) === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6} // Bảng có bao nhiêu cột thì bằng số colSpan đấy
                                            className="px-5 py-8 text-center text-sm text-gray-500"
                                        >
                                            No orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    data?.recentOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="transition hover:bg-gray-50"
                                        >
                                            <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-900">
                                                {order.orderNumber}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                                                {order.user.name}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-900">
                                                {formatCurrency(
                                                    Number(order.total)
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                        STATUS_STYLES[
                                                            order.status
                                                        ] ??
                                                        "bg-gray-100 text-gray-700"
                                                    }`}
                                                >
                                                    {order.status.replace(
                                                        "_",
                                                        " "
                                                    )}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                                                {formatDate(order.createdAt)}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Recent Reviews */}
                <section className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Recent Reviews
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Latest customer feedback and reply status
                            </p>
                        </div>

                        <Link
                            href="/admin/reviews"
                            className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                        >
                            View All Reviews

                            <span aria-hidden="true">→</span>
                        </Link>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {loading && !data ? (
                            <div className="px-5 py-8 text-center text-sm text-gray-500">
                                Loading reviews...
                            </div>
                        ) : (data?.recentReviews.length ?? 0) === 0 ? (
                            <div className="px-5 py-8 text-center text-sm text-gray-500">
                                No reviews found.
                            </div>
                        ) : (
                            data?.recentReviews.map((review) => (
                                <div
                                    key={review.id}
                                    className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6"
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-medium text-gray-900">
                                                {review.user.name}
                                            </p>

                                            <span className="text-xs text-gray-400">
                                                {formatDate(
                                                    review.createdAt
                                                )}
                                            </span>
                                        </div>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {review.product.name}
                                        </p>

                                        {review.comment && (
                                            <p className="mt-2 line-clamp-2 text-sm text-gray-700">
                                                {review.comment}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex shrink-0 flex-wrap items-center gap-3">
                                        <span className="text-sm font-semibold text-amber-500">
                                            {"★".repeat(review.rating)}
                                            <span className="ml-1 text-gray-500">
                                                {review.rating}/5
                                            </span>
                                        </span>

                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                review.reply
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-amber-50 text-amber-700"
                                            }`}
                                        >
                                            {review.reply
                                                ? "Replied"
                                                : "Needs response"}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}