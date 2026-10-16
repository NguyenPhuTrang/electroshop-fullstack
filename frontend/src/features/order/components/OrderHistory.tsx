
"use client";

import Link from "next/link";
import { useOrders } from "../hooks/useOrders";

export function OrderHistory() {
  const { orders, loading } = useOrders();

  const historyOrders = orders.filter(
    (order) => order.status === "DELIVERED"
  );

  if (loading) {
    return (
      <section className="space-y-5">
        <div className="animate-pulse space-y-2">
          <div className="h-7 w-44 rounded-lg bg-slate-200" />
          <div className="h-4 w-64 max-w-full rounded bg-slate-100" />
        </div>

        {[1, 2].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="h-5 w-40 rounded bg-slate-200" />

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="h-12 rounded-lg bg-slate-100" />
              <div className="h-12 rounded-lg bg-slate-100" />
              <div className="h-12 rounded-lg bg-slate-100" />
            </div>
          </div>
        ))}
      </section>
    );
  }

  if (orders.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center sm:py-16">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white text-blue-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.6}
            stroke="currentColor"
            className="h-8 w-8"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5v13.5H3.75zM3.75 10.5h16.5M8.25 3.75v6.75m7.5-6.75v6.75"
            />
          </svg>
        </div>

        <h2 className="mt-5 text-xl font-bold text-slate-800">
          No Orders Yet
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          You haven't placed any orders yet. Explore our products and
          find something you love.
        </p>

        <Link
          href="/products"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Start Shopping
          <span className="ml-2" aria-hidden="true">
            →
          </span>
        </Link>
      </section>
    );
  }

  if (historyOrders.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center sm:py-14">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-cyan-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.6}
            stroke="currentColor"
            className="h-7 w-7"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15l3.75-3.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>

        <h2 className="mt-4 text-lg font-bold text-slate-800">
          No Completed Orders
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          Your order history will appear here once an order has been delivered.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            Order History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            View your completed orders and payment details.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2">
          <span className="h-2 w-2 rounded-full bg-cyan-500" />

          <span className="text-sm font-medium text-blue-700">
            {historyOrders.length}{" "}
            {historyOrders.length === 1 ? "order" : "orders"} completed
          </span>
        </div>
      </div>

      {/* Order List */}
      <div className="space-y-4">
        {historyOrders.map((order) => (
          <article
            key={order.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-colors duration-200 hover:border-cyan-200"
          >
            {/* Order Header */}
            <div className="border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Order Number
                  </p>

                  <p className="mt-1 text-base font-bold text-slate-800">
                    #{order.orderNumber}
                  </p>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Delivered
                </span>
              </div>
            </div>

            {/* Order Information */}
            <div className="px-5 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Order Date
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Payment Status
                  </p>

                  <span className="mt-2 inline-flex rounded-lg border border-blue-100 bg-white px-2.5 py-1 text-sm font-medium text-blue-700">
                    {order.payment?.status ?? "N/A"}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Order Total
                  </p>

                  <p className="mt-1 text-xl font-bold tracking-tight text-blue-700">
                    {Number(order.total).toLocaleString("vi-VN")}{" "}
                    <span className="text-sm font-semibold">VND</span>
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
                <Link
                  href={`/orders/${order.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:border-blue-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  View Details
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
