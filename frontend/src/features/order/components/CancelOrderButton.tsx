"use client"

import { useState } from "react";
import { cancelOrder } from "../services/order.service";

type CancelOrderButtonProps = {
  orderId: number;
  onCancelled: (orderId: number) => void;
  onRestore: (orderId: number) => void;
};

export default function CancelOrderButton({
  orderId,
  onCancelled,
  onRestore,
}: CancelOrderButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCancelOrderButton = async () => {
    setLoading(true);
    onCancelled(orderId); // ẩn ngay (optimistic)

    try {
      await cancelOrder(orderId);
    } catch (error) {
      console.error("Failed to cancel order", error);
      onRestore(orderId); // rollback vì thất bại
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCancelOrderButton}
      disabled={loading}
      className="rounded bg-red-500 px-4 py-2 text-white disabled:opacity-50"
    >
      {loading ? "Canceling..." : "Cancel Order"}
    </button>
  );
}