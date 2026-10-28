"use client";

import { useAdminOrders } from "@/src/features/order/hooks/useAdminOrders";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/src/i18n/navigation";
import { Suspense, useState } from "react";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";

const ORDER_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
];

function AdminOrderContent() { // Chứa logic lọc và giao diện đơn hàng
    const t = useTranslations("AdminOrdersPage");
    const locale = useLocale();

    const router = useRouter();
    const searchParams = useSearchParams(); // useSearchParams() là hook của Next.js, dùng để đọc các query parameters trên URL.

    // Next.js có thể cần một Suspense boundary khi xử lý useSearchParams() trong quá trình render trang. Vì vậy, chúng ta bọc component con như bên dưới.

    const [search, setSearch] = useState("");
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const status = searchParams.get("status") ?? ""; // Lấy trạng thái đơn hàng từ URL sau mỗi lần render; nếu không có thì trả về chuỗi rỗng.
    const [page, setPage] = useState(1);

    const limit = 10;

    const { orders, pagination, loading, error } = useAdminOrders({ // Lấy dữ liệu đơn hàng từ API và quản lý trạng thái tải dữ liệu
        search,
        status: status || undefined,
        page,
        limit,
    });

    const statusLabels: Record<string, string> = {
        PENDING: t("statuses.pending"),
        CONFIRMED: t("statuses.confirmed"),
        PROCESSING: t("statuses.processing"),
        SHIPPED: t("statuses.shipped"),
        OUT_FOR_DELIVERY: t("statuses.outForDelivery"),
        DELIVERED: t("statuses.delivered"),
        CANCELLED: t("statuses.cancelled"),
        CANCELED: t("statuses.canceled"),
    };

    const paymentMethodLabels: Record<string, string> = {
        COD: t("paymentMethods.cod"),
        CASH_ON_DELIVERY: t("paymentMethods.cod"),
        BANK_TRANSFER: t("paymentMethods.bankTransfer"),
        CREDIT_CARD: t("paymentMethods.creditCard"),
        VNPAY: t("paymentMethods.vnpay"),
    };

    const paymentStatusLabels: Record<string, string> = {
        PENDING: t("paymentStatuses.pending"),
        PROCESSING: t("paymentStatuses.processing"),
        PAID: t("paymentStatuses.paid"),
        UNPAID: t("paymentStatuses.unpaid"),
        FAILED: t("paymentStatuses.failed"),
        REFUNDED: t("paymentStatuses.refunded"),
        PARTIALLY_REFUNDED: t("paymentStatuses.partiallyRefunded"),
        CANCELLED: t("paymentStatuses.cancelled"),
        CANCELED: t("paymentStatuses.canceled"),
    };

    const formatStatus = (value: string) =>
        statusLabels[value] ?? value.replaceAll("_", " ");

    const formatPaymentMethod = (value: string) =>
        paymentMethodLabels[value] ?? value.replaceAll("_", " ");

    const formatPaymentStatus = (value: string) =>
        paymentStatusLabels[value] ?? value.replaceAll("_", " ");

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleStatusChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value) {
            params.set("status", value);
        } else {
            params.delete("status");
        }

        const query = params.toString();

        router.replace(query ? `/admin/orders?${query}` : "/admin/orders");
        setPage(1);
    };

    const formatPrice = (value: string) =>
        new Intl.NumberFormat(locale, {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(Number(value));

    const formatDate = (value: string) =>
        new Date(value).toLocaleDateString(locale, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

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
            className="min-h-full bg-[#f7f8fa] p-3 sm:p-6 lg:p-8"
        >
            <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="flex min-w-0 flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                >
                    <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-2">
                            <span className="size-2 shrink-0 rounded-full bg-cyan-500" />
                            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                                {t("header.brand")}
                            </p>
                        </div>

                        <h1 className="break-words text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                            {t("header.title")}
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            {t("header.description")}
                        </p>
                    </div>

                    <div className="inline-flex w-fit max-w-full shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0 text-blue-600" aria-hidden="true">
                            <rect x="3" y="4" width="18" height="17" rx="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                        <span className="break-words text-sm font-medium text-slate-600">
                            {status ? formatStatus(status) : t("filters.allOrders")}
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
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="size-5 text-blue-600" aria-hidden="true">
                            <path d="M4 7h16M7 12h10m-7 5h4" />
                            <circle cx="7" cy="7" r="1.5" fill="white" />
                            <circle cx="17" cy="12" r="1.5" fill="white" />
                            <circle cx="10" cy="17" r="1.5" fill="white" />
                        </svg>
                        <h2 className="text-sm font-semibold text-slate-800">
                            {t("filters.title")}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                        <div className="min-w-0">
                            <label htmlFor="order-search" className="mb-2 block text-sm font-medium text-slate-700">
                                {t("filters.searchLabel")}
                            </label>
                            <div className="relative">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true">
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m16 16 4 4" />
                                </svg>
                                <input
                                    id="order-search"
                                    type="text"
                                    value={search}
                                    onChange={(event) => handleSearchChange(event.target.value)}
                                    placeholder={t("filters.searchPlaceholder")}
                                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div className="min-w-0">
                            <label htmlFor="order-status" className="mb-2 block text-sm font-medium text-slate-700">
                                {t("filters.statusLabel")}
                            </label>
                            <div className="relative min-w-0">
                                <button
                                    id="order-status"
                                    type="button"
                                    aria-label={t("filters.statusLabel")}
                                    aria-haspopup="listbox"
                                    aria-expanded={statusDropdownOpen}
                                    onClick={() => setStatusDropdownOpen((open) => !open)}
                                    className={`flex h-11 w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 text-left text-sm outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${statusDropdownOpen ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"}`}
                                >
                                    <span className="min-w-0 truncate text-slate-700">
                                        {status ? formatStatus(status) : t("filters.allStatuses")}
                                    </span>
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={1.8}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                        className={`size-4 shrink-0 text-slate-400 transition-transform ${statusDropdownOpen ? "rotate-180" : ""}`}
                                    >
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </button>

                                {statusDropdownOpen && (
                                    <>
                                        <button
                                            type="button"
                                            aria-label={t("filters.statusLabel")}
                                            className="fixed inset-0 z-40 cursor-default"
                                            onClick={() => setStatusDropdownOpen(false)}
                                        />
                                        <div
                                            role="listbox"
                                            aria-label={t("filters.statusLabel")}
                                            className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 w-full overflow-y-auto overscroll-contain rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-200/60"
                                        >
                                            {[
                                                { value: "", label: t("filters.allStatuses") },
                                                ...ORDER_STATUSES.map((orderStatus) => ({
                                                    value: orderStatus,
                                                    label: formatStatus(orderStatus),
                                                })),
                                            ].map((option) => (
                                                <button
                                                    key={option.value || "all-statuses"}
                                                    type="button"
                                                    role="option"
                                                    aria-selected={status === option.value}
                                                    onClick={() => {
                                                        handleStatusChange(option.value);
                                                        setStatusDropdownOpen(false);
                                                    }}
                                                    className={`flex min-h-10 w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors ${status === option.value ? "bg-blue-50 font-medium text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}
                                                >
                                                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                                                    {status === option.value && (
                                                        <svg
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth={2}
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            aria-hidden="true"
                                                            className="ml-2 size-4 shrink-0 text-blue-600"
                                                        >
                                                            <path d="m5 12 4 4L19 6" />
                                                        </svg>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
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
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 size-4 shrink-0" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v4m0 4h.01" />
                        </svg>
                        <p className="min-w-0 break-words">{error}</p>
                    </motion.div>
                )}

                {/* Table */}
                <motion.section
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.15 }}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                    <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div className="min-w-0">
                            <h2 className="text-base font-semibold text-slate-900">{t("table.title")}</h2>
                            <p className="mt-1 text-xs leading-5 text-slate-500">{t("table.description")}</p>
                        </div>

                        {!loading && !error && (
                            <span className="inline-flex w-fit max-w-full shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                                <span className="size-1.5 shrink-0 rounded-full bg-cyan-500" />
                                <span>
                                    {orders.length === 1
                                        ? t("table.countSingle", { count: new Intl.NumberFormat(locale).format(orders.length) })
                                        : t("table.countMultiple", { count: new Intl.NumberFormat(locale).format(orders.length) })}
                                </span>
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div
                            className="space-y-4 p-4 sm:p-6"
                            aria-busy="true"
                            aria-label={t("loading.ariaLabel")}
                        >
                            {Array.from({ length: 5 }, (_, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, delay: index * 0.05 }}
                                    className="flex items-center gap-4"
                                >
                                    <motion.div
                                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                                        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                                        className="size-11 shrink-0 rounded-lg bg-slate-100"
                                    />
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <motion.div
                                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                                            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                                            className="h-3.5 w-2/5 rounded bg-slate-200"
                                        />
                                        <div className="h-3 w-1/4 rounded bg-slate-100" />
                                    </div>
                                    <div className="hidden h-4 w-24 rounded bg-slate-100 sm:block" />
                                    <div className="hidden h-6 w-28 rounded-full bg-slate-100 md:block" />
                                </motion.div>
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex min-h-60 flex-col items-center justify-center px-5 py-12 text-center">
                            <div className="flex size-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="size-7"
                                    aria-hidden="true"
                                >
                                    <rect x="3" y="4" width="18" height="17" rx="2" />
                                    <path d="M16 2v4M8 2v4M3 10h18" />
                                </svg>
                            </div>
                            <p className="mt-4 text-sm font-semibold text-slate-900">
                                {t("empty.title")}
                            </p>
                            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                                {t("empty.description")}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Phones and tablets (below 1280px): one card per order, in 1 column on phones and 2 columns on tablets */}
                            <ul className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-2 xl:hidden">
                                {orders.map((order, index) => (
                                    <motion.li
                                        key={order.id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25, delay: Math.min(index * 0.035, 0.2), ease: "easeOut" }}
                                        className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4"
                                    >
                                        <div className="flex min-w-0 items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="break-words text-sm font-semibold leading-5 text-slate-900">
                                                    #{order.orderNumber}
                                                </p>
                                                <p className="mt-1 break-all text-xs text-slate-400">
                                                    {t("table.idLabel", { id: order.id })}
                                                </p>
                                            </div>
                                            <p className="shrink-0 text-right text-sm font-semibold text-blue-700">
                                                {formatPrice(order.total)}
                                            </p>
                                        </div>

                                        <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-2 text-sm">
                                            <dt className="text-slate-500">{t("columns.customer")}</dt>
                                            <dd className="min-w-0 text-right text-slate-800">
                                                <p className="break-words font-medium">{order.shippingName}</p>
                                                <p className="mt-1 break-all text-xs text-slate-500">{order.shippingPhone}</p>
                                            </dd>

                                            <dt className="text-slate-500">{t("columns.payment")}</dt>
                                            <dd className="min-w-0 text-right">
                                                {order.payment ? (
                                                    <>
                                                        <p className="break-words text-sm font-medium text-slate-700">
                                                            {formatPaymentMethod(order.payment.method)}
                                                        </p>
                                                        <p className="mt-1 break-words text-xs text-slate-500">
                                                            {formatPaymentStatus(order.payment.status)}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <span className="text-slate-400">—</span>
                                                )}
                                            </dd>

                                            <dt className="text-slate-500">{t("columns.status")}</dt>
                                            <dd className="flex min-w-0 justify-end">
                                                <span className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClassName(order.status)}`}>
                                                    <span className="size-1.5 shrink-0 rounded-full bg-current" />
                                                    <span className="break-words">{formatStatus(order.status)}</span>
                                                </span>
                                            </dd>

                                            <dt className="text-slate-500">{t("columns.created")}</dt>
                                            <dd className="text-right text-sm text-slate-600">
                                                {formatDate(order.createdAt)}
                                            </dd>
                                        </dl>

                                        <div className="border-t border-slate-100 pt-3">
                                            <button
                                                type="button"
                                                onClick={() => router.push(`/admin/orders/${order.id}`)}
                                                className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 sm:w-auto sm:min-w-28"
                                            >
                                                {t("buttons.view")}
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth={1.8}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="size-3.5 shrink-0"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M7 17 17 7M7 7h10v10" />
                                                </svg>
                                            </button>
                                        </div>
                                    </motion.li>
                                ))}
                            </ul>

                            {/* Wide screens (from 1280px): table */}
                            <div className="hidden overflow-x-auto xl:block">
                                <table className="w-full min-w-[1050px] text-sm">
                                    <thead className="border-b border-slate-200 bg-slate-50">
                                        <tr>
                                            <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                                {t("columns.order")}
                                            </th>
                                            <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                {t("columns.customer")}
                                            </th>
                                            <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                {t("columns.total")}
                                            </th>
                                            <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                {t("columns.payment")}
                                            </th>
                                            <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                {t("columns.status")}
                                            </th>
                                            <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                {t("columns.created")}
                                            </th>
                                            <th className="whitespace-nowrap px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                {t("columns.action")}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {orders.map((order, index) => (
                                            <motion.tr
                                                key={order.id}
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.25, delay: Math.min(index * 0.035, 0.2), ease: "easeOut" }}
                                                className="transition-colors hover:bg-slate-50/80"
                                            >
                                                <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                    <div className="font-semibold text-slate-900">#{order.orderNumber}</div>
                                                    <div className="mt-1 text-xs text-slate-400">
                                                        {t("table.idLabel", { id: order.id })}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 sm:px-6">
                                                    <div className="font-medium text-slate-800">{order.shippingName}</div>
                                                    <div className="mt-1 text-xs text-slate-500">{order.shippingPhone}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-4 font-semibold text-blue-700 sm:px-6">
                                                    {formatPrice(order.total)}
                                                </td>
                                                <td className="px-5 py-4 sm:px-6">
                                                    {order.payment ? (
                                                        <div>
                                                            <div className="text-sm font-medium text-slate-700">
                                                                {formatPaymentMethod(order.payment.method)}
                                                            </div>
                                                            <div className="mt-1 text-xs text-slate-500">
                                                                {formatPaymentStatus(order.payment.status)}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-slate-400">—</span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClassName(order.status)}`}>
                                                        <span className="size-1.5 rounded-full bg-current" />
                                                        {formatStatus(order.status)}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500 sm:px-6">
                                                    {formatDate(order.createdAt)}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-4 text-right sm:px-6">
                                                    <button
                                                        type="button"
                                                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                                                        className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                                                    >
                                                        {t("buttons.view")}
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
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </motion.section>

                {/* Pagination */}
                {!loading && pagination.totalPages > 0 && (
                    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <p className="text-center text-sm text-slate-500 sm:text-left">
                            {t("pagination.pageInfo", {
                                page: pagination.page,
                                totalPages: pagination.totalPages,
                            })}
                        </p>

                        <div className="grid w-full grid-cols-2 items-center gap-2 sm:flex sm:w-auto">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((current) => current - 1)}
                                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0" aria-hidden="true">
                                    <path d="m15 18-6-6 6-6" />
                                </svg>
                                {t("pagination.previous")}
                            </button>

                            <button
                                type="button"
                                disabled={page >= pagination.totalPages}
                                onClick={() => setPage((current) => current + 1)}
                                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
                            >
                                {t("pagination.next")}
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0" aria-hidden="true">
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
    const t = useTranslations("AdminOrdersPage");

    return (
        <Suspense // Xử lý trạng thái chờ của component con
            fallback={ // Giao diện tạm thời khi component con đang chờ
                <div
                    className="flex min-h-40 items-center justify-center gap-3 px-4 text-center text-sm text-slate-500"
                    aria-busy="true"
                    aria-label={t("loading.ariaLabel")}
                >
                    <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600" />
                    {t("loading.message")}
                </div>
            }
        >
            <AdminOrderContent />
        </Suspense>
    );
}
// Xử lý khi component chưa thể render, chẳng hạn do useSearchParams()
