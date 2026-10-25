import { getLocale, getTranslations } from "next-intl/server";

import { OrderStatusSection } from "@/src/features/order/components/OrderStatusSection";
import { getOrderById } from "@/src/features/order/services/order.service.server";

type OrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatVND(value: unknown, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const [{ id }, t, locale] = await Promise.all([
    params,
    getTranslations("AdminOrderDetailPage"),
    getLocale(),
  ]);

  const orderId = Number(id);
  const order = await getOrderById(orderId);

  function getPaymentMethodLabel(method: string) {
    switch (method.toUpperCase()) {
      case "COD":
        return t("methods.cod");
      case "BANK_TRANSFER":
        return t("methods.bankTransfer");
      case "CREDIT_CARD":
        return t("methods.creditCard");
      case "VNPAY":
        return t("methods.vnpay");
      default:
        return method.replaceAll("_", " ");
    }
  }

  function getPaymentStatusLabel(status: string) {
    switch (status.toUpperCase()) {
      case "PENDING":
        return t("statuses.pending");
      case "PROCESSING":
        return t("statuses.processing");
      case "CONFIRMED":
        return t("statuses.confirmed");
      case "SHIPPED":
        return t("statuses.shipped");
      case "OUT_FOR_DELIVERY":
        return t("statuses.outForDelivery");
      case "DELIVERED":
        return t("statuses.delivered");
      case "PAID":
        return t("statuses.paid");
      case "UNPAID":
        return t("statuses.unpaid");
      case "CANCELLED":
        return t("statuses.cancelled");
      case "CANCELED":
        return t("statuses.canceled");
      case "FAILED":
        return t("statuses.failed");
      case "REFUNDED":
        return t("statuses.refunded");
      case "PARTIALLY_REFUNDED":
        return t("statuses.partiallyRefunded");
      default:
        return status.replaceAll("_", " ");
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Page Header */}
        <header className="mb-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1">
            <span className="size-1.5 rounded-full bg-cyan-500" />

            <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-800 sm:text-xs">
              {t("header.badge")}
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {t("header.title")}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {t("header.description")}
          </p>
        </header>

        <div className="space-y-5">
          {/* Order Status */}
          <OrderStatusSection
            orderId={order.id}
            orderNumber={order.orderNumber}
            initialStatus={order.status}
          />

          {/* Shipping Information */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-600">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-6h6v6"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {t("shipping.title")}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {t("shipping.description")}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {t("shipping.recipientName")}
                </p>

                <p className="mt-1.5 break-words text-sm font-medium text-slate-800">
                  {order.shippingName}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {t("shipping.phoneNumber")}
                </p>

                <p className="mt-1.5 break-words text-sm font-medium text-slate-800">
                  {order.shippingPhone}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {t("shipping.streetAddress")}
                </p>

                <p className="mt-1.5 break-words text-sm leading-6 text-slate-700">
                  {order.shippingAddress}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {t("shipping.city")}
                </p>

                <p className="mt-1.5 break-words text-sm text-slate-700">
                  {order.shippingCity}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {t("shipping.district")}
                </p>

                <p className="mt-1.5 break-words text-sm text-slate-700">
                  {order.shippingDistrict}
                </p>
              </div>

              {order.note && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t("shipping.orderNote")}
                  </p>

                  <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                    {order.note}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Products */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {t("items.title")}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {t("items.description")}
                </p>
              </div>

              <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                {t("items.count", { count: order.items.length })}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-slate-800">
                      {item.productName}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>
                        {t("items.quantity", { count: item.quantity })}
                      </span>

                      <span>
                        {t("items.sku")}: {item.productSku}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 sm:text-right">
                    <p className="text-xs text-slate-400">
                      {t("items.subtotal")}
                    </p>

                    <p className="mt-1 text-base font-semibold text-slate-800">
                      {formatVND(item.subtotal, locale)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-600">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  className="size-5"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />

                  <path
                    strokeLinecap="round"
                    d="M3 10h18M7 15h3"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {t("payment.title")}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {t("payment.description")}
                </p>
              </div>
            </div>

            {order.payment ? (
              <>
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {t("payment.method")}
                    </p>

                    <p className="mt-1.5 break-words text-sm font-medium text-slate-800">
                      {getPaymentMethodLabel(String(order.payment.method))}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {t("payment.status")}
                    </p>

                    <p className="mt-1.5 text-sm font-medium text-slate-800">
                      {getPaymentStatusLabel(String(order.payment.status))}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {t("payment.amount")}
                    </p>

                    <p className="mt-1.5 text-lg font-semibold text-blue-700">
                      {formatVND(order.payment.amount, locale)}
                    </p>
                  </div>
                </div>

                {/* Bank Transfer Information */}
                {order.payment.method === "BANK_TRANSFER" && (
                  <div className="mt-6 rounded-lg border border-slate-200 p-4 sm:p-5">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-base font-semibold text-slate-900">
                        {t("bankTransfer.title")}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {t("bankTransfer.description")}
                      </p>
                    </div>

                    <div className="mt-4 space-y-4">
                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                        <span className="text-sm text-slate-500">
                          {t("bankTransfer.bank")}
                        </span>

                        <span className="break-words text-sm font-medium text-slate-800 sm:text-right">
                          YOUR_BANK_NAME
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                        <span className="text-sm text-slate-500">
                          {t("bankTransfer.accountNumber")}
                        </span>

                        <span className="break-words text-sm font-medium text-slate-800 sm:text-right">
                          YOUR_ACCOUNT_NUMBER
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                        <span className="text-sm text-slate-500">
                          {t("bankTransfer.accountHolder")}
                        </span>

                        <span className="break-words text-sm font-medium text-slate-800 sm:text-right">
                          YOUR_ACCOUNT_HOLDER
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 border-t border-slate-100 pt-4 sm:flex-row sm:justify-between sm:gap-4">
                        <span className="text-sm text-slate-500">
                          {t("bankTransfer.transferAmount")}
                        </span>

                        <span className="text-base font-bold text-blue-700 sm:text-right">
                          {formatVND(order.payment.amount, locale)}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <span className="text-sm text-slate-500">
                          {t("bankTransfer.transferNote")}
                        </span>

                        <span className="break-all rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 sm:text-right">
                          {order.orderNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="mt-5 text-sm text-slate-500">
                {t("payment.unavailable")}
              </p>
            )}
          </section>

          {/* Order Summary */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              {t("summary.title")}
            </h2>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-slate-500">
                  {t("summary.subtotal")}
                </span>

                <span className="text-right font-medium text-slate-800">
                  {formatVND(order.subtotal, locale)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-slate-500">
                  {t("summary.shippingFee")}
                </span>

                <span className="text-right font-medium text-slate-800">
                  {formatVND(order.shippingFee, locale)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-slate-500">
                  {t("summary.discount")}
                </span>

                <span className="text-right font-medium text-slate-800">
                  {formatVND(order.discount, locale)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
                <span className="text-base font-semibold text-slate-900">
                  {t("summary.total")}
                </span>

                <span className="text-right text-xl font-bold tracking-tight text-blue-700 sm:text-2xl">
                  {formatVND(order.total, locale)}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}