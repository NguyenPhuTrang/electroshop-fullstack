"use client";

import { useLocale, useTranslations } from "next-intl";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DashboardRange } from "@/src/features/dashboard/services/dashboard.service";

type SalesOverviewItem = {
  date: string;
  revenue: number | string;
};

type RevenueOverviewChartProps = {
  data: SalesOverviewItem[] | undefined;
  loading: boolean;
  range: DashboardRange;
};

export default function RevenueOverviewChart({
  data,
  loading,
  range,
}: RevenueOverviewChartProps) {
  const t = useTranslations("RevenueOverviewChart");
  const locale = useLocale();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  const formatDate = (
    value: string,
    options: Intl.DateTimeFormatOptions,
  ) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    const date = match
      ? new Date(
          Number(match[1]),
          Number(match[2]) - 1,
          Number(match[3]),
        )
      : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(locale, options).format(date);
  };

  const formatAxisDate = (value: string) =>
    formatDate(value, {
      month: "short",
      day: "numeric",
    });

  const formatTooltipDate = (value: string) =>
    formatDate(value, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            {t("title")}
          </h2>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            {t("description")}
          </p>
        </div>

        <span className="w-fit rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
          {t("lastDays", { range })}
        </span>
      </div>

      {/* Revenue Chart */}
      <div className="mt-6 h-72 w-full">
        {loading && !data ? (
          <div className="flex h-full items-center justify-center gap-3 text-sm text-slate-500">
            <span className="size-4 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600" />
            {t("loading")}
          </div>
        ) : !data?.length ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            {t("empty")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <CartesianGrid
                stroke="#e2e8f0"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tickFormatter={(value: string) => formatAxisDate(value)}
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                minTickGap={20}
              />

              <YAxis
                tickFormatter={(value: number) =>
                  value >= 1000
                    ? `${new Intl.NumberFormat(locale, {
                        maximumFractionDigits: 0,
                      }).format(value / 1000)}k`
                    : new Intl.NumberFormat(locale).format(value)
                }
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={48}
              />

              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value ?? 0)),
                  t("tooltip.revenue"),
                ]}
                labelFormatter={(label) =>
                  t("tooltip.dateLabel", {
                    date: formatTooltipDate(String(label)),
                  })
                }
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  fontSize: 12,
                }}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                name={t("tooltip.revenue")}
                stroke="#2563eb"
                strokeWidth={2}
                fill="#dbeafe"
                fillOpacity={0.8}
                activeDot={{
                  r: 4,
                  fill: "#2563eb",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </article>
  );
}