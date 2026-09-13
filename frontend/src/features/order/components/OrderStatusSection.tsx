"use client";

import { useState } from "react";
import CancelOrderButton from "./CancelOrderButton";

type OrderStatusSectionProps = {
    orderId: number;
    orderNumber: string;
    initialStatus: string
}

export function OrderStatusSection ({
    orderId,
    orderNumber,
    initialStatus
}:OrderStatusSectionProps){
    const [Status, SetStatus] = useState(initialStatus);

    const handleCancelled = () =>
    {
        SetStatus("CANCELLED")
    }

    const handleRestore = () => {
        SetStatus(initialStatus);
    }

    return(
         <section className="mt-6 rounded border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Order Number</p>
          <p className="font-semibold">{orderNumber}</p>
        </div>

        <p className="font-semibold">{Status}</p>
      </div>

      {Status === "PENDING" && (
        <div className="mt-4">
          <CancelOrderButton
            orderId={orderId}
            onCancelled={handleCancelled}
            onRestore={handleRestore}
          />
        </div>
      )}
    </section>
  );

}
