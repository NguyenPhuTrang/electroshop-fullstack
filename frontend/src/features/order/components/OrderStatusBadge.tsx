
import type { Order } from "../types/order";

type OrderStatusBadgeProps = {
  status: Order["status"];
};

const statusStyles: Record<string, string> = {
  PENDING:
    "border-amber-200 bg-amber-50 text-amber-700",

  CONFIRMED:
    "border-blue-200 bg-blue-50 text-blue-700",

  PROCESSING:
    "border-blue-200 bg-blue-50 text-blue-700",

  SHIPPED:
    "border-cyan-200 bg-cyan-50 text-cyan-700",

  OUT_FOR_DELIVERY:
    "border-cyan-200 bg-cyan-50 text-cyan-700",

  DELIVERED:
    "border-emerald-200 bg-emerald-50 text-emerald-700",

  CANCELLED:
    "border-rose-200 bg-rose-50 text-rose-700",

  CANCELED:
    "border-rose-200 bg-rose-50 text-rose-700",

  FAILED:
    "border-rose-200 bg-rose-50 text-rose-700",
};

const statusDotStyles: Record<string, string> = {
  PENDING: "bg-amber-500",
  CONFIRMED: "bg-blue-500",
  PROCESSING: "bg-blue-500",
  SHIPPED: "bg-cyan-500",
  OUT_FOR_DELIVERY: "bg-cyan-500",
  DELIVERED: "bg-emerald-500",
  CANCELLED: "bg-rose-500",
  CANCELED: "bg-rose-500",
  FAILED: "bg-rose-500",
};

export default function OrderStatusBadge({
  status,
}: OrderStatusBadgeProps) {
  const normalizedStatus = String(status).toUpperCase();

  const badgeClass =
    statusStyles[normalizedStatus] ??
    "border-slate-200 bg-white text-slate-600";

  const dotClass =
    statusDotStyles[normalizedStatus] ?? "bg-slate-400";

  const label = normalizedStatus.replaceAll("_", " ");

  return (
    <span
      className={`inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${badgeClass}`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 shrink-0 rounded-full ${dotClass}`}
      />

      {label}
    </span>
  );
}
