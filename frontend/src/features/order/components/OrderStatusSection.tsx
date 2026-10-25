"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import CancelOrderButton from "./CancelOrderButton";
import OrderStatusBadge from "./OrderStatusBadge";
import type { Order } from "../types/order";

type OrderStatusSectionProps = {
  orderId: number;
  orderNumber: string;
  initialStatus: Order["status"];
};

export function OrderStatusSection({
  orderId,
  orderNumber,
  initialStatus,
}: OrderStatusSectionProps) {
  const t = useTranslations("OrderStatusSection");

  const [status, setStatus] =
    useState<Order["status"]>(initialStatus);

  const handleCancelled = (cancelledOrderId: number) => {
    if (cancelledOrderId !== orderId) return;

    setStatus("CANCELLED");
  };

  const handleRestore = (restoredOrderId: number) => {
    if (restoredOrderId !== orderId) return;

    setStatus(initialStatus);
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      {/* Section Header */}
      <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-600">
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
          >
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 8h8M8 12h8M8 16h4" />
          </svg>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {t("header.title")}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {t("header.description")}
          </p>
        </div>
      </div>

      {/* Order Information */}
      <div className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {t("orderNumber")}
          </p>

          <p className="mt-1.5 break-words text-base font-semibold text-slate-900">
            #{orderNumber}
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {t("currentStatus")}
          </p>

          <OrderStatusBadge status={status} />
        </div>
      </div>

      {/* Cancel Order */}
      {status === "PENDING" && (
        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-800">
              {t("cancelOrder.title")}
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {t("cancelOrder.description")}
            </p>
          </div>

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