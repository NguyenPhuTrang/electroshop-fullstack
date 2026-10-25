"use client";

import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "@/src/i18n/navigation";

import { useAdminOrderDetail } from "@/src/features/order/hooks/useAdminOrderDetail";

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
    case "FAILED":
      return "border-rose-200 bg-rose-50 text-rose-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
};

function OrderStatusBadge({ status }: { status: string }) {
  const t = useTranslations("AdminOrderDetailPage");

  const statusLabels: Record<string, string> = {
    PENDING: t("statuses.pending"),
    CONFIRMED: t("statuses.confirmed"),
    PROCESSING: t("statuses.processing"),
    SHIPPED: t("statuses.shipped"),
    OUT_FOR_DELIVERY: t("statuses.outForDelivery"),
    DELIVERED: t("statuses.delivered"),
    CANCELLED: t("statuses.cancelled"),
    CANCELED: t("statuses.canceled"),
    FAILED: t("statuses.failed"),
    PAID: t("statuses.paid"),
    UNPAID: t("statuses.unpaid"),
    REFUNDED: t("statuses.refunded"),
    PARTIALLY_REFUNDED: t("statuses.partiallyRefunded"),
  };

  const label = statusLabels[status] ?? status.replaceAll("_", " ");

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClassName(
        status
      )}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
      <h2 className="text-base font-semibold tracking-tight text-slate-900">
        {title}
      </h2>

      <p className="mt-1 text-sm leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function LoadingBlock({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      aria-hidden="true"
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{
        duration: 1.4,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      className={className}
    />
  );
}

