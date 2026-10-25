"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/src/i18n/navigation";

type RecentOrder = {
  id: number;
  orderNumber: string;
  user: {
    name: string;
  };
  total: number | string;
  status: string;
  createdAt: string;
};

type RecentOrdersTableProps = {
  orders: RecentOrder[];
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  CONFIRMED: "border-blue-200 bg-blue-50 text-blue-700",
  PROCESSING: "border-cyan-200 bg-cyan-50 text-cyan-700",
  SHIPPED: "border-indigo-200 bg-indigo-50 text-indigo-700",
  OUT_FOR_DELIVERY: "border-cyan-200 bg-cyan-50 text-cyan-700",
  DELIVERED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-rose-200 bg-rose-50 text-rose-700",
  CANCELED: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function RecentOrdersTable({
  orders,
}: RecentOrdersTableProps) {
  const t = useTranslations("RecentOrdersTable");
  const locale = useLocale();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const statusLabels: Record<string, string> = {
    PENDING: t("statuses.pending"),
    CONFIRMED: t("statuses.confirmed"),
    PROCESSING: t("statuses.processing"),
    SHIPPED: t("statuses.shipped"),
    OUT_FOR_DELIVERY: t("statuses.outForDelivery"),
    DELIVERED: t("statuses.delivered"),
    CANCELLED: t("statuses.cancelled"),
    CANCELED: t("statuses.canceled"),
  };

  const formatStatus = (status: string) =>
    statusLabels[status] ?? status.replaceAll("_", " ");

  return (
    <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex flex-col justify-between gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            {t("title")}
          </h2>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            {t("description")}
          </p>
        </div>

        <span className="w-fit text-xs font-medium text-slate-500">
          {t("latestOrders")}
        </span>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("columns.order")}
              </th>

              <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("columns.customer")}
              </th>

              <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("columns.total")}
              </th>

              <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("columns.status")}
              </th>

              <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("columns.date")}
              </th>

              <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("columns.action")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  {t("empty")}
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-slate-50"
                >
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">
                    #{order.orderNumber}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                    {order.user.name}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">
                    {formatCurrency(Number(order.total))}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                        STATUS_STYLES[order.status] ??
                        "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                    {formatDate(order.createdAt)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
                    >
                      {t("view")}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}