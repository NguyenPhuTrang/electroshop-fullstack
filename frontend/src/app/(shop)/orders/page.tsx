"use client";

import OrderStatusBadge from "@/src/features/order/components/OrderStatusBadge";
import { getOrders } from "@/src/features/order/services/order.service";
import { Order } from "@/src/features/order/types/order";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [Loding, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();

        setOrders(data);
      } catch (error) {
        console.log("Failed to get orders :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (Loding) {
    return <p className="p-6">Loading...</p>;
  }

  const visibleOrders = orders.filter(
    (order) => order.status !== "DELIVERED"
  );

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-bold">
        My Orders
      </h1>

      {visibleOrders.length === 0 ? (
        <p className="mt-6">
          You have no orders.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {visibleOrders.map((order) => (
            <div
              key={order.id}
              className="rounded border p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Order Number
                  </p>

                  <p className="font-semibold">
                    {order.orderNumber}
                  </p>
                </div>

                <p className="font-semibold">
                  <OrderStatusBadge status={order.status} />
                </p>
              </div>

              <p className="mt-4">
                Total:{" "}
                {Number(order.total).toLocaleString("vi-VN")} VND
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(`/orders/${order.id}`)
                }
                className="mt-4 rounded bg-black px-4 py-2 text-white"
              >
                View Detail
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}