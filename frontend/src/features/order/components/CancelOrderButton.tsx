"use client";

import { useState } from "react";
import { toast } from "sonner";
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
    if (loading) return;

    setLoading(true);

    const toastId = toast.loading("Cancelling order...");

    // Optimistically update the order status.
    onCancelled(orderId);

    try {
      await cancelOrder(orderId);

      toast.success("Order cancelled successfully.", {
        id: toastId,
      });
    } catch (error) {
      console.error("Failed to cancel order:", error);

      // Restore the original order status if the request fails.
      onRestore(orderId);

      toast.error("Unable to cancel this order. Please try again.", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleCancelOrderButton()}
      disabled={loading}
      aria-label={loading ? "Canceling order..." : "Cancel order"}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-rose-200 border-t-rose-600"
          />
          Canceling...
        </>
      ) : (
        <>
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="m9 9 6 6m0-6-6 6" />
          </svg>

          Cancel Order
        </>
      )}
    </button>
  );
}