function AdminOrderDetailSkeleton() {
  const t = useTranslations("AdminOrderDetailPage");

  return (
    <main
      className="min-h-full bg-[#f7f8fa] p-4 sm:p-6 lg:p-8"
      aria-busy="true"
      aria-label={t("loading.ariaLabel")}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mx-auto max-w-7xl"
      >
        {/* Header Skeleton */}
        <header className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <LoadingBlock className="h-4 w-28 rounded bg-slate-200" />

          <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <LoadingBlock className="h-8 w-56 max-w-full rounded-lg bg-slate-200" />

              <LoadingBlock
                className="mt-3 h-4 w-64 max-w-full rounded bg-slate-100"
                delay={0.1}
              />
            </div>

            <LoadingBlock className="h-9 w-32 rounded-full bg-blue-100" />
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Main Content Skeleton */}
          <div className="space-y-6 lg:col-span-2">
            {[1, 2, 3, 4].map((section, sectionIndex) => (
              <motion.section
                key={section}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: sectionIndex * 0.06,
                }}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                  <LoadingBlock className="h-5 w-44 rounded bg-slate-200" />

                  <LoadingBlock
                    className="mt-2 h-3 w-56 max-w-full rounded bg-slate-100"
                    delay={0.1}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2 sm:p-6">
                  {Array.from({ length: section === 3 ? 3 : 4 }).map(
                    (_, index) => (
                      <div key={index}>
                        <LoadingBlock className="h-3 w-20 rounded bg-slate-100" />

                        <LoadingBlock
                          className="mt-3 h-5 w-full max-w-48 rounded bg-slate-200"
                          delay={index * 0.08}
                        />
                      </div>
                    )
                  )}
                </div>
              </motion.section>
            ))}
          </div>

          {/* Summary Skeleton */}
          <motion.aside
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="h-fit overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <LoadingBlock className="h-5 w-36 rounded bg-slate-200" />

              <LoadingBlock
                className="mt-2 h-3 w-44 rounded bg-slate-100"
                delay={0.1}
              />
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              {[1, 2, 3].map((item, index) => (
                <div
                  key={item}
                  className="flex items-center justify-between gap-4"
                >
                  <LoadingBlock className="h-4 w-24 rounded bg-slate-100" />

                  <LoadingBlock
                    className="h-4 w-28 rounded bg-slate-200"
                    delay={index * 0.1}
                  />
                </div>
              ))}

              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between gap-4">
                  <LoadingBlock className="h-5 w-16 rounded bg-slate-200" />

                  <LoadingBlock className="h-7 w-32 rounded bg-blue-100" />
                </div>
              </div>

              <LoadingBlock className="h-12 w-full rounded-lg bg-slate-100" />
            </div>
          </motion.aside>
        </div>
      </motion.div>
    </main>
  );
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const t = useTranslations("AdminOrderDetailPage");
  const locale = useLocale();

  const userId = searchParams.get("userId");

  const backPath = userId
    ? `/admin/users/${userId}`
    : "/admin/orders";

  const backLabel = userId
    ? t("buttons.backToUser")
    : t("buttons.backToOrders");

  const id = Number(params.id);

  const {
    order,
    loading,
    error,
  } = useAdminOrderDetail(id);

  const paymentMethodLabels: Record<string, string> = {
    COD: t("paymentMethods.cod"),
    CASH_ON_DELIVERY: t("paymentMethods.cod"),
    BANK_TRANSFER: t("paymentMethods.bankTransfer"),
    CREDIT_CARD: t("paymentMethods.creditCard"),
    VNPAY: t("paymentMethods.vnpay"),
  };

  const formatPrice = (value: string) => {
    return Number(value).toLocaleString(locale, {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    });
  };

  const formatDateTime = (value: string) => {
    return new Date(value).toLocaleString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <AdminOrderDetailSkeleton />;
  }

  if (error || !order) {
    return (
      <main className="min-h-full bg-[#f7f8fa] p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mx-auto max-w-7xl"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
            <div className="flex size-12 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4m0 4h.01" />
              </svg>
            </div>

            <h1 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">
              {t("errors.title")}
            </h1>

            <p
              role="alert"
              className="mt-2 text-sm leading-6 text-rose-600"
            >
              {error || t("errors.orderNotFound")}
            </p>

            <button
              type="button"
              onClick={() => router.push(backPath)}
              className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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

              {backLabel}
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-full bg-[#f7f8fa] p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mx-auto max-w-7xl"
      >
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <span className="size-2 rounded-full bg-cyan-500" />

                <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                  {t("header.brand")}
                </p>
              </div>

              <h1 className="break-words text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                {t("header.orderNumber", {
                  orderNumber: order.orderNumber,
                })}
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {t("header.createdOn", {
                  date: formatDateTime(order.createdAt),
                })}
              </p>
            </div>

            <OrderStatusBadge status={order.status} />
          </div>
        </motion.header>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Customer Information */}
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08 }}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <SectionHeading
                title={t("customer.title")}
                description={t("customer.description")}
              />

              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t("customer.name")}
                  </p>

                  <p className="mt-2 break-words text-sm font-semibold text-slate-900">
                    {order.user.name}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t("customer.email")}
                  </p>

                  <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                    {order.user.email}
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Shipping Information */}
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.12 }}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <SectionHeading
                title={t("shipping.title")}
                description={t("shipping.description")}
              />

              <div className="grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t("shipping.recipient")}
                  </p>

                  <p className="mt-2 break-words text-sm font-semibold text-slate-900">
                    {order.shippingName}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t("shipping.phone")}
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {order.shippingPhone}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t("shipping.address")}
                  </p>

                  <p className="mt-2 text-sm font-medium leading-6 text-slate-800">
                    {order.shippingAddress}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t("shipping.city")}
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {order.shippingCity}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t("shipping.district")}
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {order.shippingDistrict}
                  </p>
                </div>

                {order.note && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {t("shipping.note")}
                    </p>

                    <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                      {order.note}
                    </div>
                  </div>
                )}
              </div>
            </motion.section>

            {/* Order Items */}
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.16 }}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <SectionHeading
                title={t("items.title")}
                description={t("items.description", {
                  count: order.items.length,
                })}
              />

              {order.items.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-slate-500">
                  {t("items.empty")}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {order.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.25,
                        delay: Math.min(index * 0.04, 0.2),
                      }}
                      className="px-5 py-5 transition-colors hover:bg-slate-50/70 sm:px-6"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-semibold text-slate-900">
                            {item.productName}
                          </p>

                          <p className="mt-1 font-mono text-xs text-slate-500">
                            {t("items.sku", {
                              sku: item.productSku,
                            })}
                          </p>

                          <span className="mt-3 inline-flex rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {t("items.quantity", {
                              quantity: item.quantity,
                            })}
                          </span>
                        </div>

                        <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 sm:min-w-44 sm:text-right">
                          <p className="text-xs text-slate-500">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>

                          <p className="mt-1 text-base font-bold text-blue-700">
                            {formatPrice(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>

            {/* Payment Information */}
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <SectionHeading
                title={t("payment.title")}
                description={t("payment.description")}
              />

              <div className="p-5 sm:p-6">
                {order.payment ? (
                  <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        {t("payment.method")}
                      </p>

                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {paymentMethodLabels[order.payment.method] ??
                          order.payment.method}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        {t("payment.status")}
                      </p>

                      <div className="mt-2">
                        <OrderStatusBadge status={order.payment.status} />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        {t("payment.amount")}
                      </p>

                      <p className="mt-2 text-sm font-bold text-blue-700">
                        {formatPrice(order.payment.amount)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        {t("payment.transactionId")}
                      </p>

                      <p className="mt-2 break-all font-mono text-sm text-slate-700">
                        {order.payment.transactionId || "—"}
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        {t("payment.paidAt")}
                      </p>

                      <p className="mt-2 text-sm font-medium text-slate-800">
                        {order.payment.paidAt
                          ? formatDateTime(order.payment.paidAt)
                          : t("payment.notPaid")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mt-0.5 size-5 shrink-0 text-slate-400"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 8v4m0 4h.01" />
                    </svg>

                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {t("payment.noInformation")}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {t("payment.noInformationDescription")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.section>
          </div>

          {/* Order Summary */}
          <motion.aside
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 }}
            className="h-fit lg:sticky lg:top-22 lg:col-span-1"
          >
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <SectionHeading
                title={t("summary.title")}
                description={t("summary.description")}
              />

              <div className="p-5 sm:p-6">
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">
                      {t("summary.subtotal")}
                    </span>

                    <span className="text-right font-medium text-slate-800">
                      {formatPrice(order.subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">
                      {t("summary.shippingFee")}
                    </span>

                    <span className="text-right font-medium text-slate-800">
                      {formatPrice(order.shippingFee)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">
                      {t("summary.discount")}
                    </span>

                    <span className="text-right font-medium text-emerald-600">
                      -{formatPrice(order.discount)}
                    </span>
                  </div>
                </div>

                <div className="my-6 border-t border-slate-200" />

                <div className="flex items-start justify-between gap-3">
                  <span className="text-base font-semibold text-slate-900">
                    {t("summary.total")}
                  </span>

                  <span className="text-xl font-bold tracking-tight text-red-500">
                    {formatPrice(order.total)}
                  </span>
                </div>

                <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("summary.orderStatus")}
                  </p>

                  <div className="mt-3">
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>

                <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
                  <div>
                    <p className="text-xs text-slate-500">
                      {t("summary.created")}
                    </p>

                    <p className="mt-1 text-sm font-medium leading-5 text-slate-800">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      {t("summary.updated")}
                    </p>

                    <p className="mt-1 text-sm font-medium leading-5 text-slate-800">
                      {formatDateTime(order.updatedAt)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push(backPath)}
                  className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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

                  {backLabel}
                </button>
              </div>
            </section>
          </motion.aside>
        </div>

        <div className="h-6 sm:h-8" />
      </motion.div>
    </main>
  );
}