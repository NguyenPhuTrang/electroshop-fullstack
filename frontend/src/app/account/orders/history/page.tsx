import { OrderHistory } from "@/src/features/order/components/OrderHistory";

export default function OrderHistoryPage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-bold">
        Order History
      </h1>

      <div className="mt-6">
        <OrderHistory />
      </div>
    </main>
  );
}