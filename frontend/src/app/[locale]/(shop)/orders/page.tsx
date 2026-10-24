
"use client";

import { useRouter } from "@/src/i18n/navigation";
import { useEffect, useState } from "react";

import OrderStatusBadge from "@/src/features/order/components/OrderStatusBadge";
import { getOrders } from "@/src/features/order/services/order.service";
import type { Order } from "@/src/features/order/types/order";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const router = useRouter();

  // Fetch Orders
  const fetchOrders = async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to get orders:", error);
      setLoadError("Unable to load your orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders();
  }, []);

  // Loading State
  if (isLoading) {
    return (
      <main
        className="min-h-screen bg-[#f7f8fa]"
        aria-busy="true"
        aria-label="Loading orders"
      >
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="mb-6 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="size-5 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600"
            />

            <div>
              <p className="text-sm font-semibold text-slate-700">
                Loading your orders...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Please wait while we fetch your order information.
              </p>
            </div>
          </div>

          <div className="mb-6 space-y-3">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-4 w-64 max-w-full animate-pulse rounded bg-slate-100" />
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="h-3 w-24 rounded bg-slate-100" />
                    <div className="h-5 w-36 rounded bg-slate-200" />
                  </div>

                  <div className="h-7 w-24 rounded-full bg-slate-100" />
                </div>

                <div className="mt-6 h-5 w-40 rounded bg-slate-100" />
                <div className="mt-5 h-10 w-32 rounded-lg bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  const visibleOrders = orders.filter(
    (order) => order.status !== "DELIVERED"
  );

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Page Header */}
        <section className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1">
              <span className="size-1.5 rounded-full bg-cyan-500" />

              <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-800 sm:text-xs">
                Order Management
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              My Orders
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Track your orders and view their details.
            </p>
          </div>

          {!loadError && (
            <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5">
              <span className="size-2 rounded-full bg-blue-500" />

              <span className="text-sm font-medium text-slate-700">
                {visibleOrders.length}{" "}
                {visibleOrders.length === 1 ? "active order" : "active orders"}
              </span>
            </div>
          )}
        </section>

        {/* Loading Error */}
        {loadError ? (
          <section className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-lg font-semibold text-rose-600">
              !
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Unable to Load Orders
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {loadError}
            </p>

            <button
              type="button"
              onClick={() => void fetchOrders()}
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Try Again
            </button>
          </section>
        ) : orders.length === 0 ? (
          /* No Orders */
          <section className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-blue-600">
              
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-7"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 1.97-1.68L23 6H5" />
                </svg>

            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No Orders Yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You haven't placed any orders yet. Browse our products to find something you love.
            </p>

            <button
              type="button"
              onClick={() => router.push("/products")}
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Start Shopping
              <span className="ml-2" aria-hidden="true">
                →
              </span>
            </button>
          </section>
        ) : visibleOrders.length === 0 ? (
          /* All Orders Delivered */
          <section className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600">
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                className="size-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9 12 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              All Orders Completed
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              All your orders have been delivered. You can review them in your order history.
            </p>

            <button
              type="button"
              onClick={() => router.push("/account/orders/history")}
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              View Order History
            </button>
          </section>
        ) : (
          /* Order List */
          <section className="space-y-4">
            {visibleOrders.map((order) => (
              <article
                key={order.id}
                className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-cyan-200 sm:p-6"
              >
                {/* Order Header */}
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Order Number
                    </p>

                    <p className="mt-1 text-base font-semibold text-slate-900">
                      #{order.orderNumber}
                    </p>
                  </div>

                  <div className="w-fit">
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>

                {/* Order Information */}
                <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Order Total
                    </p>

                    <p className="mt-1.5 text-xl font-bold tracking-tight text-blue-700">
                      {Number(order.total).toLocaleString("vi-VN")}{" "}
                      <span className="text-sm font-semibold">VND</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push(`/orders/${order.id}`)}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    View Details

                    <svg
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.7}
                      className="size-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14m-6-6 6 6-6 6"
                      />
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
