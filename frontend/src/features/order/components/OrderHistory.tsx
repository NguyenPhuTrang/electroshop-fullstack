"use client";

import { useOrders } from "../hooks/useOrders";
import Link from "next/link";


export function OrderHistory() {
const {orders, loading} = useOrders();

if(loading) {
    return <p>Loading orders...</p>
}

const historyOrders = orders.filter(
    (order) => order.status === "DELIVERED"
);

if(orders.length === 0) {
    return <p>You have no orders yet</p>
}
return (
    <section className="space-y-4">
      {historyOrders.map((order) => (
        <div
          key={order.id}
          className="rounded-lg border p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">
                Order #{order.orderNumber}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Date:{" "}
                {new Date(order.createdAt).toLocaleDateString("en-US")}
              </p>
            </div>

            <p className="font-semibold">
              {Number(order.total).toLocaleString("vi-VN")} VND
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="space-y-1 text-sm">
              <p>
                Status:{" "}
                <span className="font-medium">
                  {order.status}
                </span>
              </p>

              <p>
                Payment Status:{" "}
                <span className="font-medium">
                  {order.payment?.status ?? "N/A"}
                </span>
              </p>
            </div>

            <Link
              href={`/orders/${order.id}`}
              className="rounded border px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              View Details
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}

