
import Link from "next/link";
import { getOrderById } from "@/src/features/order/services/order.service.server";

type OrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const formatVND = (amount: number | string | null | undefined) =>
  `${Number(amount ?? 0).toLocaleString("vi-VN")} VND`;

function getStatusClassName(status: string) {
  switch (status.toUpperCase()) {
    case "DELIVERED":
    case "PAID":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "CANCELLED":
    case "CANCELED":
    case "FAILED":
      return "border-rose-200 bg-rose-50 text-rose-700";

    default:
      return "border-blue-200 bg-blue-50 text-blue-700";
  }
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const orderId = Number(id);
  const order = await getOrderById(orderId);

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6">
          <Link
            href="/account/orders/history"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-700"
          >
            <span aria-hidden="true">←</span>
            Back to Order History
          </Link>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Order Number
                </p>

                <h1 className="mt-1 break-words text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  #{order.orderNumber}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Review your order information and payment details.
                </p>
              </div>

              <span
                className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-sm font-semibold ${getStatusClassName(String(order.status))}`}
              >
                {String(order.status).replaceAll("_", " ")}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-5">
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
                  Shipping Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Delivery details for this order.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Recipient Name
                </p>

                <p className="mt-1.5 break-words text-sm font-medium text-slate-800">
                  {order.shippingName}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Phone Number
                </p>

                <p className="mt-1.5 break-words text-sm font-medium text-slate-800">
                  {order.shippingPhone}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Street Address
                </p>

                <p className="mt-1.5 break-words text-sm leading-6 text-slate-700">
                  {order.shippingAddress}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  City
                </p>

                <p className="mt-1.5 break-words text-sm text-slate-700">
                  {order.shippingCity}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  District
                </p>

                <p className="mt-1.5 break-words text-sm text-slate-700">
                  {order.shippingDistrict}
                </p>
              </div>

              {order.note && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Order Note
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
                  Order Items
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Products included in this order.
                </p>
              </div>

              <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                {order.items.length}{" "}
                {order.items.length === 1 ? "item" : "items"}
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

                    <p className="mt-1.5 text-sm text-slate-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <div className="shrink-0 sm:text-right">
                    <p className="text-xs text-slate-400">
                      Subtotal
                    </p>

                    <p className="mt-1 text-base font-semibold text-slate-800">
                      {formatVND(item.subtotal)}
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
                  Payment Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Payment method and current status.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Payment Method
                </p>

                <p className="mt-1.5 break-words text-sm font-medium text-slate-800">
                  {order.payment?.method
                    ? String(order.payment.method).replaceAll("_", " ")
                    : "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Payment Status
                </p>

                <div className="mt-1.5">
                  {order.payment?.status ? (
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClassName(String(order.payment.status))}`}
                    >
                      {String(order.payment.status).replaceAll("_", " ")}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-500">
                      N/A
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Order Total */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Order Summary
            </h2>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-slate-500">
                  Subtotal
                </span>

                <span className="text-right font-medium text-slate-800">
                  {formatVND(order.subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-slate-500">
                  Shipping Fee
                </span>

                <span className="text-right font-medium text-slate-800">
                  {formatVND(order.shippingFee)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-slate-500">
                  Discount
                </span>

                <span className="text-right font-medium text-slate-800">
                  {formatVND(order.discount)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
                <span className="text-base font-semibold text-slate-900">
                  Total
                </span>

                <span className="text-right text-xl font-bold tracking-tight text-blue-700 sm:text-2xl">
                  {formatVND(order.total)}
                </span>
              </div>
            </div>
          </section>

          {/* Back Link */}
          <div className="flex justify-start pb-2">
            <Link
              href="/account/orders/history"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <span aria-hidden="true">←</span>
              Back to Order History
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
