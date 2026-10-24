
import { OrderStatusSection } from "@/src/features/order/components/OrderStatusSection";
import { getOrderById } from "@/src/features/order/services/order.service.server";

type OrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatVND(value: unknown) {
  return `${Number(value ?? 0).toLocaleString("vi-VN")} VND`;
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
        <header className="mb-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1">
            <span className="size-1.5 rounded-full bg-cyan-500" />

            <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-800 sm:text-xs">
              Order Management
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Order Details
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Review order information, shipping details, payment, and totals.
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
                  Shipping Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Recipient and delivery details for this order.
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
                  Products
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

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>
                        Quantity: {item.quantity}
                      </span>

                      <span>
                        SKU: {item.productSku}
                      </span>
                    </div>
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
                  Payment method and transaction details.
                </p>
              </div>
            </div>

            {order.payment ? (
              <>
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Payment Method
                    </p>

                    <p className="mt-1.5 break-words text-sm font-medium text-slate-800">
                      {String(order.payment.method).replaceAll("_", " ")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Payment Status
                    </p>

                    <p className="mt-1.5 text-sm font-medium text-slate-800">
                      {String(order.payment.status).replaceAll("_", " ")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Payment Amount
                    </p>

                    <p className="mt-1.5 text-lg font-semibold text-blue-700">
                      {formatVND(order.payment.amount)}
                    </p>
                  </div>
                </div>

                {/* Bank Transfer Information */}
                {order.payment.method === "BANK_TRANSFER" && (
                  <div className="mt-6 rounded-lg border border-slate-200 p-4 sm:p-5">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-base font-semibold text-slate-900">
                        Bank Transfer Information
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Use the following details when making your transfer.
                      </p>
                    </div>

                    <div className="mt-4 space-y-4">
                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                        <span className="text-sm text-slate-500">
                          Bank
                        </span>

                        <span className="break-words text-sm font-medium text-slate-800 sm:text-right">
                          YOUR_BANK_NAME
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                        <span className="text-sm text-slate-500">
                          Account Number
                        </span>

                        <span className="break-words text-sm font-medium text-slate-800 sm:text-right">
                          YOUR_ACCOUNT_NUMBER
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                        <span className="text-sm text-slate-500">
                          Account Holder
                        </span>

                        <span className="break-words text-sm font-medium text-slate-800 sm:text-right">
                          YOUR_ACCOUNT_HOLDER
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 border-t border-slate-100 pt-4 sm:flex-row sm:justify-between sm:gap-4">
                        <span className="text-sm text-slate-500">
                          Transfer Amount
                        </span>

                        <span className="text-base font-bold text-blue-700 sm:text-right">
                          {formatVND(order.payment.amount)}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <span className="text-sm text-slate-500">
                          Transfer Note
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
                Payment information is not available for this order.
              </p>
            )}
          </section>

          {/* Order Summary */}
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
        </div>
      </div>
    </main>
  );
}
