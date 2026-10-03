"use client";

import { useAdminOrderDetail } from "@/src/features/order/hooks/useAdminOrderDetail";
import { useParams, useRouter } from "next/navigation";

export default function AdminOrderDetailPage() {
    const params = useParams();
    const router = useRouter();

    const id = Number(params.id);

    const {
        order,
        loading,
        error,
    } = useAdminOrderDetail(id);

    const formatPrice = (value: string) => {
        return Number(value).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
        });
    };

    const formatDateTime = (value: string) => {
        return new Date(value).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusClassName = (status: string) => {
        switch (status) {
            case "PENDING":
                return "border border-yellow-200 bg-yellow-50 text-yellow-700";

            case "CONFIRMED":
                return "border border-blue-200 bg-blue-50 text-blue-700";

            case "PROCESSING":
                return "border border-purple-200 bg-purple-50 text-purple-700";

            case "SHIPPED":
                return "border border-indigo-200 bg-indigo-50 text-indigo-700";

            case "DELIVERED":
                return "border border-green-200 bg-green-50 text-green-700";

            case "CANCELLED":
                return "border border-red-200 bg-red-50 text-red-700";

            default:
                return "border border-gray-200 bg-gray-50 text-gray-700";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Loading order...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
                        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error || "Order not found."}
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                router.push("/admin/orders")
                            }
                            className="mt-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                        >
                            Back to Orders
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">

                {/* Header */}
                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <button
                                type="button"
                                onClick={() =>
                                    router.push("/admin/orders")
                                }
                                className="mb-3 inline-flex items-center text-sm font-medium text-gray-500 transition hover:text-gray-900"
                            >
                                ← Back to Orders
                            </button>

                            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                                Order {order.orderNumber}
                            </h1>

                            <p className="mt-1.5 text-sm text-gray-500">
                                Created on{" "}
                                {formatDateTime(order.createdAt)}
                            </p>
                        </div>

                        <span
                            className={`inline-flex min-w-32 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold tracking-wide ${getStatusClassName(
                                order.status
                            )}`}
                        >
                            {order.status}
                        </span>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">

                        {/* Customer Information */}
                        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Customer Information
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Customer account information
                                </p>
                            </div>

                            <div className="grid gap-6 p-6 sm:grid-cols-2">
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Name
                                    </p>

                                    <p className="mt-2 font-medium text-gray-900">
                                        {order.user.name}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Email
                                    </p>

                                    <p className="mt-2 break-all font-medium text-gray-900">
                                        {order.user.email}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Shipping Information */}
                        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Shipping Information
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Delivery information
                                </p>
                            </div>

                            <div className="grid gap-6 p-6 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Recipient
                                    </p>

                                    <p className="mt-2 font-medium text-gray-900">
                                        {order.shippingName}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Phone
                                    </p>

                                    <p className="mt-2 font-medium text-gray-900">
                                        {order.shippingPhone}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Address
                                    </p>

                                    <p className="mt-2 font-medium text-gray-900">
                                        {order.shippingAddress}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        City
                                    </p>

                                    <p className="mt-2 font-medium text-gray-900">
                                        {order.shippingCity}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        District
                                    </p>

                                    <p className="mt-2 font-medium text-gray-900">
                                        {order.shippingDistrict}
                                    </p>
                                </div>

                                {order.note && (
                                    <div className="sm:col-span-2">
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Note
                                        </p>

                                        <div className="mt-2 rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                                            {order.note}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Order Items */}
                        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Order Items
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Products included in this order
                                </p>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="px-6 py-5 transition hover:bg-gray-50"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {item.productName}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    SKU: {item.productSku}
                                                </p>

                                                <p className="mt-2 inline-flex rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                                    Quantity: {item.quantity}
                                                </p>
                                            </div>

                                            <div className="sm:text-right">
                                                <p className="text-sm text-gray-500">
                                                    {formatPrice(item.price)} ×{" "}
                                                    {item.quantity}
                                                </p>

                                                <p className="mt-1 text-base font-semibold text-gray-900">
                                                    {formatPrice(item.subtotal)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Payment Information */}
                        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Payment Information
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Payment details for this order
                                </p>
                            </div>

                            <div className="p-6">
                                {order.payment ? (
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Method
                                            </p>

                                            <p className="mt-2 font-medium text-gray-900">
                                                {order.payment.method}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Status
                                            </p>

                                            <p className="mt-2 font-medium text-gray-900">
                                                {order.payment.status}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Amount
                                            </p>

                                            <p className="mt-2 font-medium text-gray-900">
                                                {formatPrice(
                                                    order.payment.amount
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Transaction ID
                                            </p>

                                            <p className="mt-2 break-all font-medium text-gray-900">
                                                {order.payment.transactionId ||
                                                    "-"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Paid At
                                            </p>

                                            <p className="mt-2 font-medium text-gray-900">
                                                {order.payment.paidAt
                                                    ? formatDateTime(
                                                          order.payment.paidAt
                                                      )
                                                    : "-"}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-lg bg-gray-50 px-4 py-5 text-sm text-gray-500">
                                        No payment information available.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <section className="sticky top-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Order Summary
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Payment breakdown
                                </p>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">
                                            Subtotal
                                        </span>

                                        <span className="font-medium text-gray-900">
                                            {formatPrice(order.subtotal)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">
                                            Shipping Fee
                                        </span>

                                        <span className="font-medium text-gray-900">
                                            {formatPrice(order.shippingFee)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">
                                            Discount
                                        </span>

                                        <span className="font-medium text-green-600">
                                            -{formatPrice(order.discount)}
                                        </span>
                                    </div>
                                </div>

                                <div className="my-6 border-t border-gray-200" />

                                <div className="flex items-center justify-between">
                                    <span className="text-base font-semibold text-gray-900">
                                        Total
                                    </span>

                                    <span className="text-xl font-bold text-gray-900">
                                        {formatPrice(order.total)}
                                    </span>
                                </div>

                               <div className="mt-6 flex items-center justify-between rounded-lg bg-gray-50 p-4">
                                    <p className="text-sm font-medium text-gray-500">
                                        Order Status
                                    </p>

                                    <span
                                        className={`inline-flex min-w-32 items-center justify-center rounded-xl px-4 py-2 text-sm font-bold tracking-wide ${getStatusClassName(
                                            order.status
                                        )}`}
                                    >
                                        {order.status}
                                    </span>
                                </div>

                                <div className="mt-6 border-t border-gray-100 pt-5">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">
                                            Created
                                        </span>

                                        <span className="text-right font-medium text-gray-900">
                                            {formatDateTime(
                                                order.createdAt
                                            )}
                                        </span>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between text-sm">
                                        <span className="text-gray-500">
                                            Updated
                                        </span>

                                        <span className="text-right font-medium text-gray-900">
                                            {formatDateTime(
                                                order.updatedAt
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}